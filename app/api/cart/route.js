import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';

// GET cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).populate('cart.product');
  return Response.json(user?.cart || []);
}

// ADD to cart
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { productId, quantity, size } = body;
  const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);

  if (!productId) {
    return Response.json({ error: 'Missing product' }, { status: 400 });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }

  // Check if same product + same size exists
  const existing = user.cart.find(
    item => item.product.toString() === productId && item.size === size
  );

  if (existing) {
    existing.quantity = (existing.quantity || 1) + safeQuantity;
  } else {
    user.cart.push({ product: productId, size, quantity: safeQuantity });
  }

  await user.save();
  await user.populate('cart.product');

  return Response.json(user.cart);
}

// REMOVE from cart
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { productId, size } = body;

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  user.cart = user.cart.filter(
    item => !(item.product.toString() === productId && item.size === size)
  );

  await user.save();
  await user.populate('cart.product');

  return Response.json(user.cart);
}

// UPDATE quantity
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { productId, size, quantity } = body;
  const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  const itemIndex = user.cart.findIndex(
    item => item.product.toString() === productId && item.size === size
  );

  if (itemIndex >= 0) {
    user.cart[itemIndex].quantity = safeQuantity;
    await user.save();
    await user.populate('cart.product');
  }

  return Response.json(user.cart);
}
