// app/components/OrderForm.jsx

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Coffee, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";

const OrderForm = ({ onOrder, isLoading }) => {
  const [name, setName] = useState('');
  // Set initial state to undefined to ensure placeholders are shown correctly
  const [coffee, setCoffee] = useState(undefined);
  const [milk, setMilk] = useState(undefined);
  const [extras, setExtras] = useState(undefined); // New state for extras
  const [notes, setNotes] = useState('');

  // Updated coffee options list
  const coffeeOptions = [
    'Espresso',
    'Cappuccino',
    'Latte',
    'Long Black',
    'Flat White',
    'Piccolo',
    'Iced Latte',
    'Iced Long Black',
    'Chai Latte' // Added
  ];

  const milkOptions = ['None', 'Cow', 'Oat', 'Almond', 'Soy'];
  
  // New list for extras options
  const extrasOptions = [
    'Extra shot', 'Sugar', 'Honey'
  ];

  const handleOrderSubmit = (e) => {
    e.preventDefault(); 

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

    // Pass the new 'extras' field in the order details
    onOrder({
      name: name.trim(),
      coffeeType: coffee,
      milkOption: milk,
      extras: extras, // Added extras
      notes: notes,
    });

    // Reset form to its initial state
    setName('');
    setCoffee(undefined);
    setMilk(undefined);
    setExtras(undefined);
    setNotes('');
  };

  return (
    <form onSubmit={handleOrderSubmit}>
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
            disabled={isLoading}
            required
            />
            
            {/* === CHANGES ARE IN THIS SECTION === */}
            <Select value={coffee} onValueChange={setCoffee} disabled={isLoading} required>
            <SelectTrigger className="font-sans h-12 text-base">
                <SelectValue placeholder="Coffee Type" />
            </SelectTrigger>
            <SelectContent>
                {coffeeOptions.map((option) => (
                <SelectItem key={option} value={option} className="font-sans text-base py-3">
                    {option}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>

            <Select value={milk} onValueChange={setMilk} disabled={isLoading} required>
            <SelectTrigger className="font-sans h-12 text-base">
                <SelectValue placeholder="Milk Option" />
            </SelectTrigger>
            <SelectContent>
                {milkOptions.map((option) => (
                <SelectItem key={option} value={option} className="font-sans text-base py-3">
                    {option}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>

            {/* New Extras Dropdown */}
            <Select value={extras} onValueChange={setExtras} disabled={isLoading}>
                <SelectTrigger className="font-sans h-12 text-base">
                    <SelectValue placeholder="Extras" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="" className="font-sans text-base py-3">None</SelectItem>
                    {extrasOptions.map((option) => (
                    <SelectItem key={option} value={option} className="font-sans text-base py-3">
                        {option}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-24 font-sans text-base resize-none"
            disabled={isLoading}
            />

            <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
            disabled={isLoading}
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
    </form>
  );
};

export default OrderForm;
