"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShoppingBagIcon,
  StarIcon,
  MinusIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import toast from 'react-hot-toast';
import ProductGrid from '@/components/ProductGrid';

function ReviewSection({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product reviews
        const productRes = await fetch(`/api/products/${productId}`);
        const productData = await productRes.json();
        
        setReviews(productData.reviews || []);

        // Check if user can review
        if (user) {
          console.log(user);
          
          const orderRes = await fetch(`/api/orders?product=${productId}&user=${user.id}&status=Delivered`);
          const orderData = await orderRes.json();
          setCanReview(Array.isArray(orderData) && orderData.length > 0);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [productId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log(user.id);

      // First fetch the order with delivered status
      const orderResponse = await fetch(`/api/orders?product=${productId}&user=${user.id}&status=Delivered`);
      const orderData = await orderResponse.json();

      // Check if we have a valid order
      if (!orderData || !orderData.length) {
        throw new Error('No delivered order found for this product');
      }

      // Get the first matching order's ID
      const orderId = orderData[0]._id;

      // Now submit the review with the order ID
      const reviewResponse = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          comment,
          title: comment.slice(0, 50)
        }),
      });

      const reviewData = await reviewResponse.json();

      if (reviewResponse.ok) {
        setComment('');
        setRating(5);
        // Refresh reviews
        const productRes = await fetch(`/api/products/${productId}`);
        const productData = await productRes.json();
        console.log(productData.reviews);
        
        setReviews(productData.reviews || []);
        toast.success('Review submitted successfully');
      } else {
        setError(reviewData.error || 'Could not Fetch review');
        toast.error(reviewData.message || 'Could not Fetch review');
      }
    } catch (error) {
      setError('An error occurred while submitting the review');
      toast.error('An error occurred while submitting the review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Reviews</h2>
      <div className="space-y-4 mb-6">
        {reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
        {reviews.map((review, i) => (
          <div key={i} className="bg-gray-50 rounded p-4 shadow flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex items-center gap-1 text-yellow-500">
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </div>
            <div className="flex-1">{review.comment}</div>
            <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
      {canReview && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Your Rating:</span>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border p-1 rounded">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <textarea className="w-full border p-2 rounded" placeholder="Your review..." value={comment} onChange={e => setComment(e.target.value)} required />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
      {!canReview && user && <div className="text-gray-400">You can review this product after it is delivered.</div>}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`/api/products?category=${product.category._id}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current product
        const filtered = data.products.filter(p => p._id !== product._id);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!session) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    addToCart(product, selectedSize, quantity);
  };

  const handleWishlist = () => {
    if (!session) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    const isWishlisted = isInWishlist(product._id);
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products" className="text-purple-600 hover:text-purple-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const discountPercentage = product.onSale
    ? calculateDiscountPercentage(product.price, product.salePrice)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-purple-600">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category._id}`} className="hover:text-purple-600">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square mb-4 bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Sale Badge */}
              {product.onSale && discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white px-4 py-2 rounded-full font-semibold">
                  -{discountPercentage}%
                </div>
              )}

              {/* Featured/Trending Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.isFeatured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                )}
                {product.isTrending && (
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Trending
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 aspect-square w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === selectedImageIndex
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Title and Category */}
              <div className="mb-6">
                <Link
                  href={`/products?category=${product.category._id}`}
                  className="inline-block text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-3 hover:bg-purple-100 transition-colors"
                >
                  {product.category.name}
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
                <p className="text-gray-600 text-lg">{product.shortDescription}</p>
              </div>

              {/* Rating */}
              {product.averageRating > 0 && (
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.averageRating)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-3">
                    {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-8">
                {product.onSale ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl font-bold text-rose-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-2xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${selectedSize === size
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color
                          ? 'border-gray-800 ring-2 ring-gray-300'
                          : 'border-gray-300'
                          }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-rose-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-rose-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleWishlist}
                  className="px-6 py-4 border-2 border-gray-300 rounded-full hover:border-rose-500 hover:text-rose-500 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  {isWishlisted ? (
                    <HeartIconSolid className="w-6 h-6 text-rose-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Product Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 bg-gray-50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            {product.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </motion.div>

        {/* Reviews Section */}
        {product.reviews?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
            <div className="space-y-6">
              {product.reviews.map((review, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${i < review.rating
                              ? 'text-amber-400 fill-current'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Review Section */}
        <ReviewSection productId={product._id} user={session?.user} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <ProductGrid products={relatedProducts} />
          </motion.div>
        )}
      </div>
    </div>
  );
}