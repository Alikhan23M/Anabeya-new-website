"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  useEffect(() => {
    fetchData();

    const isAdmin = localStorage.getItem("admin-auth");
    const dismissed = sessionStorage.getItem("dismiss-admin-prompt"); // so it shows once per session

    if (isAdmin && !window.location.pathname.startsWith("/admin") && !dismissed) {
      setShowAdminPrompt(true);
    }
  }, []);

   const handleDismiss = () => {
    setShowAdminPrompt(false);
    sessionStorage.setItem("dismiss-admin-prompt", "true"); // don’t show again in same session
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, trendingRes, categoriesRes] = await Promise.all([
        fetch('/api/products?featured=true&limit=4'),
        fetch('/api/products?trending=true&limit=8'),
        fetch('/api/categories'),
      ]);

      const [featured, trending, categoriesData] = await Promise.all([
        featuredRes.json(),
        trendingRes.json(),
        categoriesRes.json(),
      ]);

      setFeaturedProducts(featured.products || []);
      setTrendingProducts(trending.products || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">

      {/* Admin notfication for visiting admin panel */}
      {showAdminPrompt && (
        <div className="fixed top-5 right-5 z-50 bg-white shadow-lg border border-gray-200 rounded-lg p-4 max-w-sm">
          <p className="text-gray-800 font-medium mb-3">
            You’re logged in as an admin. Do you want to visit the Admin Panel?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
            >
              Dismiss
            </button>
            <Link
              href="/admin"
              className="px-3 py-1 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
            >
              Yes
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-start justify-center pt-24 md:pt-32 overflow-hidden">

        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.webp"
            alt="Fashion Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
            Anabeya Collection
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Handcrafted fashion pieces made with love and attention to detail
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-gradient-to-r from-purple-600 to-rose-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-rose-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Shop Now
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="w-8 h-8 text-amber-500" />
            <h2 className="text-4xl font-bold text-gray-900">Featured Products</h2>
            <SparklesIcon className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-xl text-gray-600">Handpicked pieces that showcase our finest craftsmanship</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <ProductGrid products={featuredProducts} loading={loading} />
        </motion.div>

        <div className="text-center mt-12">
          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-rose-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-rose-700 transition-all transform hover:scale-105"
          >
            View All Featured
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Explore our diverse collection of handmade clothing</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category._id}`}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <Image
                    src={category.image || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'}
                    alt={category.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white text-center">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
            >
              View All Categories
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trending Now</h2>
          <p className="text-xl text-gray-600">Discover what's popular in our community</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <ProductGrid products={trendingProducts} loading={loading} />
        </motion.div>

        <div className="text-center mt-12">
          <Link
            href="/products?trending=true"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-rose-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-rose-700 transition-all transform hover:scale-105"
          >
            View All Trending
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-rose-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Stay in Style</h2>
            <p className="text-xl text-purple-100 mb-8">
              Subscribe to our newsletter for exclusive offers and the latest fashion updates
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full border-0 focus:outline-none focus:ring-4 focus:ring-white/30"
                required
              />
              <button
                type="submit"
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}