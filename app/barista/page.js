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
                        Big Brews - Barista Views
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
