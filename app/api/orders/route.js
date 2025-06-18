// app/api/orders/route.js (Hotfix)

import { NextResponse } from 'next/server';
const Airtable = require('airtable');

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- Helper function to initialize Airtable ---
// This ensures the client is created with fresh (and available) env vars for each request.
const getAirtableBase = () => {
    // This check now happens safely inside a function call
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error("SERVER_CONFIG_ERROR: Missing Airtable API Key or Base ID.");
    }
    return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
};

// --- API Route Handlers ---

export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}


export async function GET(request) {
  try {
    const base = getAirtableBase(); // Initialize base here
    const records = await base('Orders').select({
      sort: [{ field: "Order Timestamp", direction: "asc" }]
    }).all();

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
  try {
    const base = getAirtableBase(); // Initialize base here
    const body = await request.json();
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
          'Extras': extras || null,
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
    console.error('--- AIRTABLE POST ERROR ---', error);
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(request) {
    try {
        const base = getAirtableBase(); // Initialize base here
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
        const base = getAirtableBase(); // Initialize base here
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing order ID for deletion' }, { status: 400, headers: corsHeaders });
        }

        await base('Orders').destroy([id]);
        return NextResponse.json({ message: 'Order successfully cancelled' }, { status: 204, headers: corsHeaders });

    } catch (error) {
        console.error('--- AIRTABLE DELETE ERROR ---', error);
        return NextResponse.json({ message: 'Failed to cancel order', error: error.message }, { status: 500, headers: corsHeaders });
    }
}
