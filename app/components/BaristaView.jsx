import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const BaristaView = ({ orders, onUpdateOrderStatus, backToCustomerLink }) => {
  // Sort orders by priority: pending first, then ready, then collected
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = { 'pending': 1, 'ready': 2, 'collected': 3 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return new Date('1970/01/01 ' + a.timestamp) - new Date('1970/01/01 ' + b.timestamp);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Barista Dashboard</h2>
          <p className="text-gray-600">Manage all customer orders</p>
        </div>
        <Link href={backToCustomerLink}>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customer View
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {sortedOrders.map((order) => (
          <Card key={order.id} className={
            order.status === 'pending' ? 'border-l-4 border-l-yellow-500 shadow-md' : 
            order.status === 'ready' ? 'border-l-4 border-l-green-500 shadow-md' :
            'border-l-4 border-l-blue-500 shadow-md'
          }>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-xl text-gray-800">
                        {order.item.name}
                      </h3>
                      {order.status === 'pending' && (
                        <span className="inline-flex items-center text-yellow-700 text-sm font-medium px-3 py-1 bg-yellow-100 rounded-full">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                      {order.status === 'ready' && (
                        <span className="inline-flex items-center text-green-700 text-sm font-medium px-3 py-1 bg-green-100 rounded-full">
                          <Check className="w-4 h-4 mr-1" />
                          Ready
                        </span>
                      )}
                      {order.status === 'collected' && (
                        <span className="inline-flex items-center text-blue-700 text-sm font-medium px-3 py-1 bg-blue-100 rounded-full">
                          <Package className="w-4 h-4 mr-1" />
                          Collected
                        </span>
                      )}
                    </div>
                    
                    <p className="text-lg font-medium text-gray-700">Customer: {order.name}</p>
                    {order.milk && (
                      <p className="text-base text-gray-600">Milk: {order.milk}</p>
                    )}
                    {order.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Special requests:</strong> {order.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-1 text-sm text-gray-500">
                      <p><strong>Ordered:</strong> {order.timestamp}</p>
                      {order.readyAt && <p><strong>Ready:</strong> {order.readyAt}</p>}
                      {order.collectedAt && <p><strong>Collected:</strong> {order.collectedAt}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {order.status === 'pending' && (
                    <Button 
                      onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Mark Ready for Pickup
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <>
                      <Button 
                        onClick={() => onUpdateOrderStatus(order.id, 'pending')}
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 flex-1"
                        size="lg"
                      >
                        <Clock className="w-5 h-5 mr-2" />
                        Mark as Preparing
                      </Button>
                      <Button 
                        onClick={() => onUpdateOrderStatus(order.id, 'collected')}
                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                        size="lg"
                      >
                        <Package className="w-5 h-5 mr-2" />
                        Mark as Collected
                      </Button>
                    </>
                  )}
                  {order.status === 'collected' && (
                    <Button 
                      onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50 flex-1"
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Mark as Ready
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {orders.length === 0 && (
          <div className="text-center py-16">
            <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <p className="text-gray-500 text-lg font-medium">No orders</p>
            <p className="text-gray-400 mt-2">Orders will appear here when customers place them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaristaView;

