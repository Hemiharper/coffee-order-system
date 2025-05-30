import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Coffee, Clock, Check, Package } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

const getOrdersFromStorage = () => {
  try {
    const orders = localStorage.getItem('coffeeOrders');
    return orders ? JSON.parse(orders) : [];
  } catch {
    return [];
  }
};

const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem('coffeeOrders', JSON.stringify(orders));
  } catch {}
};

const OrderForm = ({ onOrder }) => {
  const [name, setName] = useState('');
  const [coffee, setCoffee] = useState('');
  const [milk, setMilk] = useState('');
  const [notes, setNotes] = useState('');

  const coffeeOptions = ['Espresso','Cappuccino','Latte','Americano','Flat White','Piccolo','Iced Latte','Iced Long Black'];
  const milkOptions = ['None','Cow','Oat','Almond','Soy'];

  const handleOrder = () => {
    if (!name || !coffee || !milk) {
      alert('Please complete all fields');
      return;
    }
    onOrder({
      item: { name: coffee },
      milk: milk === 'None' ? null : milk,
      notes,
      name,
    });
    setName('');
    setCoffee('');
    setMilk('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <Select value={coffee} onValueChange={setCoffee}>
        <SelectTrigger>
          <SelectValue placeholder="Select coffee" />
        </SelectTrigger>
        <SelectContent>
          {coffeeOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={milk} onValueChange={setMilk}>
        <SelectTrigger>
          <SelectValue placeholder="Select milk type" />
        </SelectTrigger>
        <SelectContent>
          {milkOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
      <Textarea placeholder="Any special requests? (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button onClick={handleOrder}>
        <Coffee className="mr-2 h-4 w-4" />
        Place Order
      </Button>
    </div>
  );
};

const CoffeeOrderSystem = ({ role = 'customer' }) => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('order');

  useEffect(() => {
    setOrders(getOrdersFromStorage());
    const interval = setInterval(() => {
      setOrders(getOrdersFromStorage());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOrder = (orderDetails) => {
    const newOrder = {
      id: Date.now(), ...orderDetails, status: 'pending', timestamp: new Date().toLocaleTimeString()
    };
    const updated = [...orders, newOrder];
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const updateOrderStatus = (id, status) => {
    const updated = orders.map(o => o.id === id ? { ...o, status, timestamp: new Date().toLocaleTimeString() } : o);
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const cancelOrder = (id) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const sorted = [...orders].sort((a, b) => {
    const rank = { pending: 1, ready: 2, collected: 3 };
    return rank[a.status] - rank[b.status] || new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="min-h-screen p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            /coffee.ai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="order">Order Coffee</TabsTrigger>
              <TabsTrigger value="status">Order Status</TabsTrigger>
            </TabsList>
            <TabsContent value="order">
              {role === 'customer' && <OrderForm onOrder={handleOrder} />}
            </TabsContent>
            <TabsContent value="status">
              <div className="space-y-4">
                {sorted.length ? sorted.map(order => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{order.item.name} – {order.name}</p>
                        {order.milk && <p className="text-sm text-gray-600">Milk: {order.milk}</p>}
                        {order.notes && <p className="text-sm text-gray-600">Notes: {order.notes}</p>}
                        <p className="text-xs text-gray-400">Ordered at {order.timestamp}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {role==='barista' && order.status==='pending' && <Button onClick={()=>updateOrderStatus(order.id,'ready')}>Mark Ready</Button>}
                        {role==='barista' && order.status==='ready' && <Button onClick={()=>updateOrderStatus(order.id,'collected')}>Mark Collected</Button>}
                        {role==='customer' && order.status==='pending' && <Button onClick={()=>cancelOrder(order.id)} variant="destructive">Cancel</Button>}
                        {role==='customer' && order.status==='ready' && <p className="text-green-600">Ready for pickup!</p>}
                      </div>
                    </div>
                  </Card>
                )) : <div className="text-center text-gray-500">No orders yet.</div>}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    );
};

export default CoffeeOrderSystem;