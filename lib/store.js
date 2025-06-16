// Simple in-memory store for development
// Replace with database in production
let orders = [];

export const getOrders = () => {
  return [...orders];
};

export const addOrder = (order) => {
  const newOrder = {
    id: Date.now(),
    ...order,
    status: 'pending',
    timestamp: new Date().toLocaleTimeString('en-US', { 
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    }),
  };
  orders.push(newOrder);
  return newOrder;
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orderIndex = orders.findIndex(order => order.id === parseInt(orderId));
  if (orderIndex !== -1) {
    orders[orderIndex] = {
      ...orders[orderIndex],
      status: newStatus,
      readyAt: newStatus === 'ready' ? new Date().toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
      }) : orders[orderIndex].readyAt,
      collectedAt: newStatus === 'collected' ? new Date().toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
      }) : orders[orderIndex].collectedAt
    };
    return orders[orderIndex];
  }
  return null;
};

export const deleteOrder = (orderId) => {
  const orderIndex = orders.findIndex(order => order.id === parseInt(orderId));
  if (orderIndex !== -1) {
    orders.splice(orderIndex, 1);
    return true;
  }
  return false;
};