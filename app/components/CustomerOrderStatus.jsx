// app/api/orders/route.js (Corrected Version)

import { NextResponse } from 'next/server';
const Airtable = require('airtable');

// --- Airtable Initialization ---
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error("CRITICAL: Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variables!");
}
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);


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
    const records = await base('Orders').select({
      sort: [{ field: "Order Timestamp", direction: "asc" }]
    }).all();

    const orders = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return NextResponse.json(orders, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('--- DETAILED AIRTABLE FETCH ERROR ---');
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Destructure all expected fields, including the new 'extras' field
    const { name, coffeeType, milkOption, extras, notes } = body;

    if (!name || !coffeeType || !milkOption) {
      return NextResponse.json({ message: 'Missing required fields: name, coffeeType, milkOption' }, { status: 400, headers: corsHeaders });
    }

    const createdRecords = await base('Orders').create([
      {
        fields: {
          'Name': name,
          'Coffee Type': coffeeType,
          'Milk Option': milkOption,
          'Extras': extras || null, // Save extras, or null if it's empty/undefined
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
    // Log the body to see what data caused the error
    const errorBody = await request.json().catch(() => "Could not parse request body");
    console.error('--- DETAILED AIRTABLE CREATION ERROR ---');
    console.error('Request Body Received:', JSON.stringify(errorBody, null, 2));
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    console.error('--- END OF ERROR DETAILS ---');

    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}


export async function PATCH(request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ message: 'Missing required fields for update: id, status' }, { status: 400, headers: corsHeaders });
        }
        
        const validStatuses = ['Pending', 'Ready', 'Collected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: `Invalid status: '${status}'` }, { status: 400, headers: corsHeaders });
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
        console.error('--- DETAILED AIRTABLE UPDATE ERROR ---');
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        return NextResponse.json({ message: 'Failed to update order', error: error.message }, { status: 500, headers: corsHeaders });
    }
}


export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing order ID for deletion.' }, { status: 400, headers: corsHeaders });
        }

        await base('Orders').destroy([id]);
        return NextResponse.json({ message: 'Order successfully cancelled.' }, { status: 204, headers: corsHeaders });

    } catch (error) {
        console.error('--- DETAILED AIRTABLE DELETION ERROR ---');
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        return NextResponse.json({ message: 'Failed to cancel order', error: error.message }, { status: 500, headers: corsHeaders });
    }
}
