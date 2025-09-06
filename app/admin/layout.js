// app/admin/layout.js
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect non-admin users to /admin/login except if already on /admin/login
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (!session?.user?.isAdmin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [session, status, router, pathname]);

  if (status === "loading") {
    return null; // Or loading spinner
  }

  // Allow /admin/login to render without admin session
  if (!session?.user?.isAdmin && pathname !== "/admin/login") {
    return null; // Block access to other admin pages for non-admin users
  }

  const navLinks = [
    {
      href: "/admin",
      label: "Analytics",
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 19V6M7 19V10M15 19V14M19 19V12"
          />
        </svg>
      ),
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-6a2 2 0 00-2 2v5a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4"
          />
        </svg>
      ),
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 bg-white shadow-md p-4 flex-shrink-0 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <nav className="flex flex-col gap-3 mb-8 flex-grow">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center p-2 rounded hover:bg-blue-50 hover:text-blue-600"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full bg-red-100 text-red-600 py-2 rounded font-semibold mt-auto"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
