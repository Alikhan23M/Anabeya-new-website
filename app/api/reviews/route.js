import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import Review from '@/lib/models/Review';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import  connectDB  from '@/lib/mongodb';

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, orderId, rating, title, comment, images } = await request.json();

    // Validate required fields
    if (!productId || !orderId || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if rating is valid
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify that the order exists and belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
      status: 'Delivered'
    });

    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found or not delivered' 
      }, { status: 404 });
    }

    // Check if product exists in the order
    const orderItem = order.items.find(item => item.product.toString() === productId);
    if (!orderItem) {
      return NextResponse.json({ 
        error: 'Product not found in this order' 
      }, { status: 404 });
    }

    // Check if review already exists for this product and order
    const existingReview = await Review.findOne({
      user: session.user.id,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return NextResponse.json({ 
        error: 'Your Review already exists for this product and order' 
      }, { status: 409 });
    }

    // Create the review
    const review = new Review({
      product: productId,
      user: session.user.id,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
      verified: true, // Auto-verify for delivered orders
      status: 'approved' // Auto-approve for delivered orders
    });

    await review.save();

    // Update product's average rating
    const { averageRating, reviewCount } = await Review.calculateAverageRating(productId);
    await Product.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount
    });

    return NextResponse.json({ 
      success: true, 
      review,
      averageRating,
      reviewCount
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'approved';
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;

    const query = {};
    
    if (productId) query.product = productId;
    if (userId) query.user = userId;
    if (status) query.status = status;

    const reviews = await Review.find(query)
      .populate('user', 'name image')
      .populate('product', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' }, 
      { status: 500 }
    );
  }
}

