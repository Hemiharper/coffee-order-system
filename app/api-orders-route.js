import { NextResponse } from 'next/server';
import { getOrders, addOrder, updateOrderStatus, deleteOrder } from '@/lib/store';

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json();
    const newOrder = addOrder(orderData);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { orderId, status } = await request.json();
    const updatedOrder = updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    const deleted = deleteOrder(orderId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}