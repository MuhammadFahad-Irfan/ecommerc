/**
 * Database seeding script.
 * Run with: npm run seed
 *
 * Populates the database with sample products for development.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product';

const MONGODB_URI = process.env.MONGODB_URI ;

const placeholder = (seed: string, n = 1) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/800/800`);

const sampleProducts = [
  {
    name: 'Elegant Black Abaya with Embroidery',
    description:
      'A stunning black abaya featuring intricate embroidery work along the sleeves and front. Made from premium nidha fabric, this abaya offers a perfect blend of modesty and elegance. Suitable for everyday wear, special occasions, and prayer.',
    price: 4500,
    category: 'Islamic',
    stock: 25,
    isFeatured: true,
    images: placeholder('abaya', 2),
  },
  {
    name: 'Premium Burkha with Hijab Set',
    description:
      'Complete burkha set including matching hijab. Light and breathable fabric perfect for daily wear. Features convenient front zipper and adjustable cuffs. Available in classic black with subtle stitching details.',
    price: 3800,
    category: 'Islamic',
    stock: 40,
    isFeatured: true,
    images: placeholder('burkha'),
  },
  {
    name: "Women's Embroidered Lawn Suit",
    description:
      "Beautiful 3-piece lawn suit with intricate embroidery. Includes shirt, trouser, and dupatta. Perfect for summer wear. Soft and comfortable fabric that's gentle on skin.",
    price: 3200,
    category: 'Women',
    stock: 30,
    isFeatured: true,
    images: placeholder('lawn-suit'),
  },
  {
    name: 'Designer Chiffon Party Wear',
    description:
      'Stunning chiffon dress perfect for weddings and formal events. Features delicate hand-work and elegant draping. Comes with matching dupatta and inner lining.',
    price: 8500,
    category: 'Women',
    stock: 15,
    isFeatured: true,
    images: placeholder('chiffon-party'),
  },
  {
    name: 'Casual Cotton Kurti',
    description:
      'Comfortable everyday cotton kurti with side slits. Perfect for office, college, or casual outings. Easy to maintain and machine washable.',
    price: 1800,
    category: 'Women',
    stock: 50,
    isFeatured: false,
    images: placeholder('cotton-kurti'),
  },
  {
    name: "Girls' Princess Frock",
    description:
      'Adorable princess-style frock for little girls. Features tulle skirt, satin bodice, and bow detail. Perfect for birthdays, parties, and special occasions. Available for ages 2-8 years.',
    price: 2500,
    category: 'Child',
    stock: 35,
    isFeatured: true,
    images: placeholder('princess-frock'),
  },
  {
    name: "Boys' Casual Outfit Set",
    description:
      "Stylish 2-piece outfit for boys including t-shirt and jeans. Comfortable cotton fabric. Perfect for school, playtime, and casual outings. Available in multiple sizes.",
    price: 1600,
    category: 'Child',
    stock: 45,
    isFeatured: false,
    images: placeholder('boys-outfit'),
  },
  {
    name: 'Kids Eid Special Dress',
    description:
      'Beautiful traditional dress for Eid celebrations. Features hand-embroidered details, comfortable fit, and matching accessories. Suitable for ages 3-10 years.',
    price: 3500,
    category: 'Child',
    stock: 20,
    isFeatured: true,
    images: placeholder('kids-eid'),
  },
  {
    name: 'Modest Maxi Dress',
    description:
      'Elegant full-length maxi dress with long sleeves. Perfect for modest fashion enthusiasts. Made from soft, flowing fabric that drapes beautifully.',
    price: 4200,
    category: 'Women',
    stock: 28,
    isFeatured: false,
    images: placeholder('maxi-dress'),
  },
  {
    name: 'Hijab Collection - Set of 5',
    description:
      'Premium quality hijab collection in 5 versatile colors. Made from breathable fabric. Includes matching pins. Perfect for daily wear and gifting.',
    price: 2800,
    category: 'Islamic',
    stock: 60,
    isFeatured: false,
    images: placeholder('hijab-set'),
  },
  {
    name: "Children's Modest Eid Suit",
    description:
      'Traditional modest outfit for boys. Includes shalwar kameez with intricate detailing. Perfect for Eid, weddings, and other formal events.',
    price: 2200,
    category: 'Child',
    stock: 30,
    isFeatured: false,
    images: placeholder('modest-eid-suit'),
  },
  {
    name: 'Premium Wedding Lehenga',
    description:
      'Stunning bridal lehenga with heavy embroidery, sequins, and zardozi work. Includes lehenga, choli, and dupatta. A timeless piece for your special day.',
    price: 25000,
    category: 'Women',
    stock: 8,
    isFeatured: true,
    images: placeholder('wedding-lehenga', 2),
  },
];

const sampleReviews = [
  { name: 'Aisha K.', rating: 5, comment: 'Absolutely loved the quality! Fits perfectly and the fabric is very comfortable.' },
  { name: 'Sara M.', rating: 4, comment: 'Beautiful product, delivered on time. Highly recommend!' },
  { name: 'Fatima R.', rating: 5, comment: 'Excellent stitching and elegant design. Worth every rupee!' },
  { name: 'Hina A.', rating: 4, comment: 'Good quality. Color is exactly as shown in pictures.' },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('✅ Connected');

  console.log('🗑️  Clearing existing products...');
  await Product.deleteMany({});

  console.log('📦 Inserting sample products...');

  for (const productData of sampleProducts) {
    const product = new Product(productData);

    // Add 1-3 random reviews to each product
    const reviewCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < reviewCount; i++) {
      const review = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
      product.reviews.push({
        ...review,
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    await product.save();
    console.log(`  ✓ ${product.name}`);
  }

  console.log(`\n✅ Seeded ${sampleProducts.length} products successfully!`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
