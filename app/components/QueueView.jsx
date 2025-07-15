// app/components/QueueView.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { User, Coffee } from 'lucide-react';

// This component receives all orders and the current customer's order ID
const QueueView = ({ orders, customerOrderId }) => {
  // Filter for only the orders that are currently "Pending"
  const pendingOrders = orders.filter(order => order.Status === 'Pending');

  if (pendingOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
        <p className="text-gray-500 text-lg font-medium">The queue is empty!</p>
        <p className="text-gray-400 mt-2">Place an order to get things started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Queue</h2>
        <p className="text-gray-600">Here's a look at the orders in front of you.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {pendingOrders.map((order, index) => {
              // Check if the current order in the list is the user's order
              const isMyOrder = order.id === customerOrderId;
              return (
                <li
                  key={order.id}
                  // Apply a highlight style if it's the user's order
                  className={`flex items-center justify-between p-4 ${isMyOrder ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold ${isMyOrder ? 'text-blue-600' : 'text-gray-500'}`}>
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-800">{order.Name}</span>
                    </div>
                  </div>
                  {isMyOrder && (
                    <span className="text-sm font-semibold text-blue-600">This is you!</span>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueView;
