"use client";
import { usePathname } from 'next/navigation';
import React from 'react'
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function LayoutComponent({ children }) {
     const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
    return (
        <>
       <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <BottomNav />}
    </div>
        </>
    )
}
