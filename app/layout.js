// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./provider.js";
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
       <head>
        {/* PWA manifest + theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e4b68a" />

        {/* iOS support */}
        <link rel="apple-touch-icon" href="/images/anabeya.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <Providers>
          <LayoutComponent>{children}</LayoutComponent>
        </Providers>
      </body>
    </html>
  );
}
