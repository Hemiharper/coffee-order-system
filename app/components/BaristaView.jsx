// app/components/BaristaView.jsx (MODIFIED)

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, Package, ArrowLeft, Loader2, User, FileText, Milk } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

const BaristaView = ({ orders, onUpdateOrderStatus, isUpdating, backToCustomerLink = "/" }) => {

  // Sort orders by priority: Pending first, then Ready, then Collected, then by timestamp
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = { 'Pending': 1, 'Ready': 2, 'Collected': 3 };
    
    // --- CORRECTED DATA ACCESS ---
    const statusA = a['Status'] || 'Collected';
    const statusB = b['Status'] || 'Collected';
    const timeA = new Date(a['Order Timestamp'] || 0);
    const timeB = new Date(b['Order Timestamp'] || 0);

    // Primary sort by status
    if (statusPriority[statusA] !== statusPriority[statusB]) {
      return statusPriority[statusA] - statusPriority[statusB];
    }
    // Secondary sort by timestamp (oldest first)
    return timeA - timeB;
  });

  if (orders.length === 0) {
    return (
        <div className="text-center py-16">
          <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          <p className="text-gray-500 text-lg font-medium">No active orders</p>
          <p className="text-gray-400 mt-2">New orders will appear here automatically.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedOrders.map((order) => {
                // --- CORRECTED DATA ACCESS ---
                const status = order['Status'];
                const name = order['Name'];
                const coffeeType = order['Coffee Type'];
                const milkOption = order['Milk Option'];
                const notes = order['Notes'];
                const isCollected = status === 'Collected';

                return (
                    <Card key={order.id} className={`flex flex-col justify-between transition-opacity ${isCollected ? 'opacity-60 bg-gray-50' : 'bg-white shadow-md'}`}>
                        <CardContent className="p-4 space-y-3">
                             <div className="flex justify-between items-center">
                                <p className="font-bold text-lg flex items-center gap-2"><User className="w-5 h-5 text-gray-500"/>{name}</p>
                                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                    status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    status === 'Ready' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                    {status}
                                </span>
                            </div>
                            <p className="text-gray-800 flex items-center gap-2"><Coffee className="w-4 h-4 text-gray-500"/>{coffeeType}</p>
                            <p className="text-gray-600 flex items-center gap-2"><Milk className="w-4 h-4 text-gray-500"/>{milkOption}</p>
                            {notes && (
                                <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md flex items-start gap-2">
                                    <FileText className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0"/>
                                    <span>{notes}</span>
                                </p>
                            )}
                        </CardContent>
                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                            {status === 'Pending' && (
                                <Button onClick={() => onUpdateOrderStatus(order.id, 'Ready')} disabled={isUpdating} className="w-full">
                                    Mark as Ready
                                </Button>
                            )}
                            {status === 'Ready' && (
                                <Button onClick={() => onUpdateOrderStatus(order.id, 'Collected')} disabled={isUpdating} className="w-full bg-green-600 hover:bg-green-700">
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark as Collected
                                </Button>
                            )}
                            {status === 'Collected' && (
                               <p className="text-sm text-gray-500 italic w-full text-right">Order complete</p>
                            )}
                        </div>
                    </Card>
                )
            })}
        </div>
    </div>
  );
};

export default BaristaView;
