import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, XCircle, Package } from 'lucide-react';

const CustomerOrderStatus = ({ orders, onCancelOrder, onMarkCollected }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Orders</h2>
        <p className="text-gray-600">Track the status of your coffee orders</p>
      </div>

      {orders.map((order) => (
        <Card key={order.id} className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-3 flex-1">
                  <h3 className="font-bold text-xl text-gray-800">{order.item.name}</h3>
                  <p className="text-base font-medium text-gray-700">For: {order.name}</p>
                  {order.milk && (
                    <p className="text-sm text-gray-600">Milk: {order.milk}</p>
                  )}
                  {order.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-gray-500">
                    <p><strong>Ordered:</strong> {order.timestamp}</p>
                    {order.readyAt && <p><strong>Ready:</strong> {order.readyAt}</p>}
                    {order.collectedAt && <p><strong>Collected:</strong> {order.collectedAt}</p>}
                  </div>
                </div>
                
                <div className="flex flex-col items-start sm:items-end gap-3">
                  {order.status === 'pending' && (
                    <>
                      <span className="flex items-center text-yellow-600 font-medium text-lg">
                        <Clock className="w-5 h-5 mr-2" />
                        Preparing...
                      </span>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onCancelOrder(order.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                  {order.status === 'ready' && (
                    <div className="flex flex-col gap-3">
                      <span className="flex items-center text-green-600 font-medium text-lg">
                        <Check className="w-5 h-5 mr-2" />
                        Ready for pickup!
                      </span>
                      <Button 
                        onClick={() => onMarkCollected(order.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Got it
                      </Button>
                    </div>
                  )}
                  {order.status === 'collected' && (
                    <span className="flex items-center text-blue-600 font-medium text-lg">
                      <Package className="w-5 h-5 mr-2" />
                      Collected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {orders.length === 0 && (
        <div className="text-center py-16">
          <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          <p className="text-gray-500 text-lg font-medium">No orders yet</p>
          <p className="text-gray-400 mt-2">Your orders will appear here once you place them</p>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderStatus;
