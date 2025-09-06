// This file manages admin products (CRUD operations, listing, etc).

import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Settings from '@/lib/models/Settings';
import { uploadImage } from '@/lib/cloudinary';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;
    const filter = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    } : {};

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
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const shortDescription = formData.get('shortDescription');
    const price = parseFloat(formData.get('price'));
    const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice')) : null;
    const category = formData.get('category');
    const stock = parseInt(formData.get('stock') || '0');
    const sizes = JSON.parse(formData.get('sizes') || '[]');
    const colors = JSON.parse(formData.get('colors') || '[]');
    const tags = JSON.parse(formData.get('tags') || '[]');
    const isFeatured = formData.get('isFeatured') === 'true';
    const isTrending = formData.get('isTrending') === 'true';

    const images = [];
    const imageFiles = formData.getAll('images');

    await connectDB();

    // Check limits for featured/trending products
    const settings = await Settings.findOne() || {};
    
    if (isFeatured) {
      const featuredCount = await Product.countDocuments({ isFeatured: true });
      if (featuredCount >= (settings.maxFeaturedProducts || 6)) {
        return Response.json(
          { error: `Maximum ${settings.maxFeaturedProducts || 6} featured products allowed` },
          { status: 400 }
        );
      }
    }

    if (isTrending) {
      const trendingCount = await Product.countDocuments({ isTrending: true });
      if (trendingCount >= (settings.maxTrendingProducts || 8)) {
        return Response.json(
          { error: `Maximum ${settings.maxTrendingProducts || 8} trending products allowed` },
          { status: 400 }
        );
      }
    }

    // Upload images to Cloudinary
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await uploadImage(buffer);
        images.push(result.secure_url);
      }
    }

    const product = await Product.create({
      title,
      description,
      shortDescription,
      price,
      salePrice,
      onSale: !!salePrice,
      images,
      category,
      stock,
      sizes,
      colors,
      tags,
      isFeatured,
      isTrending,
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}