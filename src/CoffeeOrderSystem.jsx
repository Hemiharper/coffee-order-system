import React, { useState, useEffect } from 'react';
import { Tab } from './ui/tabs.jsx';
import Button from './ui/button.jsx';
import Select from './ui/select.jsx';
import Textarea from './ui/textarea.jsx';
import Alert from './ui/alert.jsx';
import Card from './ui/card.jsx';

export default function CoffeeOrderSystem() {
  const [activeTab, setActiveTab] = useState('order');
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState('');
  const [coffee, setCoffee] = useState('');
  const [milk, setMilk] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const handlePlace = () => {
    if (!name || !coffee || !milk) return;
    const timestamp = new Date().toISOString();
    setOrders([...orders, { id: Date.now(), name, coffee, milk, notes, status: 'pending', timestamp }]);
    setName(''); setCoffee(''); setMilk(''); setNotes('');
  };

  const updateStatus = (id, status) => setOrders(
    orders.map(o => o.id === id ? { ...o, status, timestamp: new Date().toISOString() } : o)
  );

  const pending = orders.filter(o => activeTab === 'order' ? o.status === 'pending' : o.status !== 'pending');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>☕</span> /coffee.ai
        </h1>
        <nav className="flex border border-gray-200 rounded overflow-hidden">
          <Tab active={activeTab==='order'} onClick={()=>setActiveTab('order')}>Order Coffee</Tab>
          <Tab active={activeTab==='status'} onClick={()=>setActiveTab('status')}>Order Status</Tab>
        </nav>

        {activeTab === 'order' && (
          <Card className="space-y-4">
            <input
              className="w-full h-12 border rounded px-3 text-base"
              placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            <Select label="Select coffee" options={[
              'Espresso','Cappuccino','Latte','Americano','Flat White','Piccolo','Iced Latte','Iced Long Black'
            ]} value={coffee} onChange={setCoffee} />
            <Select label="Select milk type" options={['None','Cow','Oat','Almond','Soy']} value={milk} onChange={setMilk} />
            <Textarea placeholder="Any special requests? (Optional)" value={notes} onChange={setNotes} />
            <Button onClick={handlePlace} disabled={!name||!coffee||!milk}>Place Order</Button>
          </Card>
        )}

        {activeTab === 'status' && (
          <div className="space-y-4">
            {orders.length === 0 && <Alert>No orders yet.</Alert>}
            {orders.map(order => (
              <Card key={order.id}>
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{order.coffee} – {order.name}</p>
                    <p className="text-sm text-gray-600">Milk: {order.milk}</p>
                    <p className="text-xs text-gray-400">Ordered at {new Date(order.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && <Button onClick={()=>updateStatus(order.id,'ready')} variant="outline">Mark Ready</Button>}
                    {order.status === 'ready' && <Button onClick={()=>updateStatus(order.id,'collected')}>Mark Collected</Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
