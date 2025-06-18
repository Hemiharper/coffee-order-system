// app/page.js (Customer View - Fully Corrected)

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Coffee, Clock, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import OrderForm from '@/app/components/OrderForm';
import CustomerOrderStatus from '@/app/components/CustomerOrderStatus';
import Link from 'next/link';

export default function HomePage() {
    // State to hold the ID of the order placed in THIS browser session.
    const [customerOrderId, setCustomerOrderId] = useState(null);
    // State for the list of ALL orders from the server.
    const [allOrders, setAllOrders] = useState([]);
    
    const [customerTab, setCustomerTab] = useState('order');
    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start as true on initial load
    const [error, setError] = useState(null);

    // --- STABILIZED FETCH LOGIC ---
    // fetchOrders is wrapped in useCallback to prevent it from being recreated on every render.
    // This is the key to stopping the infinite refresh loop.
    const fetchOrders = useCallback(async () => {
        // We don't set isLoading to true here because polling should happen in the background.
        setError(null);
        try {
            const response = await fetch('/api/orders', { cache: 'no-store' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError(`Failed to load orders. A refresh may be needed.`);
        } finally {
            // Only set isLoading to false on the initial load.
            setIsLoading(false);
        }
    }, []); // Empty dependency array [] means this function is created only ONCE.

    // --- EFFECT FOR INITIAL LOAD AND POLLING ---
    useEffect(() => {
        fetchOrders(); // Fetch immediately on component mount.

        const interval = setInterval(() => {
            fetchOrders(); // Poll for new data.
        }, 5000); // Poll every 5 seconds.

        // Cleanup function to stop polling when the component is removed.
        return () => clearInterval(interval);
    }, [fetchOrders]); // This effect now correctly and safely depends on the stable fetchOrders function.

    // --- Handler for placing a new order ---
    const handleOrder = async (orderDetails) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Sending order data:', orderDetails);
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to place order: HTTP status ${response.status}`);
            }
            
            const newOrder = await response.json();
            setCustomerOrderId(newOrder.id); // IMPORTANT: Track the ID of the order we just placed.
            await fetchOrders(); // Refresh orders to include the new one.
            setCustomerTab('status'); // Switch to status view.
            
        } catch (err) {
            console.error('Failed to place order:', err);
            setError(`Failed to place order: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handler for cancelling an order ---
    const cancelOrder = async (orderId) => {
        // Use a simple custom modal/confirm if needed, avoiding window.confirm for robustness
        // For now, we proceed directly for simplicity.
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });

            if (response.ok) {
                await fetchOrders();
                setCustomerOrderId(null); // Untrack the order ID
                setCustomerTab('order'); // Go back to the order form
                setShowCancelAlert(true);
                setTimeout(() => setShowCancelAlert(false), 4000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to cancel order: HTTP status ${response.status}`);
            }
        } catch (err) {
            console.error('Failed to cancel order:', err);
            setError(`Failed to cancel order: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Find the specific order that belongs to this customer's session.
    const myOrder = allOrders.find(order => order.id === customerOrderId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-3 sm:p-6">
            <Card className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center justify-between text-2xl sm:text-3xl font-bold">
                        <div className="flex items-center gap-3">
                            <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />
                            Big Brews
                        </div>
                        <Link href="/barista">
                            <Button variant="outline" className="flex items-center gap-2 text-sm">
                                <Eye className="w-4 h-4" /> Barista View
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                    <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-2 h-14 text-base">
                            <TabsTrigger value="order" className="flex items-center gap-2">
                                <Coffee className="w-5 h-5" /> Place Order
                            </TabsTrigger>
                            <TabsTrigger value="status" className="flex items-center gap-2">
                                <Clock className="w-5 h-5" /> Order Status
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8 min-h-[250px]"> {/* Added min-height to prevent layout shifts */}
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <TabsContent value="order" className="mt-0">
                                {showCancelAlert && (
                                    <Alert className="bg-green-50 border-green-200 mb-4">
                                        <AlertDescription className="text-green-800">
                                            Order cancelled successfully!
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <OrderForm onOrder={handleOrder} isLoading={isLoading} />
                            </TabsContent>

                            <TabsContent value="status" className="mt-0">
                                {isLoading && !myOrder ? (
                                    <p className="text-center text-gray-500 pt-8">Loading...</p>
                                ) : myOrder ? (
                                    <CustomerOrderStatus
                                        // Pass ONLY the customer's order to the status component
                                        order={myOrder}
                                        onCancelOrder={cancelOrder}
                                    />
                                ) : (
                                    <p className="text-center text-gray-500 pt-8">
                                        Your order status will appear here once you've placed an order.
                                    </p>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
