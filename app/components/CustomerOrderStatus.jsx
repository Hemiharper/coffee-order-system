// app/components/CustomerOrderStatus.jsx (MODIFIED)

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, XCircle, Package, Loader2 } from 'lucide-react'; // Added Loader2
import { Alert, AlertDescription } from '@/app/components/ui/alert'; // Added Alert components

// Added isLoading and error props from parent (app/page.js)
const CustomerOrderStatus = ({ orders, onCancelOrder, isLoading, error }) => {
  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Orders</h2>
        <p className="text-gray-600">Track the status of your coffee orders</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      )}

      {error && !isLoading && ( // Show error if not loading
        <Alert className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </Alert>
      )}

      {!isLoading && orders.length === 0 && !error && (
        <div className="text-center py-16">
          <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          <p className="text-gray-500 text-lg font-medium">No orders yet</p>
          <p className="text-gray-400 mt-2">Your orders will appear here once you place them</p>
        </div>
      )}

      {!isLoading && !error && orders.map((order) => (
        <Card key={order.id} className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-3 flex-1">
                  {/* CORRECTED: Use order.coffeeType directly */}
                  <h3 className="font-bold text-xl text-gray-800">{order.coffeeType}</h3>
                  <p className="text-base font-medium text-gray-700">For: {order.name}</p>
                  {/* CORRECTED: Use order.milkOption directly */}
                  {order.milkOption && order.milkOption !== 'None' && ( // Added check for 'None' if you store it as string
                    <p className="text-sm text-gray-600">Milk: {order.milkOption}</p>
                  )}
                  {order.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-gray-500">
                    {/* CORRECTED: Use order.orderTimestamp */}
                    <p><strong>Ordered:</strong> {formatTimestamp(order.orderTimestamp)}</p>
                    {/* Removed readyAt and collectedAt as these fields are not in Airtable */}
                    {/* If you add these to Airtable later, you'd add them back here */}
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3">
                  {/* CORRECTED: Use capitalized status strings from Airtable */}
                  {order.status === 'Pending' && (
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
                  {order.status === 'Ready' && (
                    <span className="flex items-center text-green-600 font-medium text-lg">
                      <Check className="w-5 h-5 mr-2" />
                      Ready for pickup!
                    </span>
                  )}
                  {order.status === 'Collected' && (
                    <span className="flex items-center text-blue-600 font-medium text-lg">
                      <Package className="w-5 h-5 mr-2" />
                      Collected
                    </span>
                  )}
                  {/* IMPORTANT: Removed the "Got it" (Mark Collected) button entirely
                              as it's a barista-only action for customers. */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerOrderStatus;
