import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewDocument {
  name: string;
  comment: string;
  rating: number;
  ipAddress?: string;
  createdAt: Date;
}

export type ProductType = 'abaya' | 'hijab' | 'cap' | 'frock' | 'set' | 'other';
export type Occasion = 'daily' | 'wedding' | 'eid' | 'prayer' | 'school' | 'gift' | 'travel';
export type SuitableFor = 'women' | 'kids';

export interface IProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  videoUrl?: string;
  category: 'Child' | 'Women' | 'Islamic';
  productType?: ProductType;
  occasions: Occasion[];
  tags: string[];
  suitableFor: SuitableFor[];
  ageGroup: string[];
  matchingItems: mongoose.Types.ObjectId[];
  stock: number;
  reviews: IReviewDocument[];
  averageRating: number;
  numReviews: number;
  isFeatured: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  calculateAverageRating(): void;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    name: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    ipAddress: {
      type: String,
      select: false, // Hide IP from API responses by default
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['Child', 'Women', 'Islamic'],
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    reviews: [ReviewSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    productType: {
      type: String,
      enum: ['abaya', 'hijab', 'cap', 'frock', 'set', 'other'],
      index: true,
    },
    occasions: {
      type: [String],
      enum: ['daily', 'wedding', 'eid', 'prayer', 'school', 'gift', 'travel'],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    suitableFor: {
      type: [String],
      enum: ['women', 'kids'],
      default: [],
      index: true,
    },
    ageGroup: {
      type: [String],
      default: [],
    },
    matchingItems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: [],
      },
    ],
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text' });

// Auto-generate slug & calculate rating before save
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);
  }

  if (this.isModified('reviews')) {
    this.calculateAverageRating();
  }

  next();
});

ProductSchema.methods.calculateAverageRating = function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
    return;
  }
  const total = this.reviews.reduce(
    (acc: number, review: IReviewDocument) => acc + review.rating,
    0
  );
  this.averageRating = parseFloat((total / this.reviews.length).toFixed(1));
  this.numReviews = this.reviews.length;
};

const Product: Model<IProductDocument> =
  (mongoose.models.Product as Model<IProductDocument>) ||
  mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
