const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// Define schemas directly
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "farmer", "admin"],
    default: "customer",
  },
  phone: String,
  farmName: String,
  farmLocation: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  farmLocation: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String],
  isAvailable: { type: Boolean, default: true },
  harvestDate: { type: Date, required: true },
  expiryDate: Date,
  organic: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: Number,
      comment: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

// Sample data
const farmers = [
  {
    name: "John Smith",
    email: "john.smith@farm.com",
    password: "password123",
    role: "farmer",
    phone: "+1-555-0101",
    farmName: "Smith Family Farm",
    farmLocation: {
      city: "Springfield",
      state: "IL",
      coordinates: { lat: 39.7817, lng: -89.6501 },
    },
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@farm.com",
    password: "password123",
    role: "farmer",
    phone: "+1-555-0102",
    farmName: "Garcia Organic Farm",
    farmLocation: {
      city: "Madison",
      state: "WI",
      coordinates: { lat: 43.0731, lng: -89.4012 },
    },
  },
];

const products = [
  {
    name: "Fresh Organic Tomatoes",
    description: "Sweet, juicy organic tomatoes grown without pesticides.",
    price: 3.99,
    category: "vegetables",
    quantity: 50,
    unit: "lb",
    farmLocation: {
      city: "Springfield",
      state: "IL",
      coordinates: { lat: 39.7817, lng: -89.6501 },
    },
    images: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400"],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    organic: true,
    rating: 4.8,
    reviews: [],
  },
  {
    name: "Organic Strawberries",
    description: "Sweet, red organic strawberries. Perfect for desserts.",
    price: 5.99,
    category: "fruits",
    quantity: 30,
    unit: "pint",
    farmLocation: {
      city: "Madison",
      state: "WI",
      coordinates: { lat: 43.0731, lng: -89.4012 },
    },
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    organic: true,
    rating: 4.9,
    reviews: [],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({ role: "farmer" });
    await Product.deleteMany({});
    console.log("Cleared existing data");

    // Create farmers
    const createdFarmers = [];
    for (const farmerData of farmers) {
      const farmer = new User(farmerData);
      await farmer.save();
      createdFarmers.push(farmer);
      console.log(`Created farmer: ${farmer.name}`);
    }

    // Create products
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmer = createdFarmers[Math.floor(i / 1)];

      const newProduct = new Product({
        ...product,
        farmer: farmer._id,
      });

      await newProduct.save();
      console.log(`Created product: ${product.name} for ${farmer.name}`);
    }

    console.log("\n✅ Database seeded successfully!");
    console.log(`Created ${createdFarmers.length} farmers`);
    console.log(`Created ${products.length} products`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDatabase();
