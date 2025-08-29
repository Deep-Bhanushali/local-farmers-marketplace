"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Define the props that this component will accept
interface CategoryCardProps {
  name: string;
  description: string;
  imageUrl: string;
  href: string;
}

const CategoryCard = ({
  name,
  description,
  imageUrl,
  href,
}: CategoryCardProps) => {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="relative h-64 w-full">
        <Image
          src={imageUrl}
          alt={`Image of ${name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Add a subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-transform duration-300 group-hover:scale-105"></div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        <div className="mt-4 flex items-center font-semibold text-primary-600">
          Shop Now
          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
