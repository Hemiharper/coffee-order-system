
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Coffee, Clock, Check, XCircle, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";

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

  const coffeeOptions = ["Espresso", "Cappuccino", "Latte", "Americano", "Flat White", "Piccolo", "Iced Latte", "Iced Long Black"];
  const milkOptions = ["None", "Cow", "Oat", "Almond", "Soy"];

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
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="space-y-4 p-6">
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="text-base h-12" />

        <Select value={coffee} onValueChange={setCoffee}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select coffee" />
          </SelectTrigger>
          <SelectContent>
            {coffeeOptions.map((option) => (
              <SelectItem key={option} value={option} className="text-base py-2">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={milk} onValueChange={setMilk}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select milk type" />
          </SelectTrigger>
          <SelectContent>
            {milkOptions.map((option) => (
              <SelectItem key={option} value={option} className="text-base py-2">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Any special requests? (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-24 text-base resize-none"
        />

        <Button onClick={handleOrder} className="h-12 text-base font-semibold w-full">
          <Coffee className="mr-2 h-5 w-5" />
          Place Order
        </Button>
      </CardContent>
    </Card>
  );
};

const CoffeeOrderSystem = ({ role = "customer" }) => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("order");

  useEffect(() => {
    setOrders(getOrdersFromStorage());
    const interval = setInterval(() => {
      setOrders(getOrdersFromStorage());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOrder = (orderDetails) => {
    const newOrder = {
      id: Date.now(),
      ...orderDetails,
      status: "pending",
      timestamp: new Date().toLocaleTimeString(),
    };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
  };

  const updateOrderStatus = (id, status) => {
    const updated = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            status,
            readyAt: status === "ready" ? new Date().toLocaleTimeString() : order.readyAt,
            collectedAt: status === "collected" ? new Date().toLocaleTimeString() : order.collectedAt,
          }
        : order
    );
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const cancelOrder = (id) => {
    const updated = orders.filter((order) => order.id !== id);
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const sorted = [...orders].sort((a, b) => {
    const rank = { pending: 1, ready: 2, collected: 3 };
    return rank[a.status] - rank[b.status] || new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl whitespace-nowrap">
            <Coffee className="w-5 h-5" />
            /coffee.ai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="order">Order Coffee</TabsTrigger>
              <TabsTrigger value="status">Order Status</TabsTrigger>
            </TabsList>
            <TabsContent value="order">
              {role === "customer" && <OrderForm onOrder={handleOrder} />}
              
            </TabsContent>
            <TabsContent value="status">
              <div className="space-y-4">
                {sorted.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{order.item.name} – {order.name}</h4>
                          {order.milk && <p className="text-sm text-gray-600">Milk: {order.milk}</p>}
                          {order.notes && <p className="text-sm text-gray-600">Notes: {order.notes}</p>}
                          <p className="text-xs text-gray-400">Ordered at {order.timestamp}</p>
                          {order.readyAt && <p className="text-xs text-gray-400">Ready: {order.readyAt}</p>}
                          {order.collectedAt && <p className="text-xs text-gray-400">Collected: {order.collectedAt}</p>}
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                          {role === "barista" && order.status === "pending" && (
                            <Button onClick={() => updateOrderStatus(order.id, "ready")}>
                              Mark Ready
                            </Button>
                          )}
                          {role === "barista" && order.status === "ready" && (
                            <>
                              <Button onClick={() => updateOrderStatus(order.id, "pending")} className="bg-yellow-500 hover:bg-yellow-600">
                                Mark Pending
                              </Button>
                              <Button onClick={() => updateOrderStatus(order.id, "collected")}>
                                Mark Collected
                              </Button>
                            </>
                          )}
                          {role === "barista" && order.status === "collected" && (
                            <span className="text-blue-600 flex items-center gap-1">
                              <Package className="h-4 w-4" /> Collected
                            </span>
                          )}
                          {role === "customer" && order.status === "pending" && (
                            <span className="text-yellow-600 flex items-center gap-1">
                              <Clock className="h-4 w-4" /> Pending
                            </span>
                          )}
                          {role === "customer" && order.status === "ready" && (
                            <span className="text-green-600 flex items-center gap-1">
                              <Check className="h-4 w-4" /> Ready for pickup!
                            </span>
                          )}
                          {role === "customer" && order.status === "collected" && (
                            <span className="text-blue-600 flex items-center gap-1">
                              <Package className="h-4 w-4" /> Collected
                            </span>
                          )}
                          {role === "customer" && order.status === "pending" && (
                            <Button onClick={() => cancelOrder(order.id)} variant="destructive">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {orders.length === 0 && (
                  <Alert>
                    <AlertDescription>No orders yet.</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoffeeOrderSystem;

// Footer navigation link to barista view
export function FooterNav() {
  return (
    <p className="text-center text-xs text-gray-400 mt-8">
      <a href="/baristaview" className="underline hover:text-white">Barista view</a>
    </p>
  );
}
