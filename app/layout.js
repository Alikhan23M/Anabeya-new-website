// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./provider.js";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import LayoutComponent from "@/components/LayoutComponent";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Anabeya Collection - Premium Handmade Clothing",
  description:
    "Discover unique, handmade clothing pieces crafted with love and attention to detail.",
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LayoutComponent>{children}</LayoutComponent>
        </Providers>
      </body>
    </html>
  );
}
