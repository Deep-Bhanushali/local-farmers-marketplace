"use client";

import CategoriesSection from "@/components/CategoriesSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FarmerHeroSection from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FarmerHeroSection />
        <div className="flex justify-center items-center gap-8">
          <CategoriesSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
