"use client";

import { Product } from "@/types";

import { useState, useEffect, useCallback } from "react"; // FIX: Imported useCallback
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  MapPin,
  Calendar,
  Leaf,
  Plus,
  Minus,
  Edit,
  Trash2,
  ArrowLeft,
  Heart,
  Share2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // FIX: Wrapped fetchProduct in useCallback. This memoizes the function so it doesn't
  // get recreated on every render, allowing it to be safely used in useEffect's dependency array.
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setProduct(data.product);
      } else {
        toast.error("Product not found");
        router.push("/products");
      }
    } catch (error) {
      // FIX: Used the 'error' variable for better debugging.
      console.error("Failed to fetch product:", error);
      toast.error("An error occurred while fetching the product.");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  // FIX: Added 'fetchProduct' to the dependency array, as required by the linter.
  // This is now safe because fetchProduct is wrapped in useCallback.
  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id, fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    // FIX: Changed the function call to pass two separate arguments (product, quantity)
    // as expected by the useCart hook, instead of a single object.
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  const handleEditProduct = () => {
    router.push(`/products/edit/${product?._id}`);
  };

  const handleDeleteProduct = async () => {
    if (!product || !confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
        router.push("/products");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      // FIX: Used the 'error' variable for better debugging.
      console.error("Failed to delete product:", error);
      toast.error("An error occurred while deleting the product.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product not found
            </h2>
            <button
              onClick={() => router.push("/products")}
              className="px-4 py-2 bg-primary-600 text-white rounded-md" // Simple styling for the button
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ... JSX remains the same ...
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 bg-white rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
              {/* Organic Badge */}
              {product.organic && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Leaf className="h-4 w-4 mr-1" />
                  Organic
                </div>
              )}
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating.toFixed(1)} ({product.reviews.length}{" "}
                    reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {product.category}
                </span>
              </div>
            </div>
            {/* Price */}
            <div className="text-3xl font-bold text-gray-900">
              ${product.price.toFixed(2)} per {product.unit}
            </div>
            {/* Availability */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Availability:</span>
                <span
                  className={`text-sm font-medium ${
                    product.isAvailable && product.quantity > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {product.isAvailable && product.quantity > 0
                    ? `${product.quantity} ${product.unit} available`
                    : "Out of stock"}
                </span>
              </div>
            </div>
            {/* Quantity Selector */}
            {product.isAvailable && product.quantity > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.quantity, quantity + 1))
                    }
                    className="p-2 hover:bg-gray-50"
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Max: {product.quantity} {product.unit}
                </span>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex space-x-4">
              {user?.role === "farmer" && product.farmer?._id === user?._id ? (
                <>
                  <button
                    onClick={handleEditProduct}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 font-medium rounded-md hover:bg-primary-50"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Product
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-red-600 text-red-600 font-medium rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.isAvailable || product.quantity === 0}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add to Cart
                  </button>
                </>
              )}
            </div>
            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>
                  Farm Location: {product.farmLocation.city},{" "}
                  {product.farmLocation.state}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Harvested: {formatDate(product.harvestDate)}</span>
              </div>
              {product.expiryDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Expires: {formatDate(product.expiryDate)}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <span>Farmer: {product.farmer?.name ?? "Unknown"}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Description */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <div className="bg-white rounded-lg p-6">
            <p
              className={`text-gray-700 leading-relaxed ${
                showFullDescription ? "" : "line-clamp-3"
              }`}
            >
              {product.description}
            </p>
            {product.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>
        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Reviews ({product.reviews.length})
            </h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {review.user.name}
                      </span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.date)}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
