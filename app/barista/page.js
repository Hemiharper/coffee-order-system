// app/barista/page.js (Barista View - Fully Corrected)



'use client';



import React, { useState, useEffect, useCallback } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

import { Coffee, Loader2 } from 'lucide-react';

import BaristaView from '@/app/components/BaristaView';

import Link from 'next/link';

import { Alert, AlertDescription } from '@/app/components/ui/alert';



export default function BaristaPage() {

    const [orders, setOrders] = useState([]);

    const [isLoading, setIsLoading] = useState(true); // Set to true initially for the first load

    const [isUpdating, setIsUpdating] = useState(false); // A separate state for update actions

    const [error, setError] = useState(null);



    // --- STABILIZED FETCH LOGIC ---

    // Wrapped in useCallback to prevent the infinite refresh loop.

    const fetchOrders = useCallback(async () => {

        setError(null);

        try {

            const response = await fetch('/api/orders', { cache: 'no-store' });

            if (!response.ok) {

                const errorData = await response.json();

                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);

            }

            const data = await response.json();

            // The sorting logic in BaristaView is more complex, so we pass the raw data.

            // If you prefer to sort here, you can.

            setOrders(data);

        } catch (err) {

            console.error('Failed to fetch orders:', err);

            setError(`Failed to load orders. It will retry automatically.`);

        } finally {

            // This ensures the main loader only shows on the very first fetch.

            setIsLoading(false);

        }

    }, []); // Empty dependency array means this function is created only once.



    // --- EFFECT FOR INITIAL LOAD AND POLLING ---

    useEffect(() => {

        fetchOrders(); // Initial fetch



        const interval = setInterval(() => {

            fetchOrders(); // Subsequent fetches for polling

        }, 3000); // Poll every 3 seconds



        return () => clearInterval(interval); // Cleanup on unmount

    }, [fetchOrders]); // Safely depends on the memoized fetchOrders function.



    // --- Handler for updating an order's status ---

    const updateOrderStatus = async (orderId, newStatus) => {

        setIsUpdating(true); // Use a specific state for this action

        setError(null);

        try {

            const response = await fetch('/api/orders', {

                method: 'PATCH',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ id: orderId, status: newStatus }),

            });



            if (response.ok) {

                await fetchOrders(); // Refresh orders immediately after successful update

            } else {

                const errorData = await response.json();

                throw new Error(errorData.message || `Failed to update order status: HTTP status ${response.status}`);

            }

        } catch (err) {

            console.error('Failed to update order:', err);

            setError(`Failed to update order status: ${err.message}`);

        } finally {

            setIsUpdating(false); // End the update-specific loading state

        }

    };



    return (

        <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-3 sm:p-6">

            <Card className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl">

                <CardHeader className="pb-6">

                    <CardTitle className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold">

                        <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />

                        Coffee Order System - Barista

                    </CardTitle>

                </CardHeader>

                <CardContent className="px-6 min-h-[400px]">

                    {/* Show main loader only on the initial page load */}

                    {isLoading ? (

                        <div className="flex items-center justify-center pt-16">

                            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />

                            <span className="ml-3 text-lg text-gray-600">Loading initial orders...</span>

                        </div>

                    ) : error ? (

                         // Show a prominent error message if fetching fails

                        <Alert variant="destructive" className="mt-4">

                            <AlertDescription>{error}</AlertDescription>

                        </Alert>

                    ) : (

                        // Once loaded, show the main BaristaView component

                        <BaristaView

                            orders={orders}

                            onUpdateOrderStatus={updateOrderStatus}

                            isUpdating={isUpdating} // Pass the updating state down to disable buttons during action

                        />

                    )}

                </CardContent>

                <div className="p-6 border-t border-gray-200 bg-gray-50 text-center">

                    <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">

                        ← Back to Customer Order Form

                    </Link>

                </div>

            </Card>

        </div>

    );

}



And then app/api/orders/route.js 



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

