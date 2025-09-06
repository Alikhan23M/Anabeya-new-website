"use client";

import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import OrderModal from "@/components/ui/OrderModal"; // <-- import the modal here
import toast from "react-hot-toast";
import { useState } from "react";

export default function CartPage() {
     const [orderModalOpen, setOrderModalOpen] = useState(false);
     const [placingOrder, setPlacingOrder] = useState(false);

  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart();

  if (!items.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.product.onSale
              ? item.product.salePrice
              : item.product.price;
            return (
              <div
                key={`${item.product._id}-${item.size}`}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={item.product.images?.[0] || "/placeholder.png"}
                    alt={item.product.title}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <h2 className="font-semibold">{item.product.title}</h2>
                    {item.size && (
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                    )}
                    <p className="font-medium">${price}</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    onClick={() =>
                      updateQuantity(item.product._id, item.size, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <span className="px-3 py-1 bg-gray-50 rounded">{item.quantity}</span>
                  <button
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    onClick={() =>
                      updateQuantity(item.product._id, item.size, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  className="text-rose-500 hover:text-rose-700 hover:underline transition-colors"
                  onClick={() => removeFromCart(item.product._id, item.size)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-bold">${getCartTotal().toFixed(2)}</span>
          </div>

          {/* Replace old Place Order button with modal */}
                     <button
            onClick={() => setOrderModalOpen(true)}
            disabled={placingOrder}
            className="w-full bg-gradient-to-r from-purple-600 to-rose-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-rose-700 disabled:opacity-50 transition-all duration-200"
          >
            {placingOrder ? 'Placing Order...' : 'Place Order'}
          </button>

      {/* Pass open state and setter to modal */}
      <OrderModal open={orderModalOpen} setOpen={setOrderModalOpen} />

          <button
            onClick={clearCart}
            className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all duration-200"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
