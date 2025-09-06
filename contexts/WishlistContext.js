"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Detect custom JWT token from localStorage (if using custom auth)
  const getAuthHeaders = () => {
    if (session?.user) {
      // NextAuth session (cookies handled automatically)
      return {};
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!session && !localStorage.getItem("token")) {
      setWishlist([]);
      return;
    }
    // Skip for admin accounts
    if (session?.user?.isAdmin) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        setWishlist([]);
        return;
      }

      const data = await res.json();
      setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
    } catch (err) {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Add product to wishlist
  const addToWishlist = async (product) => {
    if (!session && !localStorage.getItem("token")) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (res.ok) {
        await fetchWishlist();
        toast.success("Added to wishlist");
      } else {
        toast.error("Failed to add to wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding to wishlist");
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!session && !localStorage.getItem("token")) return;

    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        await fetchWishlist();
        toast.success("Removed from wishlist");
      } else {
        toast.error("Failed to remove from wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error removing from wishlist");
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!session && !localStorage.getItem("token")) return;

    try {
      const res = await fetch("/api/wishlist/clear", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (res.ok) {
        setWishlist([]);
        toast.success("Wishlist cleared successfully");
      } else {
        toast.error("Failed to clear wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error clearing wishlist");
    }
  };

  // Check if a product is already in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  // Auto-fetch when auth state changes
  useEffect(() => {
    fetchWishlist();
  }, [session]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
