import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { generateOrderNumber } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, customerInfo, totalAmount, sizeDescription } = await request.json();

    if (!items?.length || !customerInfo || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      user: session.user.id,
      orderNumber,
      items: items.map((item) => ({
        product: item.product._id || item.product,
        quantity: item.quantity,
        price: item.product.onSale ? item.product.salePrice : item.product.price,
        size: item.size,
      })),
      customerInfo: {
        ...customerInfo,
        sizeDescription,
      },
      totalAmount,
    });

    // Clear user's cart after successful order
    await User.findByIdAndUpdate(session.user.id, { cart: [] });

    // Send notification to admin about new order
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          title: 'New Order Received',
          message: `Order #${orderNumber} has been placed for $${totalAmount}`,
          data: {
            orderId: order._id,
            orderNumber: orderNumber,
            customerName: customerInfo.name,
            customerEmail: session.user.email,
            totalAmount: totalAmount,
            itemCount: items.length,
            timestamp: new Date().toISOString()
          }
        }),
      });
    } catch (notificationError) {
      // Don't fail order creation if notification fails
      console.error('Failed to send admin notification:', notificationError);
    }

    return NextResponse.json({ success: true, orderNumber }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get URL parameters
    const url = new URL(request.url);
    const productId = url.searchParams.get('product');
    const userId = url.searchParams.get('user');

    let query = { user: session.user.id }; // Default query for user's orders

    // If both productId and userId are provided, filter by them
    if (productId && userId) {
      query = {
        user: userId,
        'items.product': productId
      };
    }

    const orders = await Order.find(query)
      .populate("items.product", "title images price salePrice onSale")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
