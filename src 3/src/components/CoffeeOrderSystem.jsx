import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Select, SelectItem } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { getOrdersFromStorage, saveOrdersToStorage } from '../lib/utils';

const coffeeOptions = ['Espresso','Cappuccino','Latte','Americano','Flat White','Piccolo','Iced Latte','Iced Long Black'];
const milkOptions = ['None','Cow','Oat','Almond','Soy'];

export default function CoffeeOrderSystem({ isBarista }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('order');
  const [name, setName] = useState('');
  const [coffee, setCoffee] = useState('');
  const [milk, setMilk] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setOrders(getOrdersFromStorage());
  }, []);

  useEffect(() => {
    saveOrdersToStorage(orders);
  }, [orders]);

  const handlePlaceOrder = () => {
    if (!name || !coffee || !milk) {
      setError('Please fill in all required fields.');
      return;
    }
    const newOrder = {
      id: Date.now(),
      name,
      coffee,
      milk,
      notes,
      status: 'Pending',
      timestamps: { ordered: new Date().toLocaleTimeString() },
    };
    setOrders(prev => [...prev, newOrder]);
    setName('');
    setCoffee('');
    setMilk('');
    setNotes('');
    setError('');
    setActiveTab('status');
  };

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: newStatus, timestamps: { ...o.timestamps, [newStatus.toLowerCase()]: new Date().toLocaleTimeString() } } : o))
    );
  };

  const handleCancel = id => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const renderForm = () => (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
      {error && <Alert type="error"><AlertDescription>{error}</AlertDescription></Alert>}
      <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
      <Select value={coffee} onChange={e => setCoffee(e.target.value)}>
        <option value="">Select coffee</option>
        {coffeeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
      </Select>
      <Select value={milk} onChange={e => setMilk(e.target.value)}>
        <option value="">Select milk type</option>
        {milkOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
      </Select>
      <Textarea placeholder="Any special requests? (Optional)" value={notes} onChange={e => setNotes(e.target.value)} />
      <Button variant="primary" onClick={handlePlaceOrder}>☕ Place Order</Button>
    </div>
  );

  const renderStatus = () => {
    if (!orders.length) {
      return <Alert type="error"><AlertDescription>No orders yet.</AlertDescription></Alert>;
    }
    return orders.map(order => (
      <Card key={order.id}>
        <CardContent className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{order.coffee} – {order.name}</h3>
            <p className="text-sm text-gray-600">Milk: {order.milk}</p>
            <p className="text-xs text-gray-500">Ordered: {order.timestamps.ordered}</p>
            {order.timestamps.ready && <p className="text-xs text-gray-500">Ready: {order.timestamps.ready}</p>}
            {order.timestamps.collected && <p className="text-xs text-gray-500">Collected: {order.timestamps.collected}</p>}
          </div>
          <div className="flex space-x-2">
            {isBarista && order.status === 'Pending' && <Button variant="primary" onClick={() => updateOrderStatus(order.id, 'Ready')}>Mark Ready</Button>}
            {isBarista && order.status === 'Ready' && <Button variant="secondary" onClick={() => updateOrderStatus(order.id, 'Collected')}>Mark Collected</Button>}
            {!isBarista && order.status === 'Pending' && <Button variant="secondary" onClick={() => handleCancel(order.id)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow-lg p-4">
      <Tabs>
        <TabsList>
          {!isBarista && <TabsTrigger isActive={activeTab==='order'} onClick={()=>setActiveTab('order')}>Order Coffee</TabsTrigger>}
          <TabsTrigger isActive={activeTab==='status'} onClick={()=>setActiveTab('status')}>Order Status</TabsTrigger>
        </TabsList>
      </Tabs>
      {!isBarista && <TabsContent isActive={activeTab==='order'}>{renderForm()}</TabsContent>}
      <TabsContent isActive={activeTab==='status'}>{renderStatus()}</TabsContent>
    </div>
  );
}
