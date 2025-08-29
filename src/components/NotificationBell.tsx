"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import toast from "react-hot-toast";
// import { INotification } from "@/models/Notification";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ClientNotification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  link: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(
    async (isPolling = false) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data: ClientNotification[] = await response.json();

          // If polling, check for new unread notifications and show a toast
          if (isPolling) {
            const newUnread = data.filter((n) => !n.read);
            const oldUnreadCount = notifications.filter((n) => !n.read).length;

            if (newUnread.length > oldUnreadCount) {
              toast.success(newUnread[0].message, { icon: "🔔" });
            }
          }
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    },
    [notifications]
  );

  // Fetch on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]); // Rerun if notifications change

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );

      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      // Revert UI on failure if needed
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 font-bold border-b">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notif) => (
                <Link href={`/orders/${notif.link}`} key={notif._id}>
                  <div
                    className={`p-4 border-b hover:bg-gray-50 ${
                      !notif.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt))} ago
                    </p>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="mt-2 text-xs text-primary-600 font-semibold flex items-center gap-1"
                      >
                        <Check size={14} /> Mark as Read
                      </button>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
