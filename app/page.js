'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Coffee, Clock, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import OrderForm from '@/app/components/OrderForm';
import CustomerOrderStatus from '@/app/components/CustomerOrderStatus';
import Link from 'next/link';

export default function HomePage() {
  const [orders, setOrders] = useState([]);
  const [customerTab, setCustomerTab] = useState('order');
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  // Load orders and set up polling
  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleOrder = async (orderDetails) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh orders
        setCustomerTab('status'); // Switch to status view
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchOrders();
        setShowCancelAlert(true);
        setTimeout(() => setShowCancelAlert(false), 3000);
      } else {
        alert('Failed to cancel order');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    }
  };

  const markCollected = async (orderId) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: 'collected'
        }),
      });
      
      if (response.ok) {
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-3 sm:p-6">
      <Card className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center justify-between text-2xl sm:text-3xl font-bold">
            <div className="flex items-center gap-3">
              <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />
              Coffee Order System
            </div>
            <Link href="/barista">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                Barista View
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-14 text-base">
              <TabsTrigger value="order" className="flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Place Order
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Status
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="order" className="mt-0">
                <div className="space-y-6">
                  {showCancelAlert && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertDescription className="text-red-800">
                        Order cancelled successfully
                      </AlertDescription>
                    </Alert>
                  )}
                  <OrderForm onOrder={handleOrder} />
                </div>
              </TabsContent>
              
              <TabsContent value="status" className="mt-0">
                <CustomerOrderStatus 
                  orders={orders}
                  onCancelOrder={cancelOrder}
                  onMarkCollected={markCollected}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
