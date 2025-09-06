"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = isInWishlist(product._id);
  const discountPercentage = product.onSale 
    ? calculateDiscountPercentage(product.price, product.salePrice)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      toast.error('Please login to add items to cart');
      return;
    }

    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
            {product.images && product.images[0] && product.images[0] !== '' && (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={400}
                height={400}
                className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
              />
            )}
          </div>

          {/* Sale Badge */}
          {product.onSale && discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              -{discountPercentage}%
            </div>
          )}

          {/* Featured/Trending Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
            )}
            {product.isTrending && (
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Trending
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <button
              onClick={handleWishlist}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors"
            >
              {isWishlisted ? (
                <HeartIconSolid className="w-5 h-5 text-rose-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={handleAddToCart}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-purple-50 transition-colors"
            >
              <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.shortDescription}
          </p>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.averageRating)
                        ? 'text-amber-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                ({product.totalReviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.onSale ? (
                <>
                  <span className="text-2xl font-bold text-rose-600">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            {product.stock === 0 && (
              <span className="text-sm text-red-500 font-semibold">
                Out of Stock
              </span>
            )}
          </div>

          {/* Category */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {product.category?.name}
            </span>
            
            <div className="flex items-center gap-2">
              {product.colors?.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}