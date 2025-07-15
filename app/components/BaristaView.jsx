// app/components/BaristaView.jsx

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, Package, User, FileText, Milk, PlusCircle, MapPin } from 'lucide-react';

const BaristaView = ({ orders, onUpdateOrderStatus, isUpdating, recentlyReadyOrderIds }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
        <p className="text-gray-500 text-lg font-medium">No active orders</p>
        <p className="text-gray-400 mt-2">New orders will appear here automatically.</p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const aIsRecent = recentlyReadyOrderIds.includes(a.id);
    const bIsRecent = recentlyReadyOrderIds.includes(b.id);

    if (aIsRecent && !bIsRecent) return -1;
    if (!aIsRecent && bIsRecent) return 1;

    const statusPriority = { 'Pending': 1, 'Ready': 2, 'Collected': 3 };
    const statusA = a['Status'] || 'Collected';
    const statusB = b['Status'] || 'Collected';
    if (statusPriority[statusA] !== statusPriority[statusB]) {
      return statusPriority[statusA] - statusPriority[statusB];
    }

    const timeA = new Date(a['Order Timestamp'] || 0);
    const timeB = new Date(b['Order Timestamp'] || 0);
    return timeA - timeB;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedOrders.map((order) => {
        const status = order['Status'];
        const name = order['Name'];
        const coffeeType = order['Coffee Type'];
        const milkOption = order['Milk Option'];
        const extras = order['Extras'];
        const notes = order['Notes'];
        const collectionSpot = order['Collection Spot'];
        const isCollected = status === 'Collected';
        
        const isRecentlyReady = recentlyReadyOrderIds.includes(order.id);

        return (
          <Card key={order.id} className={`flex flex-col justify-between transition-all duration-500 ${isCollected ? 'opacity-60 bg-gray-50' : 'bg-white shadow-md'} ${isRecentlyReady ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
            {/* === UI CHANGE IS HERE === */}
            {/* The content of the card now changes dramatically based on the order status. */}
            <CardContent className="p-4 flex-grow flex flex-col">
              {status === 'Ready' && collectionSpot ? (
                // BIG NUMBER DISPLAY for "Ready" orders
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <p className="font-bold text-xl text-gray-800">{name}</p>
                  <p className="text-gray-600 mb-2">{coffeeType}</p>
                  <div className="my-auto">
                    <p className="text-lg text-gray-500">Spot</p>
                    <p className="text-8xl font-black text-blue-600 leading-none">#{collectionSpot}</p>
                  </div>
                </div>
              ) : (
                // Standard display for "Pending" and "Collected" orders
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg flex items-center gap-2"><User className="w-5 h-5 text-gray-500" />{name}</p>
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-gray-800 flex items-center gap-2"><Coffee className="w-4 h-4 text-gray-500" />{coffeeType}</p>
                  <p className="text-gray-600 flex items-center gap-2"><Milk className="w-4 h-4 text-gray-500" />{milkOption}</p>
                  
                  {extras && extras.length > 0 && (
                    <p className="text-gray-600 flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-gray-500" />
                        {extras.join(', ')}
                    </p>
                  )}

                  {notes && (
                    <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                      <span>{notes}</span>
                    </p>
                  )}
                </div>
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
        );
      })}
    </div>
  );
};

export default BaristaView;
