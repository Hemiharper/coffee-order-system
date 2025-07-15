// app/components/QueueView.jsx

import React from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { User, Coffee, MapPin, CheckCircle } from 'lucide-react';

const QueueView = ({ orders, customerOrderId }) => {
  // Filter orders into "Ready" and "Pending" lists
  const readyOrders = orders
    .filter(order => order.Status === 'Ready' && order['Collection Spot'])
    .sort((a, b) => a['Collection Spot'] - b['Collection Spot']); // Sort by spot number

  const pendingOrders = orders.filter(order => order.Status === 'Pending');

  // Check if there are any orders to display at all
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
      {/* Section for orders ready for collection */}
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
                  const isMyOrder = order.id === customerOrderId;
                  return (
                    <li
                      key={order.id}
                      className={`flex items-center justify-between p-4 ${isMyOrder ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-10 h-10">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-medium text-gray-800">{order.Name}</span>
                            {isMyOrder && <span className="text-xs text-blue-600 font-semibold ml-2">This is you!</span>}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-700">
                        Spot #{order['Collection Spot']}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section for orders waiting in the queue */}
      {pendingOrders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">In the Queue</h3>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                {pendingOrders.map((order, index) => {
                  const isMyOrder = order.id === customerOrderId;
                  return (
                    <li
                      key={order.id}
                      className={`flex items-center justify-between p-4 ${isMyOrder ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold w-10 text-center ${isMyOrder ? 'text-blue-600' : 'text-gray-500'}`}>
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
