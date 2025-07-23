// app/components/QueueView.jsx

import React from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { User, Coffee, MapPin, CheckCircle, Check } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

// The component now accepts onMarkCollected and isUpdating props
const QueueView = ({ orders, customerOrderId, onMarkCollected, isUpdating }) => {
  const readyOrders = orders
    .filter(order => order.Status === 'Ready' && order['Collection Spot'])
    .sort((a, b) => a['Collection Spot'] - b['Collection Spot']);

  const pendingOrders = orders.filter(order => order.Status === 'Pending');

  if (readyOrders.length === 0 && pendingOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
        <p className="text-gray-500 text-lg font-medium">The queue is empty!</p>
        <p className="text-gray-400 mt-2">Place an order to get things started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {readyOrders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Ready for Collection
          </h3>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                {readyOrders.map((order) => {
                  const isMyOrder = customerOrderId && order.id === customerOrderId;
                  return (
                    <li
                      key={order.id}
                      className={`flex items-center justify-between p-4 ${isMyOrder ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-12 h-12">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="font-medium text-lg text-gray-800">{order.Name}</span>
                            <p className="text-sm text-gray-500">Spot #{order['Collection Spot']}</p>
                        </div>
                      </div>
                      {/* === CHANGE IS HERE: Added the "Mark as Collected" button === */}
                      {/* The button is only shown if the onMarkCollected function is provided */}
                      {onMarkCollected && (
                        <Button
                          onClick={() => onMarkCollected(order.id)}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Collected
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {pendingOrders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">In the Queue</h3>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                {pendingOrders.map((order, index) => {
                  const isMyOrder = customerOrderId && order.id === customerOrderId;
                  return (
                    <li
                      key={order.id}
                      className={`flex items-center justify-between p-4 ${isMyOrder ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold w-12 text-center ${isMyOrder ? 'text-blue-600' : 'text-gray-500'}`}>
                          {index + 1}
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
      )}
    </div>
  );
};

export default QueueView;
