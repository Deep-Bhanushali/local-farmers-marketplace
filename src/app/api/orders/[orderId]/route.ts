import { NextRequest, NextResponse } from "next/server";
import { Server } from "socket.io";
import dbConnect from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Stripe from "stripe";

// Import all required Mongoose models to ensure they are registered
import Order from "@/models/Order";
import Notification from "@/models/Notification";
// Initialize external services

interface PopulatedOrderItem {
  product: {
    farmer: {
      toString: () => string;
    };
  };
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);
/**
 * GET /api/orders/[orderId]
 * Fetches details for a single order.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    const order = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate({
        path: "items.product",
        select: "name price images farmer", // <-- FIX: Use 'farmer'
      });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization check
    const isCustomer = order.customer._id.toString() === user.userId;
    const isFarmerInvolved = order.items.some(
      (item: PopulatedOrderItem) =>
        item.product?.farmer?.toString() === user.userId // <-- FIX: Use 'farmer'
    );
    if (!isCustomer && !isFarmerInvolved) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view this order." },
        { status: 403 }
      );
    }

    // Retrieve and send the client_secret for payment
    let paymentIntentData = null;
    if (order.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId
      );
      paymentIntentData = { clientSecret: paymentIntent.client_secret };
    }

    return NextResponse.json({
      success: true,
      order,
      paymentIntent: paymentIntentData,
    });
  } catch (error: unknown) {
    console.error(`[API GET /api/orders/${params.orderId}] Error:`, error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[orderId]
 * Updates an order's status.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const io = global.io as Server;
    if (!io) {
      console.warn(
        "Socket.IO server not initialized. Real-time events will not be sent."
      );
    }
    await dbConnect();
    const user = getUserFromRequest(req);

    if (!user || user.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Missing status to update" },
        { status: 400 }
      );
    }

    // Populate the product and its 'farmer' field
    const order = await Order.findById(orderId)
      .populate({
        path: "items.product",
        select: "name farmer", // <-- FIX: Select 'farmer' instead of 'owner'
      })
      .populate("customer", "_id name");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization check using the correct field name
    const isFarmerInvolved = order.items.some(
      (item: PopulatedOrderItem) =>
        item.product?.farmer?.toString() === user.userId // <-- FIX: Check 'farmer' instead of 'owner'
    );

    if (!isFarmerInvolved) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You are not the farmer for unknown product in this order.",
        },
        { status: 403 }
      );
    }

    // If authorization passes, update the order
    order.status = status;
    await order.save();

    // Return the updated order with full details
    const updatedOrder = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("items.product", "name price images");

    await Notification.create({
      user: order.customer._id, // The notification is FOR the customer
      message: `Update: Your order #${order._id
        .toString()
        .slice(-6)} has been marked as '${status}'.`,
      link: `/${order._id}`, // Link them directly to the order page
    });

    if (io) {
      const customerId = order.customer._id.toString();
      const eventPayload = {
        orderId: order.id.toString(),
        status: order.status,
        message: `Your order is now ${order.status}!`,
      };

      io.to(customerId).emit("order_status_update", eventPayload);
      console.log(`Emitted 'order_status_update' to room: ${customerId}`);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: unknown) {
    console.error(`[API PUT /api/orders/${params.orderId}] Error:`, error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 }
    );
  }
}
