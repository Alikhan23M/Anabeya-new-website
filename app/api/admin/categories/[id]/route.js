// This file manages a specific admin category by ID (CRUD operations).
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

export async function PUT(request, { params }) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const isActive = formData.get('isActive') !== 'false';
    const existingImage = formData.get('existingImage');
    const imageFile = formData.get('image');

    await connectDB();

    let imageUrl = existingImage || '';
    
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadImage(buffer);
      imageUrl = result.secure_url;
    }

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        name,
        description,
        image: imageUrl,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    return Response.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    // Check if any products use this category
    const productsCount = await Product.countDocuments({ category: params.id });
    if (productsCount > 0) {
      return Response.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    const category = await Category.findById(params.id);
    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete image from Cloudinary if exists
    if (category.image) {
      try {
        const publicId = category.image.split('/').pop().split('.')[0];
        await deleteImage(`anabeya-collection/${publicId}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Category.findByIdAndDelete(params.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}