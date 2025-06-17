// app/barista/page.js (Barista View - MODIFIED)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Coffee, Loader2 } from 'lucide-react'; // Added Loader2 for loading indicator
import BaristaView from '@/app/components/BaristaView'; // Your existing BaristaView component
import Link from 'next/link'; // Assuming you have a Link component for navigation
import { Alert, AlertDescription } from '@/app/components/ui/alert'; // Added Alert for errors


export default function BaristaPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [error, setError] = useState(null); // New state for general errors

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Sort orders by timestamp, newest first for display (usually desired for barista)
      const sortedOrders = data.sort((a, b) => new Date(b.orderTimestamp) - new Date(a.orderTimestamp));
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(`Failed to load orders: ${err.message}. Please refresh.`);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Load orders and set up polling
  useEffect(() => {
    fetchOrders(); // Initial fetch

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000); // Poll every 3 seconds for barista view for more real-time updates

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsLoading(true); // Indicate loading for the update action
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId, // IMPORTANT: Changed from orderId to 'id' to match API route expectation
          status: newStatus
        }),
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders after successful update
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update order status: HTTP status ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to update order:', err);
      setError(`Failed to update order status: ${err.message}`);
      alert(`Failed to update order status: ${err.message}`); // Provide immediate feedback
    } finally {
      setIsLoading(false); // End loading
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
        <CardContent className="px-6">
          {isLoading && (
              <div className="flex items-center justify-center p-4">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                  <span className="ml-2 text-gray-600">Loading orders...</span>
              </div>
          )}
          {error && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                  <AlertDescription className="text-red-800">
                      {error}
                  </AlertDescription>
              </Alert>
          )}
          {!isLoading && !error && (
            <BaristaView
              orders={orders}
              onUpdateOrderStatus={updateOrderStatus}
              backToCustomerLink="/" // This seems correct to link back to the root page
            />
          )}
        </CardContent>
         {/* Link back to Customer View - often placed at the bottom for barista */}
         <div className="p-6 border-t border-gray-200 bg-gray-50 text-center">
            <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
              ← Back to Customer Order Form
            </Link>
        </div>
      </Card>
    </div>
  );
}
