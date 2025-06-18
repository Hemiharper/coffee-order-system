// app/components/OrderForm.jsx (MODIFIED)

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Loader2 } from 'lucide-react'; // Added Loader2 for loading indicator
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";

// IMPORTANT: onOrder prop now expects an object matching the API's requirements
// Added isLoading prop to disable button while submitting
const OrderForm = ({ onOrder, isLoading }) => {
  const [name, setName] = useState('');
  const [coffee, setCoffee] = useState(''); // This will map to coffeeType
  const [milk, setMilk] = useState(''); // This will map to milkOption
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

  const milkOptions = ['None', 'Cow', 'Oat', 'Almond', 'Soy']; // Keep 'None' for UI, convert to null for API

  const handleOrderSubmit = () => { // Renamed to avoid confusion with onOrder prop
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

    // Pass data in the format expected by your /api/orders POST endpoint
    onOrder({
      name: name.trim(),
      coffeeType: coffee, // Corrected to coffeeType
      milkOption: milk === 'None' ? 'None' : milk, // Corrected to milkOption, keep 'None' as string for Airtable consistency
      notes: notes,
    });

    // Clear form after submission attempt
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
          disabled={isLoading} // Disable input while loading
        />

        <Select
          value={coffee}
          onValueChange={setCoffee}
          disabled={isLoading} // Disable select while loading
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
          disabled={isLoading} // Disable select while loading
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
          disabled={isLoading} // Disable textarea while loading
        />

        <Button
          onClick={handleOrderSubmit} // Changed to handleOrderSubmit
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : (
            <Coffee className="w-5 h-5 mr-2" />
          )}
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
