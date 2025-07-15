// app/barista/page.js

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Coffee, Loader2 } from 'lucide-react';
import BaristaView from '@/app/components/BaristaView';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

export default function BaristaPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    // State is now an array to handle multiple "sticky" orders
    const [recentlyReadyOrderIds, setRecentlyReadyOrderIds] = useState([]);

    const fetchOrders = useCallback(async () => {
        setError(null);
        try {
            const response = await fetch('/api/orders', { cache: 'no-store' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError(`Failed to load orders. It will retry automatically.`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => {
            fetchOrders();
        }, 3000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateOrderStatus = async (orderId, newStatus) => {
        setIsUpdating(true);
        setError(null);
        try {
            const response = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (response.ok) {
                // === FIX IS HERE: The state is now updated BEFORE the data is re-fetched ===
                // This prevents a timing issue where the new order list would arrive before
                // the app knew which order to make "sticky".
                if (newStatus === 'Ready') {
                    setRecentlyReadyOrderIds(prevIds => [...prevIds, orderId]);
                    
                    // After 10 seconds, remove this specific ID from the array.
                    setTimeout(() => {
                        setRecentlyReadyOrderIds(prevIds => prevIds.filter(id => id !== orderId));
                    }, 10000);
                }
                
                // Now, re-fetch the orders to get the latest data from the server.
                await fetchOrders();

            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update order status: HTTP status ${response.status}`);
            }
        } catch (err) {
            console.error('Failed to update order:', err);
            setError(`Failed to update order status: ${err.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-3 sm:p-6">
            <Card className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold">
                        <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />
                        Big Brews - Barista
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center pt-16">
                            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                            <span className="ml-3 text-lg text-gray-600">Loading initial orders...</span>
                        </div>
                    ) : error ? (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : (
                        <BaristaView
                            orders={orders}
                            onUpdateOrderStatus={updateOrderStatus}
                            isUpdating={isUpdating}
                            // Pass the array of sticky IDs
                            recentlyReadyOrderIds={recentlyReadyOrderIds}
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
