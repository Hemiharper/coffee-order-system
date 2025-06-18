// app/api/orders/route.js (Corrected Version)

import { NextResponse } from 'next/server';
const Airtable = require('airtable');

// --- Airtable Initialization ---
// This section checks for the necessary environment variables and initializes the base.
// It will log a clear error to the Vercel console if the variables are missing.
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error("CRITICAL: Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variables!");
}

const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);


// --- CORS Headers ---
// These headers are necessary to allow your frontend application to make requests to this API route.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In a real production app, you should restrict this to your domain: e.g., 'https://coffee-order-system.vercel.app'
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


// --- API Route Handlers ---

/**
 * Handles OPTIONS requests for CORS preflight. This is necessary for browsers to
 * determine if the actual request (e.g., POST, PATCH) is safe to send.
 */
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}


/**
 * Handles GET requests to fetch all orders from Airtable.
 */
export async function GET(request) {
  try {
    const records = await base('Orders').select({
      sort: [{ field: "Order Timestamp", direction: "asc" }]
    }).all(); // .all() is safer as it paginates through all records automatically.

    // Map records to a more friendly format for the frontend.
    const orders = records.map(record => ({
      id: record.id,
      ...record.fields // Use the spread operator for a cleaner mapping
    }));

    return NextResponse.json(orders, { status: 200, headers: corsHeaders });

  } catch (error) {
    // **Enhanced Error Logging**
    console.error('--- DETAILED AIRTABLE FETCH ERROR ---');
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    console.error('--- END OF ERROR DETAILS ---');
    
    return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

/**
 * Handles POST requests to create a new order in Airtable.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, coffeeType, milkOption, notes } = body;

    // Basic validation
    if (!name || !coffeeType || !milkOption) {
      return NextResponse.json({ message: 'Missing required fields: name, coffeeType, milkOption' }, { status: 400, headers: corsHeaders });
    }

    const createdRecords = await base('Orders').create([
      {
        fields: {
          'Name': name,
          'Coffee Type': coffeeType,
          'Milk Option': milkOption,
          'Notes': notes || '', // Default to empty string if notes are null/undefined
          'Status': 'Pending',
          // 'Order Timestamp' is REMOVED. Airtable will set this automatically.
        }
      }
    ]);

    const newOrder = {
        id: createdRecords[0].id,
        ...createdRecords[0].fields
    };

    return NextResponse.json(newOrder, { status: 201, headers: corsHeaders });

  } catch (error) {
    // **Enhanced Error Logging**
    console.error('--- DETAILED AIRTABLE CREATION ERROR ---');
    console.log('Request Body Received:', JSON.stringify(await request.json().catch(() => "Could not parse body"))); // Log what was sent
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    console.error('--- END OF ERROR DETAILS ---');

    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

/**
 * Handles PATCH requests to update an order's status.
 */
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
            {
                id: id,
                fields: {
                    'Status': status,
                }
            }
        ]);

        const updatedOrder = {
            id: updatedRecords[0].id,
            ...updatedRecords[0].fields
        };

        return NextResponse.json(updatedOrder, { status: 200, headers: corsHeaders });

    } catch (error) {
        // **Enhanced Error Logging**
        console.error('--- DETAILED AIRTABLE UPDATE ERROR ---');
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        console.error('--- END OF ERROR DETAILS ---');
        
        return NextResponse.json({ message: 'Failed to update order', error: error.message }, { status: 500, headers: corsHeaders });
    }
}

/**
 * Handles DELETE requests to cancel/remove an order.
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing order ID for deletion.' }, { status: 400, headers: corsHeaders });
        }

        await base('Orders').destroy([id]);

        return NextResponse.json({ message: 'Order successfully cancelled.' }, { status: 204, headers: corsHeaders }); // 204 No Content is more appropriate for a successful DELETE

    } catch (error) {
        // **Enhanced Error Logging**
        console.error('--- DETAILED AIRTABLE DELETION ERROR ---');
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        console.error('--- END OF ERROR DETAILS ---');
        
        return NextResponse.json({ message: 'Failed to cancel order', error: error.message }, { status: 500, headers: corsHeaders });
    }
}
