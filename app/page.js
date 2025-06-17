// app/page.js (Customer View - MODIFIED)

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Coffee, Clock, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import OrderForm from '@/app/components/OrderForm'; // Your existing OrderForm component
import CustomerOrderStatus from '@/app/components/CustomerOrderStatus'; // Your existing CustomerOrderStatus component
import Link from 'next/link';

export default function HomePage() {
  const [orders, setOrders] = useState([]);
  const [customerTab, setCustomerTab] = useState('order');
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [error, setError] = useState(null); // New state for general errors

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        const errorData = await response.json(); // Try to get error message from response body
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Sort orders by timestamp, newest first for display
      const sortedOrders = data.sort((a, b) => new Date(b.orderTimestamp) - new Date(a.orderTimestamp));
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(`Failed to load orders: ${err.message}. Please refresh.`); // Set a user-friendly error message
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Load orders and set up polling
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds (5000 milliseconds)

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []); // Empty dependency array means this runs once on mount

  const handleOrder = async (orderDetails) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending order data:', orderDetails);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders after a successful submission
        setCustomerTab('status'); // Switch to status view
        setShowCancelAlert(false); // Hide any old cancel alerts
        // Optionally, show a success alert here for placing order
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to place order: HTTP status ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      setError(`Failed to place order: ${err.message}`);
      alert(`Failed to place order: ${err.message}`); // Use alert for immediate feedback
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) {
      return; // User cancelled the confirmation
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders after successful cancellation
        setShowCancelAlert(true); // Show success alert for cancellation
        setTimeout(() => setShowCancelAlert(false), 3000); // Hide alert after 3 seconds
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to cancel order: HTTP status ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setError(`Failed to cancel order: ${err.message}`);
      alert(`Failed to cancel order: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed 'markCollected' as it's a Barista-only action for the customer view.
  // The onMarkCollected prop should also be removed from CustomerOrderStatus when called here.

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
                    <Alert className="bg-green-50 border-green-200"> {/* Changed to green for success */}
                      <AlertDescription className="text-green-800">
                        Order cancelled successfully!
                      </AlertDescription>
                    </Alert>
                  )}
                  {/* Display general error for order placement here if needed */}
                  {error && customerTab === 'order' && (
                      <Alert className="bg-red-50 border-red-200">
                          <AlertDescription className="text-red-800">
                              {error}
                          </AlertDescription>
                      </Alert>
                  )}
                  <OrderForm onOrder={handleOrder} isLoading={isLoading} /> {/* Pass isLoading to form */}
                </div>
              </TabsContent>

              <TabsContent value="status" className="mt-0">
                <CustomerOrderStatus
                  orders={orders}
                  onCancelOrder={cancelOrder}
                  // IMPORTANT: Removed onMarkCollected as it's not for customers
                  isLoading={isLoading} // Pass loading state to CustomerOrderStatus
                  error={error} // Pass error state to CustomerOrderStatus
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
