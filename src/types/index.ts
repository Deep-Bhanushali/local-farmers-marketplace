export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "farmer";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "fruits" | "vegetables" | "dairy" | "meat" | "grains" | "herbs";
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
  farmer: User;
  images: string[];
  isAvailable: boolean;
  organic: boolean;
  rating: number;
  reviews: Review[];
  createdAt: string;
  harvestDate: string;
  updatedAt: string;
  expiryDate?: string;
}

export interface Review {
  _id: string;
  user: User;
  rating: number;
  comment: string;
  date: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customer: User;
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "stripe" | "cash";
  stripePaymentIntentId?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "farmer";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
}

export interface Filters {
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  organic: boolean;
}
