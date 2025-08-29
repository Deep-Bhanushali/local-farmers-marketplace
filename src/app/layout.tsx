import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
const inter = Inter({ subsets: ["latin"] });
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "FarmMarket",
  description: "Fresh produce from local farmers, delivered to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                className: "",
                duration: 5000,
                style: {
                  background: "black",
                  color: "#ccc",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "green",
                    secondary: "black",
                  },
                },
              }}
            />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
