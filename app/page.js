// app/page.js

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    
    const prevMyOrderRef = useRef();

    // === NOTIFICATION LOGIC START ===

    // This is now a dedicated, safe function for showing the notification.
    const showReadyNotification = (order) => {
        // Ensure this code only runs in the browser and permission has been granted.
        if (typeof window === 'undefined' || !("Notification" in window) || Notification.permission !== "granted") {
            return;
        }

        // Defensive check to ensure all data is present before firing.
        const coffeeType = order?.['Coffee Type'];
        if (!coffeeType) {
            return;
        }

        const spotNumber = order['Collection Spot'] ? `at spot #${order['Collection Spot']}` : '';
        const notificationBody = `Your ${coffeeType} is ready for pickup ${spotNumber}.`;
        
        new Notification("Your coffee is ready!", {
            body: notificationBody,
            icon: "/favicon.ico" // Using a relative path for the icon
        });
    };

    const myOrder = allOrders.find(order => order.id === customerOrderId);

    // This effect now safely watches for the status change and calls our dedicated function.
    useEffect(() => {
        const prevMyOrder = prevMyOrderRef.current;
        
        if (myOrder && prevMyOrder && prevMyOrder.Status !== 'Ready' && myOrder.Status === 'Ready') {
            showReadyNotification(myOrder);
        }
        
        prevMyOrderRef.current = myOrder;
    }, [myOrder]);

    // === NOTIFICATION LOGIC END ===


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
            // Permission is still requested on user action for best compatibility.
            if ("Notification" in window && Notification.permission !== "granted") {
                await Notification.requestPermission();
            }

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
                                        onMarkCollected={handleMarkCollected}
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
