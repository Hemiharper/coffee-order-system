export function getOrdersFromStorage() {
  const stored = localStorage.getItem('coffeeOrders');
  return stored ? JSON.parse(stored) : [];
}

export function saveOrdersToStorage(orders) {
  localStorage.setItem('coffeeOrders', JSON.stringify(orders));
}
