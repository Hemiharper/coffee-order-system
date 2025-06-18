// app/components/BaristaView.jsx (MODIFIED)

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Clock, Check, Package, ArrowLeft, Loader2 } from 'lucide-react'; // Added Loader2
import Link from 'next/link';
import { Alert, AlertDescription } from '@/app/components/ui/alert'; // Added Alert

// Added isLoading and error props from parent (app/barista/page.js)
const BaristaView = ({ orders, onUpdateOrderStatus, backToCustomerLink, isLoading, error }) => {

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Sort orders by priority: Pending first, then Ready, then Collected, then by timestamp
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = { 'Pending': 1, 'Ready': 2, 'Collected': 3 };
    // Primary sort by status
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    // Secondary sort by timestamp (oldest first for orders with same status)
    return new Date(a.orderTimestamp) - new Date(b.orderTimestamp);
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

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      )}

      {error && !isLoading && (
        <Alert className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </Alert>
      )}

      {!isLoading && sortedOrders.length === 0 && !error && (
        <div className="text-center py-16">
          <Coffee className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          <p className="text-gray-500 text-lg font-medium">No orders</p>
          <p className="text-gray-400 mt-2">Orders will appear here when customers place them</p>
        </div>
      )}

      <div className="grid gap-4">
        {!isLoading && !error && sortedOrders.map((order) => (
          <Card key={order.id} className={
            // IMPORTANT: Use capitalized status strings here to match Airtable
            order.status === 'Pending' ? 'border-l-4 border-l-yellow-500 shadow-md' :
            order.status === 'Ready' ? 'border-l-4 border-l-green-500 shadow-md' :
            'border-l-4 border-l-blue-500 shadow-md'
          }>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {/* CORRECTED: Use order.coffeeType */}
                      <h3 className="font-bold text-xl text-gray-800">
                        {order.coffeeType}
                      </h3>
                      {/* CORRECTED: Use capitalized status strings */}
                      {order.status === 'Pending' && (
                        <span className="inline-flex items-center text-yellow-700 text-sm font-medium px-3 py-1 bg-yellow-100 rounded-full">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                      {order.status === 'Ready' && (
                        <span className="inline-flex items-center text-green-700 text-sm font-medium px-3 py-1 bg-green-100 rounded-full">
                          <Check className="w-4 h-4 mr-1" />
                          Ready
                        </span>
                      )}
                      {order.status === 'Collected' && (
                        <span className="inline-flex items-center text-blue-700 text-sm font-medium px-3 py-1 bg-blue-100 rounded-full">
                          <Package className="w-4 h-4 mr-1" />
                          Collected
                        </span>
                      )}
                    </div>

                    <p className="text-lg font-medium text-gray-700">Customer: {order.name}</p>
                    {/* CORRECTED: Use order.milkOption, and check for 'None' if applicable */}
                    {order.milkOption && order.milkOption !== 'None' && (
                      <p className="text-base text-gray-600">Milk: {order.milkOption}</p>
                    )}
                    {order.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Special requests:</strong> {order.notes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1 text-sm text-gray-500">
                      {/* CORRECTED: Use order.orderTimestamp */}
                      <p><strong>Ordered:</strong> {formatTimestamp(order.orderTimestamp)}</p>
                      {/* Removed readyAt and collectedAt as these fields are not in Airtable */}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {order.status === 'Pending' && ( // Use capitalized 'Pending'
                    <Button
                      onClick={() => onUpdateOrderStatus(order.id, 'Ready')} // Change status to 'Ready' (capitalized)
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      size="lg"
                      disabled={isLoading} // Disable button while loading
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Mark Ready for Pickup
                    </Button>
                  )}
                  {order.status === 'Ready' && ( // Use capitalized 'Ready'
                    <>
                      <Button
                        onClick={() => onUpdateOrderStatus(order.id, 'Pending')} // Change status to 'Pending' (capitalized)
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 flex-1"
                        size="lg"
                        disabled={isLoading} // Disable button while loading
                      >
                        <Clock className="w-5 h-5 mr-2" />
                        Mark as Preparing
                      </Button>
                      <Button
                        onClick={() => onUpdateOrderStatus(order.id, 'Collected')} // Change status to 'Collected' (capitalized)
                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                        size="lg"
                        disabled={isLoading} // Disable button while loading
                      >
                        <Package className="w-5 h-5 mr-2" />
                        Mark as Collected
                      </Button>
                    </>
                  )}
                  {order.status === 'Collected' && ( // Use capitalized 'Collected'
                    <Button
                      onClick={() => onUpdateOrderStatus(order.id, 'Ready')} // Allow marking back to 'Ready'
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50 flex-1"
                      size="lg"
                      disabled={isLoading} // Disable button while loading
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Mark as Ready (Revert)
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BaristaView;
