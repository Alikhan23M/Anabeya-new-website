import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Review from '@/lib/models/Review';
import '@/lib/models/Category';

export async function GET(request, context) {
  try {
    await connectDB();

    // Handle Next.js async params for edge/route handlers
    const { id } = await context.params;

    let product = await Product.findById(id)
      .populate('category', 'name')
      .lean();

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ product: id })
      .populate('user', 'name image')  // Get user's name and image
      .sort({ createdAt: -1 })  // Sort by newest first
      .lean();

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Add reviews and rating data to product
    product = {
      ...product,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,  // Round to 1 decimal place
      totalReviews: reviews.length
    };

    return Response.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}