const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const User = require('../src/models/User.ts');
const Product = require('../src/models/Product.ts');

// Sample farmers data
const farmers = [
  {
    name: 'John Smith',
    email: 'john.smith@farm.com',
    password: 'password123',
    role: 'farmer',
    phone: '+1-555-0101',
    farmName: 'Smith Family Farm',
    farmLocation: {
      city: 'Springfield',
      state: 'IL',
      coordinates: { lat: 39.7817, lng: -89.6501 }
    }
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@farm.com',
    password: 'password123',
    role: 'farmer',
    phone: '+1-555-0102',
    farmName: 'Garcia Organic Farm',
    farmLocation: {
      city: 'Madison',
      state: 'WI',
      coordinates: { lat: 43.0731, lng: -89.4012 }
    }
  },
  {
    name: 'David Johnson',
    email: 'david.johnson@farm.com',
    password: 'password123',
    role: 'farmer',
    phone: '+1-555-0103',
    farmName: 'Johnson Valley Farm',
    farmLocation: {
      city: 'Austin',
      state: 'TX',
      coordinates: { lat: 30.2672, lng: -97.7431 }
    }
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@farm.com',
    password: 'password123',
    role: 'farmer',
    phone: '+1-555-0104',
    farmName: 'Wilson Green Acres',
    farmLocation: {
      city: 'Portland',
      state: 'OR',
      coordinates: { lat: 45.5152, lng: -122.6784 }
    }
  }
];

