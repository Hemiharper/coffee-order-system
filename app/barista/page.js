'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Coffee } from 'lucide-react';
import BaristaView from '@/app/components/BaristaView';
import Link from 'next/link';

export default function BaristaPage() {
  const [orders, setOrders] = useState([]);

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
    }, 1000); // More frequent updates for barista view

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-3 sm:p-6">
      <Card className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold">
            <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />
            Coffee Order System - Barista
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <BaristaView 
            orders={orders}
            onUpdateOrderStatus={updateOrderStatus}
            backToCustomerLink="/"
          />
        </CardContent>
      </Card>
    </div>
  );
}
