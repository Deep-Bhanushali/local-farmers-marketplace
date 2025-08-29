"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import Pusher from "pusher-js";

// Define a type for our notification payload for type safety
interface OrderNotification {
  message: string;
  orderId: string;
  customerName: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // State to store incoming notifications
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }

    // --- PUSHER CLIENT-SIDE LOGIC ---
    // Only set up Pusher if the user is a logged-in farmer
    if (!loading && user && user.role === "farmer") {
      // Initialize Pusher with authentication endpoint
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth", // Our new authentication route
      });

      // Subscribe to the farmer's private channel
      const channelName = `private-farmer-${user._id}`;
      const channel = pusher.subscribe(channelName);

      // Listen for the 'new-order' event
      channel.bind("new-order", (data: OrderNotification) => {
        // Update state with the new notification
        setNotifications((prevNotifications) => [data, ...prevNotifications]);

        // Optional: You can also show a browser notification or a toast message here
        alert(`New Order Received: ${data.message}`);
      });

      // Cleanup function to unsubscribe when the component unmounts
      return () => {
        pusher.unsubscribe(channelName);
      };
    }
    // --- END PUSHER LOGIC ---
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Dashboard
        </h1>
        <p className="text-gray-700 mb-8">Welcome back, {user.name}.</p>

        {/* --- NOTIFICATION DISPLAY --- */}
        {user.role === "farmer" && notifications.length > 0 && (
          <div className="mb-8 p-4 bg-blue-100 border border-blue-200 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              New Order Notifications
            </h2>
            <ul className="space-y-2">
              {notifications.map((notif, index) => (
                <li
                  key={index}
                  className="text-blue-800 p-2 bg-blue-50 rounded"
                >
                  <strong>{notif.customerName}</strong> placed a new order!
                  &quot;
                  {notif.message}&quot;
                  <Link
                    href={`/orders/${notif.orderId}`}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    View Order
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* --- END NOTIFICATION DISPLAY --- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/orders"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your Orders
            </h2>
            <p className="text-gray-600">
              View your recent orders and their status.
            </p>
          </Link>

          <Link
            href="/products"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Browse Products
            </h2>
            <p className="text-gray-600">
              Continue shopping from local farmers.
            </p>
          </Link>

          {user.role === "farmer" && (
            <Link
              href="/products"
              className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Listings
              </h2>
              <p className="text-gray-600">
                Create and update your product listings.
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
