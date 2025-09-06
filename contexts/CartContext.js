"use client";
import { createContext, useContext, useReducer, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload };

    case "ADD_TO_CART":
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product._id === action.payload.product._id &&
          item.size === action.payload.size
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity +=
          action.payload.quantity || 1;
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.product._id === action.payload.productId &&
              item.size === action.payload.size
            )
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product._id === action.payload.productId &&
            item.size === action.payload.size
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCart();
    } else {
      dispatch({ type: "SET_CART", payload: [] });
    }
  }, [session]);

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      const serverCart = Array.isArray(data) ? data : data.cart || [];
      dispatch({ type: "SET_CART", payload: serverCart });
    } catch (err) {
      console.error("Error fetching cart:", err);
      dispatch({ type: "SET_CART", payload: [] });
    }
    setLoading(false);
  };

  // Add product to cart
  const addToCart = async (product, quantity = 1, size = null) => {
    if (!session) {
      toast.error("Please login to add to cart");
      return;
    }
    const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          size,
          quantity: safeQuantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");

      await fetchCart(); // Refresh state from server
      toast.success("Added to cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = async (productId, size) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, size }),
      });
      if (res.ok) {
        await fetchCart();
        toast.success("Removed from cart");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error removing from cart");
    }
  };

  const updateQuantity = async (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, size, quantity }),
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating quantity");
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST", credentials: "include"
      },);
      if (res.ok) {
        dispatch({ type: "CLEAR_CART" });
      }
    } catch (err) {
      toast.error("Error clearing cart");
    }
  };

  const getCartTotal = () =>
    state.items.reduce((total, item) => {
      const price = item.product.onSale
        ? item.product.salePrice
        : item.product.price;
      return total + price * item.quantity;
    }, 0);

  const getCartCount = () =>
    state.items.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        fetchCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
