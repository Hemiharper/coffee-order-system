import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Coffee, Clock, Check, XCircle, Package } from 'lucide-react';
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";

// Utility functions for localStorage
const getOrdersFromStorage = () => {
  try {
    const orders = localStorage.getItem('coffeeOrders');
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem('coffeeOrders', JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const OrderForm = ({ onOrder }) => {
  const [name, setName] = useState('');
  const [coffee, setCoffee] = useState('');
  const [milk, setMilk] = useState('');
  const [notes, setNotes] = useState('');

  const coffeeOptions = [
    'Espresso',
    'Cappuccino',
    'Latte',
    'Americano',
    'Flat White',
    'Piccolo',
    'Iced Latte',
    'Iced Long Black'
  ];

  const milkOptions = ['None', 'Cow', 'Oat', 'Almond', 'Soy'];

  const handleOrder = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!coffee) {
      alert('Please select a coffee');
      return;
    }
    if (!milk) {
      alert('Please select milk preference');
      return;
    }

    onOrder({
      item: { name: coffee },
      milk: milk === 'None' ? null : milk,
      notes,
      name: name.trim()
    });

    setName('');
    setCoffee('');
    setMilk('');
    setNotes('');
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-4 space-y-4">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-sans h-12 text-base"
        />

        <Select>
  <option value="">Select an option</option>
  <option value="Espresso">Espresso</option>
  <option value="Latte">Latte</option>
  <option value="Cappuccino">Cappuccino</option>
</Select>

        <Select>
  <option value="">Select an option</option>
  <option value="Espresso">Espresso</option>
  <option value="Latte">Latte</option>
  <option value="Cappuccino">Cappuccino</option>
</Select>

        <Textarea
          placeholder="Any special requests? (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-24 font-sans text-base resize-none"
        />

        <Button 
          onClick={handleOrder} 
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
        >
          <Coffee className="w-5 h-5 mr-2" />
          Place Order
        </Button>
      </CardContent>
    </Card>
  );
};

const CoffeeOrderSystem = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('order');
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  // Load initial orders and set up polling
  useEffect(() => {
    // Initial load
    setOrders(getOrdersFromStorage());

    // Set up polling every 2 seconds
    const interval = setInterval(() => {
      const currentOrders = getOrdersFromStorage();
      if (JSON.stringify(currentOrders) !== JSON.stringify(orders)) {
        setOrders(currentOrders);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleOrder = (orderDetails) => {
    const newOrder = {
      id: Date.now(),
      ...orderDetails,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString(),
    };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { 
        ...order, 
        status: newStatus,
        readyAt: newStatus === 'ready' ? new Date().toLocaleTimeString() : order.readyAt,
        collectedAt: newStatus === 'collected' ? new Date().toLocaleTimeString() : order.collectedAt
      } : order
    );
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
  };

  const cancelOrder = (orderId) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    setShowCancelAlert(true);
    setTimeout(() => setShowCancelAlert(false), 3000);
  };

  // Sort orders by status priority and timestamp
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = { 'pending': 1, 'ready': 2, 'collected': 3 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-3 sm:p-6">
      <Card className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-center gap-2 font-mono text-xl sm:text-2xl">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
            Coffee Order System
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Tabs defaultValue="order" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full font-mono grid grid-cols-3 h-12">
              <TabsTrigger value="order" className="text-xs sm:text-sm px-2">
                <div className="flex flex-col items-center gap-1">
                  <Coffee className="w-4 h-4" />
                  <span className="hidden sm:inline">Order Coffee</span>
                  <span className="sm:hidden">Order</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="status" className="text-xs sm:text-sm px-2">
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Order Status</span>
                  <span className="sm:hidden">Status</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="barista" className="text-xs sm:text-sm px-2">
                <div className="flex flex-col items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Barista View</span>
                  <span className="sm:hidden">Barista</span>
                </div>
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="order" className="mt-0">
                <div className="space-y-4">
                  {showCancelAlert && (
                    <Alert className="bg-red-50 mb-4">
                      <AlertDescription className="text-red-800">
                        Order cancelled successfully
                      </AlertDescription>
                    </Alert>
                  )}
                  <OrderForm onOrder={handleOrder} />
                </div>
              </TabsContent>
              <TabsContent value="status" className="mt-0">
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Card key={order.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="space-y-2 flex-1">
                              <h3 className="font-mono font-medium text-lg">{order.item.name}</h3>
                              <p className="text-sm font-medium text-gray-700">For: {order.name}</p>
                              {order.milk && (
                                <p className="text-sm text-gray-600">Milk: {order.milk}</p>
                              )}
                              {order.notes && (
                                <p className="text-sm text-gray-600">Notes: {order.notes}</p>
                              )}
                              <p className="text-xs text-gray-500">Ordered at {order.timestamp}</p>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2">
                              {order.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                  <span className="flex items-center text-yellow-600 font-medium">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Pending
                                  </span>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => cancelOrder(order.id)}
                                    className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              )}
                              {order.status === 'ready' && (
                                <div className="flex flex-col gap-2">
                                  <span className="flex items-center text-green-600 font-medium">
                                    <Check className="w-4 h-4 mr-1" />
                                    Ready for pickup!
                                  </span>
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateOrderStatus(order.id, 'collected')}
                                    className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                                  >
                                    Mark as Collected
                                  </Button>
                                </div>
                              )}
                              {order.status === 'collected' && (
                                <span className="flex items-center text-blue-600 font-medium">
                                  <Package className="w-4 h-4 mr-1" />
                                  Collected at {order.collectedAt}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <Coffee className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-mono">No orders yet</p>
                      <p className="text-sm text-gray-400 mt-2">Place your first order to get started!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="barista" className="mt-0">
                <div className="space-y-3">
                  {sortedOrders.map((order) => (
                    <Card key={order.id} className={
                      order.status === 'pending' ? 'border-l-4 border-l-yellow-500 shadow-sm' : 
                      order.status === 'ready' ? 'border-l-4 border-l-green-500 shadow-sm' :
                      'border-l-4 border-l-blue-500 shadow-sm'
                    }>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-mono font-medium text-lg">
                                {order.item.name}
                              </h3>
                              {order.status === 'pending' && (
                                <span className="inline-flex items-center text-yellow-600 text-sm font-medium px-2 py-1 bg-yellow-50 rounded-full">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Pending
                                </span>
                              )}
                              {order.status === 'ready' && (
                                <span className="inline-flex items-center text-green-600 text-sm font-medium px-2 py-1 bg-green-50 rounded-full">
                                  <Check className="w-4 h-4 mr-1" />
                                  Ready
                                </span>
                              )}
                              {order.status === 'collected' && (
                                <span className="inline-flex items-center text-blue-600 text-sm font-medium px-2 py-1 bg-blue-50 rounded-full">
                                  <Package className="w-4 h-4 mr-1" />
                                  Collected
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-700">For: {order.name}</p>
                            {order.milk && (
                              <p className="text-sm text-gray-600">Milk: {order.milk}</p>
                            )}
                            {order.notes && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Notes:</strong> {order.notes}
                              </p>
                            )}
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Ordered: {order.timestamp}</p>
                              {order.readyAt && <p>Ready: {order.readyAt}</p>}
                              {order.collectedAt && <p>Collected: {order.collectedAt}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {order.status === 'pending' && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className="bg-green-500 hover:bg-green-600 flex-1"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Mark Ready
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <>
                                <Button 
                                  onClick={() => updateOrderStatus(order.id, 'pending')}
                                  className="bg-yellow-500 hover:bg-yellow-600 flex-1"
                                  size="sm"
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  Mark Pending
                                </Button>
                                <Button 
                                  onClick={() => updateOrderStatus(order.id, 'collected')}
                                  className="bg-blue-500 hover:bg-blue-600 flex-1"
                                  size="sm"
                                >
                                  <Package className="w-4 h-4 mr-1" />
                                  Mark Collected
                                </Button>
                              </>
                            )}
                            {order.status === 'collected' && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className="bg-green-500 hover:bg-green-600 flex-1"
                                size="sm"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Mark Ready
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <Coffee className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-mono">No orders</p>
                      <p className="text-sm text-gray-400 mt-2">Orders will appear here when customers place them</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoffeeOrderSystem;