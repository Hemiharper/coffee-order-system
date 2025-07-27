// app/api/orders/route.js

import { NextResponse } from 'next/server';
const Airtable = require('airtable');

// --- Helper function to initialize Airtable ---
const getAirtableBase = () => {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error("SERVER_CONFIG_ERROR: Missing Airtable API Key or Base ID.");
    }
    return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
};

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- API Route Handlers ---

export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}


export async function GET(request) {
  try {
    const base = getAirtableBase();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const filterFormula = `OR(Status != 'Collected', AND(Status = 'Collected', {Collected Timestamp} > '${fiveMinutesAgo}'))`;

    // === CHANGE IS HERE: Added Vercel's Data Cache ===
    // By using the native `fetch` and the `next: { revalidate: 3 }` option, we tell Vercel
    // to cache the response from Airtable for 3 seconds. This dramatically reduces the
    // number of direct API calls to Airtable.
    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Orders?sort%5B0%5D%5Bfield%5D=Order+Timestamp&sort%5B0%5D%5Bdirection%5D=asc&filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      next: {
        revalidate: 3, // Cache the response for 3 seconds
      },
    });

    if (!response.ok) {
        throw new Error(`Airtable API responded with status ${response.status}`);
    }

    const data = await response.json();
    const orders = data.records.map(record => ({
      id: record.id,
      ...record.fields
    }));
    // === END OF CHANGE ===

    return NextResponse.json(orders, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('--- AIRTABLE GET ERROR ---', error);
    return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  let body;
  try {
    const base = getAirtableBase();
    body = await request.json(); 
    
    const { name, coffeeType, milkOption, extras, notes } = body;

    if (!name || !coffeeType || !milkOption) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    const createdRecords = await base('Orders').create([
      {
        fields: {
          'Name': name,
          'Coffee Type': coffeeType,
          'Milk Option': milkOption,
          'Extras': extras && extras.length > 0 ? extras : null, 
          'Notes': notes || '',
          'Status': 'Pending',
        }
      }
    ]);

    const newOrder = {
        id: createdRecords[0].id,
        ...createdRecords[0].fields
    };

    return NextResponse.json(newOrder, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error('--- DETAILED AIRTABLE CREATION ERROR ---');
    console.error('Request Body That Caused Error:', JSON.stringify(body, null, 2));
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(request) {
    let body;
    try {
        const base = getAirtableBase();
        body = await request.json();
        const { id, status: newStatus } = body;

        if (!id || !newStatus) {
            return NextResponse.json({ message: 'Missing required fields for update' }, { status: 400, headers: corsHeaders });
        }
        
        const validStatuses = ['Pending', 'Ready', 'Collected'];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ message: `Invalid status` }, { status: 400, headers: corsHeaders });
        }

        let fieldsToUpdate = { 'Status': newStatus };

        if (newStatus === 'Ready') {
            const readyOrders = await base('Orders').select({
                filterByFormula: "{Status} = 'Ready'",
                fields: ["Collection Spot"]
            }).all();
            
            const usedSpots = readyOrders.map(record => record.get('Collection Spot')).filter(Boolean);

            let nextAvailableSpot = -1;
            for (let i = 1; i <= 20; i++) {
                if (!usedSpots.includes(i)) {
                    nextAvailableSpot = i;
                    break;
                }
            }

            if (nextAvailableSpot !== -1) {
                fieldsToUpdate['Collection Spot'] = nextAvailableSpot;
            } else {
                return NextResponse.json({ message: 'Error: All collection spots are currently full.' }, { status: 409 });
            }
        }
        
        if (newStatus === 'Pending') {
            fieldsToUpdate['Collection Spot'] = null;
        }
        
        const updatedRecords = await base('Orders').update([
            { id: id, fields: fieldsToUpdate }
        ]);

        const updatedOrder = {
            id: updatedRecords[0].id,
            ...updatedRecords[0].fields
        };

        return NextResponse.json(updatedOrder, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error('--- AIRTABLE PATCH ERROR ---', error);
        console.error('Request Body That Caused Error:', JSON.stringify(body, null, 2));
        return NextResponse.json({ message: 'Failed to update order', error: error.message }, { status: 500, headers: corsHeaders });
    }
}

export async function DELETE(request) {
    try {
        const base = getAirtableBase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing order ID for deletion' }, { status: 400, headers: corsHeaders });
        }

        await base('Orders').destroy([id]);
        return NextResponse.json({ message: 'Order successfully cancelled' }, { status: 204, headers: corsHeaders });

    } catch (error) {
        console.error('--- AIRTABLE DELETE ERROR ---', error);
        return NextResponse.json({ message: 'Failed to cancel order', error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders });
    }
}