// Sample products data
const products = [
  // John Smith's products
  {
    name: 'Fresh Organic Tomatoes',
    description: 'Sweet, juicy organic tomatoes grown without pesticides. Perfect for salads, sandwiches, or homemade sauces.',
    price: 3.99,
    category: 'vegetables',
    quantity: 50,
    unit: 'lb',
    farmLocation: {
      city: 'Springfield',
      state: 'IL',
      coordinates: { lat: 39.7817, lng: -89.6501 }
    },
    images: [
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    organic: true,
    rating: 4.8,
    reviews: []
  },
  {
    name: 'Sweet Corn',
    description: 'Fresh picked sweet corn, perfect for grilling or boiling. Sweet and tender kernels.',
    price: 2.49,
    category: 'vegetables',
    quantity: 100,
    unit: 'ear',
    farmLocation: {
      city: 'Springfield',
      state: 'IL',
      coordinates: { lat: 39.7817, lng: -89.6501 }
    },
    images: [
      'https://images.unsplash.com/photo-1601593768797-9e5c5c0e8c0f?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    organic: false,
    rating: 4.5,
    reviews: []
  },

  // Maria Garcia's products
  {
    name: 'Organic Strawberries',
    description: 'Sweet, red organic strawberries. Perfect for desserts, smoothies, or fresh eating.',
    price: 5.99,
    category: 'fruits',
    quantity: 30,
    unit: 'pint',
    farmLocation: {
      city: 'Madison',
      state: 'WI',
      coordinates: { lat: 43.0731, lng: -89.4012 }
    },
    images: [
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
      'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    organic: true,
    rating: 4.9,
    reviews: []
  },
  {
    name: 'Fresh Basil',
    description: 'Aromatic fresh basil leaves. Great for pesto, salads, or Italian dishes.',
    price: 2.99,
    category: 'herbs',
    quantity: 25,
    unit: 'bunch',
    farmLocation: {
      city: 'Madison',
      state: 'WI',
      coordinates: { lat: 43.0731, lng: -89.4012 }
    },
    images: [
      'https://images.unsplash.com/photo-1618377382884-c6c2c2b3b3b3?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    organic: true,
    rating: 4.7,
    reviews: []
  },

  // David Johnson's products
  {
    name: 'Bell Peppers',
    description: 'Colorful bell peppers - red, yellow, and green. Sweet and crunchy, perfect for salads or cooking.',
    price: 4.49,
    category: 'vegetables',
    quantity: 40,
    unit: 'lb',
    farmLocation: {
      city: 'Austin',
      state: 'TX',
      coordinates: { lat: 30.2672, lng: -97.7431 }
    },
    images: [
      'https://images.unsplash.com/photo-1525607551316-5a9eeaab95ba?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    organic: false,
    rating: 4.6,
    reviews: []
  },
  {
    name: 'Fresh Eggs',
    description: 'Farm fresh eggs from free-range chickens. Rich in flavor and nutrients.',
    price: 6.99,
    category: 'dairy',
    quantity: 60,
    unit: 'dozen',
    farmLocation: {
      city: 'Austin',
      state: 'TX',
      coordinates: { lat: 30.2672, lng: -97.7431 }
    },
    images: [
      'https://images.unsplash.com/photo-1569288063648-5bb9b5c8b5b5?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    organic: false,
    rating: 4.8,
    reviews: []
  },

  // Sarah Wilson's products
  {
    name: 'Organic Apples',
    description: 'Crisp, sweet organic apples. Multiple varieties available including Gala, Fuji, and Honeycrisp.',
    price: 4.99,
    category: 'fruits',
    quantity: 80,
    unit: 'lb',
    farmLocation: {
      city: 'Portland',
      state: 'OR',
      coordinates: { lat: 45.5152, lng: -122.6784 }
    },
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    organic: true,
    rating: 4.9,
    reviews: []
  },
  {
    name: 'Fresh Spinach',
    description: 'Tender, fresh spinach leaves. Perfect for salads, smoothies, or cooking.',
    price: 3.49,
    category: 'vegetables',
    quantity: 35,
    unit: 'lb',
    farmLocation: {
      city: 'Portland',
      state: 'OR',
      coordinates: { lat: 45.5152, lng: -122.6784 }
    },
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    organic: true,
    rating: 4.7,
    reviews: []
  },
  {
    name: 'Carrots',
    description: 'Sweet, crunchy carrots. Great for snacking, juicing, or cooking.',
    price: 2.99,
    category: 'vegetables',
    quantity: 45,
    unit: 'lb',
    farmLocation: {
      city: 'Portland',
      state: 'OR',
      coordinates: { lat: 45.5152, lng: -122.6784 }
    },
    images: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    organic: true,
    rating: 4.6,
    reviews: []
  },
  {
    name: 'Fresh Mint',
    description: 'Aromatic fresh mint leaves. Perfect for tea, cocktails, or garnishing.',
    price: 1.99,
    category: 'herbs',
    quantity: 20,
    unit: 'bunch',
    farmLocation: {
      city: 'Portland',
      state: 'OR',
      coordinates: { lat: 45.5152, lng: -122.6784 }
    },
    images: [
      'https://images.unsplash.com/photo-1628557044824-ece57c8b5b5b?w=400'
    ],
    isAvailable: true,
    harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    organic: true,
    rating: 4.5,
    reviews: []
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ role: 'farmer' });
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create farmers
    const createdFarmers = [];
    for (const farmerData of farmers) {
      const farmer = new User(farmerData);
      await farmer.save();
      createdFarmers.push(farmer);
      console.log(`Created farmer: ${farmer.name}`);
    }

    // Create products and associate with farmers
    const farmerIds = createdFarmers.map(farmer => farmer._id);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmerIndex = Math.floor(i / 2); // Distribute products among farmers
      const farmer = createdFarmers[farmerIndex];
      
      const newProduct = new Product({
        ...product,
        farmer: farmer._id
      });
      
      await newProduct.save();
      console.log(`Created product: ${product.name} for ${farmer.name}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`Created ${createdFarmers.length} farmers`);
    console.log(`Created ${products.length} products`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log('Farmers:');
    createdFarmers.forEach(farmer => {
      console.log(`  - ${farmer.name} (${farmer.farmName})`);
    });

    console.log('\nProducts by category:');
    const categories = {};
    products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} products`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
