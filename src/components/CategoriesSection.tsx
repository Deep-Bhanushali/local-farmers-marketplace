"use client";

import CategoryCard from "./CategoryCard";

// Define the data for all six categories
const categories = [
  {
    name: "Fruits",
    description: "The freshest, sweetest picks from local orchards.",
    imageUrl: "/categories/fruits.jpg",
    href: "/products?category=fruits",
  },
  {
    name: "Vegetables",
    description: "Crisp, vibrant, and packed with nutrients.",
    imageUrl: "/categories/vegetables.jpg",
    href: "/products?category=vegetables",
  },
  {
    name: "Dairy",
    description: "Farm-fresh milk, cheese, and yogurts.",
    imageUrl: "/categories/dairy.jpg",
    href: "/products?category=dairy",
  },
  {
    name: "Meat",
    description: "Ethically raised, high-quality local meats.",
    imageUrl: "/categories/meat.jpg",
    href: "/products?category=meat",
  },
  {
    name: "Grains",
    description: "Wholesome breads, oats, and grains.",
    imageUrl: "/categories/grains.jpg",
    href: "/products?category=grains",
  },
  {
    name: "Herbs & Spices",
    description: "Aromatic herbs to elevate your cooking.",
    imageUrl: "/categories/herbs.jpg",
    href: "/products?category=herbs",
  },
];

const CategoriesSection = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="mt-2 text-lg text-gray-600">
            Find exactly what your looking for.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              description={category.description}
              imageUrl={category.imageUrl}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
