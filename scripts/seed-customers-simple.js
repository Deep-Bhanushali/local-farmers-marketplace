const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'farmer', 'admin'], default: 'customer' },
  phone: String,
  farmName: String,
  farmLocation: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Sample customers data
const customers = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1-555-0201',
    address: {
      street: '123 Main St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    }
  },
  {
    name: 'Bob Wilson',
    email: 'bob.wilson@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1-555-0202',
    address: {
      street: '456 Oak Ave',
      city: 'Milwaukee',
      state: 'WI',
      zipCode: '53202'
    }
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1-555-0203',
    address: {
      street: '789 Pine Rd',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001'
    }
  },
  {
    name: 'David Brown',
    email: 'david.brown@email.com',
    password: 'password123',
    role: 'customer',
    phone: '+1-555-0204',
    address: {
      street: '321 Elm St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101'
    }
  }
];

async function seedCustomers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing customers
    await User.deleteMany({ role: 'customer' });
    console.log('Cleared existing customers');

    // Create customers
    const createdCustomers = [];
    for (const customerData of customers) {
      const customer = new User(customerData);
      await customer.save();
      createdCustomers.push(customer);
      console.log(`Created customer: ${customer.name}`);
    }

    console.log('\n✅ Customers seeded successfully!');
    console.log(`Created ${createdCustomers.length} customers`);

    // Display summary
    console.log('\n📊 Customer Summary:');
    createdCustomers.forEach(customer => {
      console.log(`  - ${customer.name} (${customer.email})`);
    });

  } catch (error) {
    console.error('Error seeding customers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedCustomers();
