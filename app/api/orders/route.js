// app/api/orders/route.js (MODIFIED - with NEXT_PUBLIC_ env vars)

import { NextResponse } from 'next/server'; // This is for App Router
const Airtable = require('airtable');

// Add a check to confirm env vars are loaded - this will appear in Vercel logs if missing
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variables!");
    // In a production app, you might want to throw an error or handle this more gracefully
    // For debugging, console.error is enough.
}

// Initialize Airtable with your API Key and Base ID from Vercel Environment Variables
const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

// Set CORS headers for security and cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Be more restrictive in production, e.g., your domain
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// Handle GET requests (Fetch all orders)
export async function GET(request) {
  try {
    const records = await base('Orders').select({
      sort: [{ field: "Order Timestamp", direction: "asc" }] // Get orders in chronological order
    }).firstPage();

    const orders = records.map(record => ({
      id: record.id,
      name: record.get('Name'),
      coffeeType: record.get('Coffee Type'),
      milkOption: record.get('Milk Option'),
      notes: record.get('Notes'),
      status: record.get('Status'),
      orderTimestamp: record.get('Order Timestamp'),
    }));

    return NextResponse.json(orders, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Error fetching orders from Airtable:", error);
    // Provide a more specific error message if the base object wasn't initialized
    if (!base.table) { // A crude check if base isn't properly set up
        return NextResponse.json({ message: 'Server configuration error: Airtable not initialized. Check environment variables.', error: error.message }, { status: 500, headers: corsHeaders });
    }
    return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// Handle POST requests (Create a new order)
export async function POST(request) {
  try {
    const { name, coffeeType, milkOption, notes } = await request.json(); // Use request.json() for App Router

    if (!name || !coffeeType || !milkOption) {
      return NextResponse.json({ message: 'Missing required fields: name, coffeeType, milkOption' }, { status: 400, headers: corsHeaders });
    }

    const createdRecords = await base('Orders').create([
      {
        fields: {
          'Name': name,
          'Coffee Type': coffeeType,
          'Milk Option': milkOption,
          'Notes': notes || '', // Ensure notes is not undefined
          'Status': 'Pending', // New orders start as Pending
          'Order Timestamp': new Date().toISOString(), // Automatically set current time
        }
      }
    ]);
    const newOrder = createdRecords[0];

    return NextResponse.json({
      id: newOrder.id,
      name: newOrder.get('Name'),
      coffeeType: newOrder.get('Coffee Type'),
      milkOption: newOrder.get('Milk Option'),
      notes: newOrder.get('Notes'),
      status: newOrder.get('Status'),
      orderTimestamp: newOrder.get('Order Timestamp'),
    }, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error("Error creating order in Airtable:", error);
    if (!base.table) {
        return NextResponse.json({ message: 'Server configuration error: Airtable not initialized. Check environment variables.', error: error.message }, { status: 500, headers: corsHeaders });
    }
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// Handle PATCH requests (Update an existing order's status)
export async function PATCH(request) {
  try {
    const { id, status } = await request.json(); // Use request.json() for App Router

    if (!id || !status) {
      return NextResponse.json({ message: 'Missing required fields for update: id, status' }, { status: 400, headers: corsHeaders });
    }

    const validStatuses = ['Pending', 'Ready', 'Collected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400, headers: corsHeaders });
    }

    const updatedRecords = await base('Orders').update([
      {
        id: id,
        fields: {
          'Status': status,
        }
      }
    ]);
    const updatedOrder = updatedRecords[0];

    return NextResponse.json({
      id: updatedOrder.id,
      name: updatedOrder.get('Name'),
      coffeeType: updatedOrder.get('Coffee Type'),
      milkOption: updatedOrder.get('Milk Option'), // Corrected here previously, assuming it matches Airtable
      notes: updatedOrder.get('Notes'),
      status: updatedOrder.get('Status'),
      orderTimestamp: updatedOrder.get('Order Timestamp'),
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Error updating order in Airtable:", error);
    if (!base.table) {
        return NextResponse.json({ message: 'Server configuration error: Airtable not initialized. Check environment variables.', error: error.message }, { status: 500, headers: corsHeaders });
    }
    return NextResponse.json({ message: 'Failed to update order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// Handle DELETE requests (Cancel an order)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url); // Get query parameters from request URL
    const id = searchParams.get('id'); // 'id' will be passed as a query parameter (e.g., /api/orders?id=recXYZ)

    if (!id) {
      return NextResponse.json({ message: 'Missing order ID for deletion.' }, { status: 400, headers: corsHeaders });
    }

    await base('Orders').destroy([id]);
    return NextResponse.json({ message: 'Order successfully cancelled.' }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Error deleting order from Airtable:", error);
    if (!base.table) {
        return NextResponse.json({ message: 'Server configuration error: Airtable not initialized. Check environment variables.', error: error.message }, { status: 500, headers: corsHeaders });
    }
    return NextResponse.json({ message: 'Failed to cancel order', error: error.message }, { status: 500, headers: corsHeaders });
  }
}
