import { addOrder, getOrders, updateOrderStatus, deleteOrder } from '../store';

function clearOrders() {
  const all = getOrders();
  all.forEach(o => deleteOrder(o.id));
}

afterEach(() => {
  clearOrders();
});

test('add and update order', () => {
  const order = addOrder({ item: 'Latte' });
  expect(getOrders().length).toBe(1);
  expect(order.status).toBe('pending');
  const updated = updateOrderStatus(order.id, 'ready');
  expect(updated.status).toBe('ready');
});

