"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export default function OrderModal({ open, setOpen }) {
  const { items, getCartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    sizeDescription: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) {
      toast.error('Cart is empty');
      return;
    }
    // Validate required fields (basic)
    if (!formData.name || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          customerInfo: {
            name: formData.name,
            phone: formData.phone,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country,
            },
          },
          sizeDescription: formData.sizeDescription,
          totalAmount: getCartTotal(),
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      toast.success(`Order placed successfully! Order Number: ${data.orderNumber}`);
      clearCart();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full p-6 bg-white rounded-lg shadow-xl -translate-x-1/2 -translate-y-1/2 border border-gray-200">
        <Dialog.Title className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">Place Your Order</Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-auto">
          <fieldset className="space-y-2">
            <label htmlFor="name" className="block font-medium">Name *</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="phone" className="block font-medium">Phone *</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="street" className="block font-medium">Street *</label>
            <input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="city" className="block font-medium">City *</label>
            <input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="state" className="block font-medium">State *</label>
            <input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="zipCode" className="block font-medium">Zip Code *</label>
            <input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="country" className="block font-medium">Country *</label>
            <input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="sizeDescription" className="block font-medium">Size Description (Optional)</label>
            <textarea
              id="sizeDescription"
              name="sizeDescription"
              value={formData.sizeDescription}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              rows={3}
            />
          </fieldset>

          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold">Total: ${getCartTotal().toFixed(2)}</span>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-rose-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-rose-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>

        <Dialog.Close asChild>
          <button className="absolute top-3 right-3 text-gray-500 hover:text-purple-600 transition-colors">&times;</button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
