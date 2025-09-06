import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .select('name description image')
      .sort({ name: 1 })
      .lean();

    return Response.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}