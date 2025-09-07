"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HeartIcon as HeartIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { getCartCount } = useCart();
  const { wishlist: wishlistItems } = useWishlist();

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      name: 'Search',
      href: '/products',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIconSolid,
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: HeartIcon,
      iconSolid: HeartIconSolid,
      badge: wishlistCount,
      requireAuth: true,
    },
    {
      name: 'Cart',
      href: '/cart',
      icon: ShoppingBagIcon,
      iconSolid: ShoppingBagIconSolid,
      badge: cartCount,
      requireAuth: true,
    },
    {
      name: 'Profile',
      href: session ? '/profile' : '/auth/login',
      icon: UserIcon,
      iconSolid: UserIconSolid,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;
          const showBadge = item.badge > 0 && (session || !item.requireAuth);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-purple-600' : 'text-gray-500'
                  }`}
                />
                {showBadge && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}