// app/components/CustomerOrderStatus.jsx

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, XCircle, Package } from 'lucide-react';

export default function CustomerOrderStatus({ order, onCancelOrder, isLoading }) {
  // Defensive check: If for any reason the order object is not available, show nothing.
  if (!order) {
    return <p className="text-center text-gray-500 py-16">Your order status will appear here.</p>;
  }

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- CORRECTED DATA ACCESS ---
  // Use bracket notation `['Property Name']` to access keys with spaces.
  const status = order['Status'];
  const name = order['Name'];
  const coffeeType = order['Coffee Type'];
  const milkOption = order['Milk Option'];
  const notes = order['Notes'];
  const orderTimestamp = order['Order Timestamp'];


  return (
    <Card className="shadow-md border-2 border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-3 flex-1">
              <h3 className="font-bold text-xl text-gray-800">{coffeeType}</h3>
              <p className="text-base font-medium text-gray-700">For: {name}</p>
              {milkOption && milkOption !== 'None' && (
                <p className="text-sm text-gray-600">Milk: {milkOption}</p>
              )}
              {notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
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
                    <Clock className="w-5 h-5 mr-2" />
                    Preparing...
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelOrder(order.id)}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={isLoading} // Disable button while operations are ongoing
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                </>
              )}
              {status === 'Ready' && (
                <span className="flex items-center text-green-600 font-medium text-lg">
                  <Check className="w-5 h-5 mr-2" />
                  Ready for pickup!
                </span>
              )}
              {status === 'Collected' && (
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
  );
};
