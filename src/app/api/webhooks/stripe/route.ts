import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Pusher from "pusher";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
// Initialize services
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") as string;
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    // --- HANDLE THE CORRECT EVENT FOR PAYMENT INTENTS ---
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // The orderId MUST be in the metadata. This was set when you created the
      // payment intent in your POST /api/orders route.
      const orderId = paymentIntent.metadata.orderId;

      if (!orderId) {
        console.error(
          "Webhook Error: Missing orderId in payment_intent.succeeded metadata."
        );
        return NextResponse.json(
          { error: "Webhook Error: Missing orderId" },
          { status: 400 }
        );
      }

      console.log(
        `[Webhook] Received successful payment for Order ID: ${orderId}`
      );
      await dbConnect();

      // Find the order and populate the product's farmer field
      const order = await Order.findById(orderId).populate({
        path: "items.product",
        select: "name farmer quantity", // Select farmer for notification, quantity for stock check
      });

      if (!order) {
        console.error(`[Webhook] Error: Order with ID ${orderId} not found.`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Idempotency Check: Only process if the order isn't already marked as paid.
      if (order.paymentStatus !== "paid") {
        console.log(`[Webhook] Updating order ${orderId} to 'paid'.`);
        order.paymentStatus = "paid";

        const farmerIdsToNotify = new Set<string>();

        // Decrement stock for each item
        for (const item of order.items) {
          const product = item.product;
          await Product.findByIdAndUpdate(product._id, {
            $inc: { quantity: -item.quantity },
          });

          // Add the farmer's ID to the set for notification
          const farmerId = product.farmer?.toString();
          if (farmerId) {
            farmerIdsToNotify.add(farmerId);
          }
        }

        await order.save();
        console.log(`[Webhook] Order ${orderId} successfully saved.`);

        // Trigger Pusher notification to each unique farmer involved in the order
        for (const farmerId of farmerIdsToNotify) {
          const channel = `private-farmer-${farmerId}`;
          const eventName = "new-order";
          const payload = {
            message: `You have a new sale! Order #${orderId.slice(-6)}`,
            orderId: orderId,
          };
          console.log(
            `[Webhook] 🚀 Triggering '${eventName}' to channel: ${channel}`
          );
          await pusher.trigger(channel, eventName, payload);
        }
      } else {
        console.log(
          `[Webhook] Order ${orderId} was already marked as paid. Skipping.`
        );
      }
    } else {
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Webhook handler error:", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }
}
