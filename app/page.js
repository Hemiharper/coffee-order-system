// app/page.js

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
    const [customerOrderId, setCustomerOrderId] = useState(null);
    const [allOrders, setAllOrders] = useState([]);
    const [customerTab, setCustomerTab] = useState('order');
    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // === CHANGE IS HERE: Load order ID from localStorage on initial mount ===
    useEffect(() => {
        // This code runs only once on the client-side after the component mounts.
        const savedOrderId = localStorage.getItem('customerOrderId');
        if (savedOrderId) {
            setCustomerOrderId(savedOrderId);
            // If we find a saved order, it makes sense to start on the status tab.
            setCustomerTab('status'); 
        }
    }, []); // Empty dependency array ensures this runs only once.


    const fetchOrders = useCallback(async () => {
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
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);


    const handleOrder = async (orderDetails) => {
        setIsLoading(true);
        setError(null);
        try {
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
            // === CHANGE IS HERE: Save the new order ID to state and localStorage ===
            setCustomerOrderId(newOrder.id);
            localStorage.setItem('customerOrderId', newOrder.id);
            
            await fetchOrders();
            setCustomerTab('status');
            
        } catch (err) {
            console.error('Failed to place order:', err);
            setError(`Failed to place order: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const cancelOrder = async (orderId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });

            if (response.ok) {
                // === CHANGE IS HERE: Remove the order ID from state and localStorage ===
                setCustomerOrderId(null);
                localStorage.removeItem('customerOrderId');

                await fetchOrders();
                setCustomerTab('order');
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
    

    const myOrder = allOrders.find(order => order.id === customerOrderId);

    // === CHANGE IS HERE: If an order is marked as "Collected", clear it from localStorage ===
    // This effect runs whenever 'myOrder' changes.
    useEffect(() => {
        if (myOrder && myOrder.Status === 'Collected') {
            // Set a timeout to clear the order after a short delay so the user can see the "Collected" status.
            setTimeout(() => {
                setCustomerOrderId(null);
                localStorage.removeItem('customerOrderId');
            }, 3000); // 3-second delay
        }
    }, [myOrder]);


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

                        <div className="mt-8 min-h-[250px]">
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
