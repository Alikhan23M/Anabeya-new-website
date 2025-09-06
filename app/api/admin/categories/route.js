// This file manages admin categories (CRUD operations).

import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { uploadImage } from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return Response.json(categories);
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const imageFile = formData.get('image');

    await connectDB();

    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadImage(buffer);
      imageUrl = result.secure_url;
    }

    const category = await Category.create({
      name,
      description,
      image: imageUrl,
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}