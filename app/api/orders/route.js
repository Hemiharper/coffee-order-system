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
  'Access-control-allow-headers': 'Content-Type, Authorization',
};

// --- API Route Handlers ---

export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}


export async function GET(request) {
  try {
    const base = getAirtableBase();

    // === CHANGE IS HERE: Auto-hide old collected orders ===
    // This formula tells Airtable to only return records that meet one of two conditions:
    // 1. The status is NOT 'Collected'.
    // 2. The status IS 'Collected', but the time since it was last modified is less than or equal to 5 minutes.
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const filterFormula = `OR(Status != 'Collected', AND(Status = 'Collected', {Collected Timestamp} > '${fiveMinutesAgo}'))`;

    const records = await base('Orders').select({
      sort: [{ field: "Order Timestamp", direction: "asc" }],
      filterByFormula: filterFormula, // Apply the filter here
    }).all();
    // === END OF CHANGE ===


    const orders = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

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
    console.error('--- END OF ERROR DETAILS ---');
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(request) {
    try {
        const base = getAirtableBase();
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ message: 'Missing required fields for update' }, { status: 400, headers: corsHeaders });
        }
        
        const validStatuses = ['Pending', 'Ready', 'Collected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: `Invalid status` }, { status: 400, headers: corsHeaders });
        }

        const updatedRecords = await base('Orders').update([
            { id: id, fields: { 'Status': status } }
        ]);

        const updatedOrder = {
            id: updatedRecords[0].id,
            ...updatedRecords[0].fields
        };

        return NextResponse.json(updatedOrder, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error('--- AIRTABLE PATCH ERROR ---', error);
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
