import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: 'fruits' | 'vegetables' | 'dairy' | 'meat' | 'grains' | 'herbs';
  quantity: number;
  unit: string;
  farmLocation: {
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  farmer: mongoose.Types.ObjectId;
  images: string[];
  isAvailable: boolean;
  harvestDate: Date;
  expiryDate?: Date;
  organic: boolean;
  rating: number;
  reviews: Array<{
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'herbs'],
    required: [true, 'Please provide a category'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0,
  },
  unit: {
    type: String,
    required: [true, 'Please provide a unit'],
    enum: ['kg', 'lb', 'piece', 'bunch', 'dozen', 'liter', 'gallon'],
  },
  farmLocation: {
    city: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a farmer'],
  },
  images: [{
    type: String,
    required: [true, 'Please provide at least one image'],
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  harvestDate: {
    type: Date,
    required: [true, 'Please provide harvest date'],
  },
  expiryDate: {
    type: Date,
  },
  organic: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Calculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
  }
  next();
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
