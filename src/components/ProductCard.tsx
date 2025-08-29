'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, MapPin, Leaf, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setLoading(true);
    try {
      await addToCart(product, 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        {/* Organic Badge */}
        {product.organic && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Leaf className="h-3 w-3" />
            Organic
          </div>
        )}

        {/* Rating Badge */}
        {product.rating > 0 && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            {product.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {product.farmLocation.city}, {product.farmLocation.state}
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm ml-1">/{product.unit}</span>
          </div>
          <div className="text-sm text-gray-500">
            {product.quantity > 0 ? (
              <span className="text-green-600">{product.quantity} available</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={loading || product.quantity === 0}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            product.quantity === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : loading
              ? 'bg-primary-400 text-white cursor-wait'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {loading ? 'Adding...' : product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
