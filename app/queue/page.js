// app/queue/page.js

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Coffee, Loader2 } from 'lucide-react';
import QueueView from '@/app/components/QueueView'; // We will update this component next
import { Alert, AlertDescription } from '@/app/components/ui/alert';

export default function PublicQueuePage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);

    // Fetching logic, similar to the barista and customer pages
    const fetchOrders = useCallback(async () => {
        // Don't show main loader during polling
        if (!isLoading) setIsLoading(true); 
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
    }, [isLoading]); // Dependency ensures loader state is managed correctly

    // Effect for initial load and polling
    useEffect(() => {
        fetchOrders();
        // Use a fast polling rate for a real-time feel on the tablet
        const interval = setInterval(fetchOrders, 3000); 
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Handler for the "Mark as Collected" button
    const handleMarkCollected = async (orderId) => {
        setIsUpdating(true);
        setError(null);
        try {
            const response = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: 'Collected' }),
            });

            if (response.ok) {
                // Refresh the order list immediately after a successful update
                await fetchOrders();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update status: HTTP status ${response.status}`);
            }
        } catch (err) {
            console.error('Failed to mark collected:', err);
            setError(`Failed to mark order as collected: ${err.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold">
                        <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />
                        Big Brews Queue
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                    {isLoading && orders.length === 0 ? (
                        <div className="flex items-center justify-center pt-16">
                            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                            <span className="ml-3 text-lg text-gray-600">Loading the queue...</span>
                        </div>
                    ) : error ? (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : (
                        <QueueView
                            orders={orders}
                            // Pass the handler down to the QueueView component
                            onMarkCollected={handleMarkCollected}
                            // Pass the updating state to disable buttons during an action
                            isUpdating={isUpdating}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
