import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";

const OrderForm = ({ onOrder }) => {
  const [name, setName] = useState('');
  const [coffee, setCoffee] = useState('');
  const [milk, setMilk] = useState('');
  const [notes, setNotes] = useState('');

  const coffeeOptions = [
    'Espresso',
    'Cappuccino', 
    'Latte',
    'Long Black',
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
      <CardContent className="p-6 space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Place Your Order</h2>
          <p className="text-gray-600">Fill in your details below to order your perfect coffee</p>
        </div>

        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-sans h-12 text-base"
        />

        <Select 
          value={coffee}
          onValueChange={setCoffee}
        >
          <SelectTrigger className="font-sans h-12 text-base">
            <SelectValue placeholder="Select your coffee" />
          </SelectTrigger>
          <SelectContent>
            {coffeeOptions.map((option) => (
              <SelectItem key={option} value={option} className="font-sans text-base py-3">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={milk}
          onValueChange={setMilk}
        >
          <SelectTrigger className="font-sans h-12 text-base">
            <SelectValue placeholder="Select milk type" />
          </SelectTrigger>
          <SelectContent>
            {milkOptions.map((option) => (
              <SelectItem key={option} value={option} className="font-sans text-base py-3">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
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

export default OrderForm;

