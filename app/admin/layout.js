"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaChartBar,
  FaBoxOpen,
  FaShoppingCart,
  FaFolderOpen,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaRegFolderOpen,
} from "react-icons/fa";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isAdmin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [session, status, router, pathname]);

  if (status === "loading") {
    return null; // or a loader
  }

  if (!session?.user?.isAdmin && pathname !== "/admin/login") {
    return null;
  }

  const navLinks = [
    { href: "/admin", label: "Analytics", icon: <FaChartBar /> },
    { href: "/admin/orders", label: "Orders", icon: <FaBoxOpen /> },
    { href: "/admin/products", label: "Products", icon: <FaShoppingCart /> },
    { href: "/admin/categories", label: "Categories", icon: <FaFolderOpen /> },
    { href: "/admin/message", label: "Messages", icon: <FaRegFolderOpen /> },
    { href: "/admin/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
        >
          {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full md:h-auto z-40 
          w-64 bg-white shadow-md p-4 flex-shrink-0 flex flex-col 
          transform md:transform-none transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h2 className="text-2xl font-bold mb-6 hidden md:block">
          Admin Dashboard
        </h2>
        <nav className="flex flex-col gap-3 mb-8 flex-grow">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center p-2 rounded hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setSidebarOpen(false)} // close sidebar on mobile
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full bg-red-100 text-red-600 py-2 rounded font-semibold mt-auto flex items-center justify-center gap-2"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6 md:ml-0">{children}</main>
    </div>
  );
}
