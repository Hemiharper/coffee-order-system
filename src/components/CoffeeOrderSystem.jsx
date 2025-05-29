import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Coffee, Clock, Check, XCircle, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";

const getOrdersFromStorage = () => {
  try {
    const orders = localStorage.getItem("coffeeOrders");
    return orders ? JSON.parse(orders) : [];
  } catch {
    return [];
  }
};

const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem("coffeeOrders", JSON.stringify(orders));
  } catch {}
};

const OrderForm = ({ onOrder }) => {
  const [name, setName] = useState("");
  const [coffee, setCoffee] = useState("");
  const [milk, setMilk] = useState("");
  const [notes, setNotes] = useState("");

  const coffeeOptions = ["Espresso", "Cappuccino", "Latte", "Americano"];
  const milkOptions = ["None", "Cow", "Oat", "Almond"];

  const handleOrder = () => {
    if (!name || !coffee || !milk) {
      alert("Please complete all fields");
      return;
    }
    onOrder({
      item: { name: coffee },
      milk: milk === "None" ? null : milk,
      notes,
      name,
    });
    setName("");
    setCoffee("");
    setMilk("");
    setNotes("");
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />

        <Select value={coffee} onValueChange={setCoffee}>
          <SelectTrigger>
            <SelectValue placeholder="Select coffee" />
          </SelectTrigger>
          <SelectContent>
            {coffeeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={milk} onValueChange={setMilk}>
          <SelectTrigger>
            <SelectValue placeholder="Select milk type" />
          </SelectTrigger>
          <SelectContent>
            {milkOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Any special requests? (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Button onClick={handleOrder}>Place Order</Button>
      </CardContent>
    </Card>
  );
};

const CoffeeOrderSystem = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("order");

  useEffect(() => {
    setOrders(getOrdersFromStorage());
    const interval = setInterval(() => {
      setOrders(getOrdersFromStorage());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOrder = (orderDetail
