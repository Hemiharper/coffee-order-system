// app/page.js

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Coffee, Clock, Eye, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import OrderForm from '@/app/components/OrderForm';
import CustomerOrderStatus from '@/app/components/CustomerOrderStatus';
import QueueView from '@/app/components/QueueView';
import Link from 'next/link';

export default function HomePage() {
    const [customerOrderId, setCustomerOrderId] = useState(null);
    const [allOrders, setAllOrders] = useState([]);
    const [customerTab, setCustomerTab] = useState('order');
    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const savedOrderId = localStorage.getItem('customerOrderId');
        if (savedOrderId) {
            setCustomerOrderId(savedOrderId);
            setCustomerTab('status'); 
        }
    }, []);


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
    
    const handleMarkCollected = async (orderId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: 'Collected' }),
            });

            if (response.ok) {
                setCustomerOrderId(null);
                localStorage.removeItem('customerOrderId');
                setCustomerTab('order'); 
            } else {
                 const errorData = await response.json();
                throw new Error(errorData.message || `Failed to mark order as collected: HTTP status ${response.status}`);
            }
        } catch(err) {
            console.error('Failed to mark collected:', err);
            setError(`Failed to mark order as collected: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

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
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                    <div>
                        <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full">
                            {/* === CHANGE IS HERE: Updated class for responsiveness === */}
                            <TabsList className="w-full grid grid-cols-3 h-auto text-center">
                                <TabsTrigger value="order" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                                    <Coffee className="w-5 h-5" />
                                    <span>Place Order</span>
                                </TabsTrigger>
                                <TabsTrigger value="status" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                                    <Clock className="w-5 h-5" />
                                    <span>Order Status</span>
                                </TabsTrigger>
                                <TabsTrigger value="queue" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                                    <Users className="w-5 h-5" />
                                    <span>Queue</span>
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
                                        <p className="text-center text-gray-500 pt-8">Loading Orders...</p>
                                    ) : myOrder ? (
                                        <CustomerOrderStatus
                                            order={myOrder}
                                            onCancelOrder={cancelOrder}
                                            onMarkCollected={handleMarkCollected}
                                        />
                                    ) : (
                                        <p className="text-center text-gray-500 pt-8">
                                            Your order status will appear here once you've placed an order.
                                        </p>
                                    )}
                                </TabsContent>

                                <TabsContent value="queue" className="mt-0">
                                    <QueueView orders={allOrders} customerOrderId={customerOrderId} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
