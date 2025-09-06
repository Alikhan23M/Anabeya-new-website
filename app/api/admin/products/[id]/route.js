import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

// This file manages a specific admin product by ID (CRUD operations).

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id)
      .populate('category', 'name')
      .lean();

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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
    const isActive = formData.get('isActive') !== 'false';
    const existingImages = JSON.parse(formData.get('existingImages') || '[]');

    await connectDB();

    const product = await Product.findById(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    let images = [...existingImages];
    const newImageFiles = formData.getAll('images');

    // Upload new images
    for (const file of newImageFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await uploadImage(buffer);
        images.push(result.secure_url);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
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
        isActive,
      },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    return Response.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete images from Cloudinary
    for (const imageUrl of product.images) {
      try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await deleteImage(`anabeya-collection/${publicId}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Product.findByIdAndDelete(params.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}