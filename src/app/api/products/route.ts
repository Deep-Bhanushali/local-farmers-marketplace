import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

interface ProductFilter {
  isAvailable: boolean;
  category?: string;
  "farmLocation.city"?: { $regex: string; $options: string };
  price?: {
    $gte?: number;
    $lte?: number;
  };
  organic?: boolean;
}

// GET /api/products - Get all products with filters
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const organic = searchParams.get("organic");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: ProductFilter = {
      isAvailable: true,
    };

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter["farmLocation.city"] = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (organic === "true") {
      filter.organic = true;
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .populate("farmer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (farmers only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "farmer") {
      return NextResponse.json(
        { error: "Only farmers can create products" },
        { status: 403 }
      );
    }

    const productData = await req.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "price",
      "category",
      "quantity",
      "unit",
      "farmLocation",
      "harvestDate",
    ];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new product
    const product = new Product({
      ...productData,
      farmer: user.userId,
    });

    await product.save();

    // Populate farmer info
    await product.populate("farmer", "name email");

    return NextResponse.json({
      product,
      message: "Product created successfully",
    });
  } catch (error: unknown) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
