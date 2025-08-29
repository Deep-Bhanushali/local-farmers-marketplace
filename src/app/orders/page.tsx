"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Filter,
  Calendar,
  DollarSign,
  MapPin,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket"; // 1. Import the custom socket hook
import Header from "@/components/Header";
import toast from "react-hot-toast";

// --- Type Definitions for Data Integrity ---

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  status: string;
  paymentStatus: string;
  dateRange: string;
}

// --- UI Configuration Objects ---

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  paid: { label: "Paid", color: "text-green-600", bgColor: "bg-green-100" },
  failed: { label: "Failed", color: "text-red-600", bgColor: "bg-red-100" },
  refunded: {
    label: "Refunded",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

// --- React Component ---

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const socket = useSocket();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    paymentStatus: "",
    dateRange: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("sales");

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const view = user.role === "farmer" ? activeTab : "purchases";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        view,
        ...filters,
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("An error occurred while fetching orders.");
    } finally {
      setLoading(false);
    }
  }, [user, filters, currentPage, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 3. ADDED: useEffect to listen for real-time socket events
  useEffect(() => {
    if (socket && user?.role === "farmer" && activeTab === "sales") {
      const handleNewOrder = (newOrderData: Order) => {
        toast.success(
          `You have a new sale! Order #${newOrderData._id.slice(-6)}`
        );
        fetchOrders(); // Re-fetch the order list to show the new one
      };

      socket.on("new_order", handleNewOrder);

      return () => {
        socket.off("new_order", handleNewOrder);
      };
    }
  }, [socket, user, activeTab, fetchOrders]);

  useEffect(() => {
    const isViewingPurchases =
      user?.role !== "farmer" ||
      (user?.role === "farmer" && activeTab === "purchases");

    if (socket && isViewingPurchases) {
      const handleStatusUpdate = (data: {
        orderId: string;
        status: OrderStatus;
        message: string;
      }) => {
        toast.success(
          data.message || `An order has been updated to "${data.status}"!`,
          { icon: "🚚" }
        );
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
      };
      socket.on("order_status_update", handleStatusUpdate);
      return () => {
        socket.off("order_status_update", handleStatusUpdate);
      };
    }
  }, [socket, user, activeTab, fetchOrders]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Order status updated successfully");
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("An error occurred while updating the status.");
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    const config = statusConfig[status];
    const IconComponent = config?.icon || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view orders
          </h2>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary-600 text-white rounded-md"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-2 text-gray-600">
              {user?.role === "farmer"
                ? "Manage your purchases and sales"
                : "Track your order history"}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {user?.role === "farmer" && (
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("sales")}
                className={`${
                  activeTab === "sales"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                My Sales
              </button>
              <button
                onClick={() => setActiveTab("purchases")}
                className={`${
                  activeTab === "purchases"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                My Purchases
              </button>
            </nav>
          </div>
        )}

        {showFilters && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  handleFilterChange({ paymentStatus: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Payment Statuses</option>
                {Object.entries(paymentStatusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange({ dateRange: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-6 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              {user?.role === "farmer"
                ? activeTab === "sales"
                  ? "You haven't received any sales yet."
                  : "You haven't placed any orders yet."
                : "You haven't placed any orders yet."}
            </p>
            {user?.role !== "farmer" || activeTab === "purchases" ? (
              <button
                onClick={() => router.push("/products")}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md"
              >
                Browse Products
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusConfig[order.status].bgColor
                        } ${statusConfig[order.status].color}`}
                      >
                        {getStatusIcon(order.status)}{" "}
                        {statusConfig[order.status].label}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          paymentStatusConfig[order.paymentStatus].bgColor
                        } ${paymentStatusConfig[order.paymentStatus].color}`}
                      >
                        {paymentStatusConfig[order.paymentStatus].label}
                      </span>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 relative">
                          <Image
                            src={item.product.images[0] || "/placeholder.png"}
                            alt={item.product.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-start">
                    {user?.role === "farmer" && activeTab === "sales" ? (
                      <>
                        <User className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-900">Customer</p>
                          <p>{order.customer?.name ?? "N/A"}</p>
                          <p>{order.customer?.email ?? "N/A"}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-900">
                            Shipping Address
                          </p>
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View Details
                      </button>
                      {user?.role === "farmer" &&
                        activeTab === "sales" &&
                        order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(
                                order._id,
                                e.target.value as OrderStatus
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            {Object.entries(statusConfig).map(
                              ([key, config]) => (
                                <option key={key} value={key}>
                                  {config.label}
                                </option>
                              )
                            )}
                          </select>
                        )}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      Total: ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === i + 1
                      ? "text-white bg-primary-600 border border-primary-600"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
