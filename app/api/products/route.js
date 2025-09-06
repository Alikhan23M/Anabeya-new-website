import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const onSale = searchParams.get('onSale') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (onSale) {
      filter.onSale = true;
    }

    if (featured) {
      filter.isFeatured = true;
    }

    if (trending) {
      filter.isTrending = true;
    }

    // Price filter
    if (minPrice > 0 || maxPrice < 999999) {
      filter.$or = [
        {
          onSale: true,
          salePrice: { $gte: minPrice, $lte: maxPrice }
        },
        {
          onSale: false,
          price: { $gte: minPrice, $lte: maxPrice }
        }
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    return Response.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}