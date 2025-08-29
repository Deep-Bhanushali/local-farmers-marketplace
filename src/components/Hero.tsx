"use client";

import Image from "next/image";

const FarmerHeroSection = () => {
  return (
    <div className="relative w-full h-[75vh] text-white">
      {/* Background Image */}
      <Image
        src="/images/hero1.webp"
        alt="A group of happy local farmers in a field holding fresh produce"
        fill
        className="object-cover object-center z-0 blur-sm"
        priority
      />
      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center">
        <div className="max-w-4xl flex flex-col justify-center items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg mb-4">
            Connect with Local Farmers
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 drop-shadow-md">
            Fresh, Organic Produce, Delivered From Our Farms to Your Doorstep.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerHeroSection;
