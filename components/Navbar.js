"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function Navbar() {
  const { data: session } = useSession();
  const { items } = useCart();
  const { wishlist } = useWishlist(); // FIX: match context
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate total items in cart (respect quantity)
  const cartCount = Array.isArray(items) ? items.length : 0;

    console.log('Cart Count:', cartCount);

  // Wishlist count
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Anabeya Collection
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-8 pl-4">
            <Link href="/" className="text-neutral-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-neutral-700 hover:text-primary-600 transition-colors">
              Products
            </Link>
            {/* <Link href="/categories" className="text-neutral-700 hover:text-primary-600 transition-colors">
              Categories
            </Link> */}
            <Link href="/about" className="text-neutral-700 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-neutral-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                {/* Wishlist */}
                <Link href="/wishlist" className="relative p-2 text-neutral-700 hover:text-secondary-600 transition-colors">
                  <HeartIcon className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link href="/cart" className="relative p-2 text-neutral-700 hover:text-primary-600 transition-colors">
                  <ShoppingBagIcon className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6" />
                    )}
                    <span className="hidden lg:block">{session.user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50">
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50">
                      My Orders
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-neutral-700 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-2 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </form>

            <Link href="/" className="block py-2 text-neutral-700 hover:text-primary-600">
              Home
            </Link>
            <Link href="/products" className="block py-2 text-neutral-700 hover:text-primary-600">
              Products
            </Link>
            <Link href="/categories" className="block py-2 text-neutral-700 hover:text-primary-600">
              Categories
            </Link>
            <Link href="/about" className="block py-2 text-neutral-700 hover:text-primary-600">
              About
            </Link>
            <Link href="/contact" className="block py-2 text-neutral-700 hover:text-primary-600">
              Contact
            </Link>

            {session ? (
              <>
                <div className="flex items-center space-x-4 py-2">
                  <Link href="/wishlist" className="flex items-center space-x-2 text-neutral-700">
                    <HeartIcon className="w-5 h-5" />
                    <span>Wishlist ({wishlistCount})</span>
                  </Link>
                  <Link href="/cart" className="flex items-center space-x-2 text-neutral-700">
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span>Cart ({cartCount})</span>
                  </Link>
                </div>
                <Link href="/profile" className="block py-2 text-neutral-700">
                  Profile
                </Link>
                <Link href="/orders" className="block py-2 text-neutral-700">
                  My Orders
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left py-2 text-neutral-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4 py-2">
                <Link href="/auth/signin" className="text-neutral-700">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-primary-600 text-white px-4 py-2 rounded-full">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
