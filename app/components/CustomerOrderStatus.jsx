// app/components/CustomerOrderStatus.jsx

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, XCircle, Package, PlusCircle, Milk, MapPin } from 'lucide-react';

export default function CustomerOrderStatus({ order, onCancelOrder, onMarkCollected }) {
  if (!order) {
    return <p className="text-center text-gray-500 py-16">Your order status will appear here.</p>;
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const status = order['Status'];
  const name = order['Name'];
  const coffeeType = order['Coffee Type'];
  const milkOption = order['Milk Option'];
  const extras = order['Extras'];
  const notes = order['Notes'];
  const orderTimestamp = order['Order Timestamp'];
  const collectionSpot = order['Collection Spot'];

  return (
    <Card className="shadow-md border-2 border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-3 flex-1">
              <h3 className="font-bold text-xl text-gray-800">{coffeeType}</h3>
              <p className="text-base font-medium text-gray-700">For: {name}</p>
              
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Milk className="w-4 h-4"/>
                <span>{milkOption}</span>
              </div>
              
              {extras && extras.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <PlusCircle className="w-4 h-4" />
                  <span>{extras.join(', ')}</span>
                </div>
              )}

              {notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2">
                  <strong>Notes:</strong> {notes}
                </p>
              )}
              <div className="space-y-1 text-sm text-gray-500 pt-2">
                <p><strong>Ordered:</strong> {formatTimestamp(orderTimestamp)}</p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-3">
              {status === 'Pending' && (
                <>
                  <span className="flex items-center text-yellow-600 font-medium text-lg">
                    <Clock className="w-5 h-5 mr-2" /> Preparing...
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => onCancelOrder(order.id)} className="bg-red-500 hover:bg-red-600">
                    <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                  </Button>
                </>
              )}
              {status === 'Ready' && (
                <div className="text-right space-y-3">
                    <span className="flex items-center justify-end text-green-600 font-medium text-lg">
                        <Check className="w-5 h-5 mr-2" /> Ready for pickup!
                    </span>
                    {collectionSpot && (
                        <div className="flex items-center justify-end text-lg font-bold mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md">
                            <MapPin className="w-5 h-5 mr-2" />
                            <span>Spot #{collectionSpot}</span>
                        </div>
                    )}
                    <Button onClick={() => onMarkCollected(order.id)} className="bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" /> I've Collected My Order
                    </Button>
                </div>
              )}
              {/* === CHANGE IS HERE === */}
              {status === 'Collected' && (
                <div className="text-right space-y-2">
                    <span className="flex items-center justify-end text-blue-600 font-medium text-lg">
                      <Package className="w-5 h-5 mr-2" /> Collected
                    </span>
                    {collectionSpot && (
                        <span className="text-sm text-gray-500">
                            (from Spot #{collectionSpot})
                        </span>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
