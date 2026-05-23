const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Seed data
const seedProducts = [
  {
    name: 'Sona Masuri Rice',
    description: 'Light, aromatic medium-grain rice from Andhra Pradesh. Perfect for everyday meals, biryanis, and fried rice. Low in starch with a soft texture after cooking.',
    pricePerKg: 68,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80',
    stock: 500,
    rating: 4.5,
    ratingCount: 2340,
    tag: 'Best Seller',
    type: 'Standard'
  },
  {
    name: 'Basmati Rice',
    description: 'Long-grain, extra-aged Basmati from the Himalayan foothills. Exceptional fragrance, fluffy texture, and authentic taste. Perfect for biryanis and pulaos.',
    pricePerKg: 120,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    stock: 300,
    rating: 4.8,
    ratingCount: 1890,
    tag: 'Premium',
    type: 'Premium'
  },
  {
    name: 'Brown Rice',
    description: 'Whole grain brown rice packed with fiber, vitamins and minerals. Nutty flavor with a chewy texture. Ideal for health-conscious families seeking nutritious alternatives.',
    pricePerKg: 95,
    image: 'https://images.unsplash.com/photo-1603048719539-9ecb5f0c1c8e?w=600&q=80',
    stock: 200,
    rating: 4.3,
    ratingCount: 876,
    tag: 'Organic',
    type: 'Organic'
  },
  {
    name: 'Idli Rice',
    description: 'Short-grain parboiled rice specially selected for making soft, fluffy idlis and crispy dosas. High in carbohydrates and easy to digest. A South Indian kitchen essential.',
    pricePerKg: 55,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&q=80',
    stock: 400,
    rating: 4.4,
    ratingCount: 1120,
    tag: 'Best Seller',
    type: 'Standard'
  },
  {
    name: 'Ponni Raw Rice',
    description: 'Traditional Tamil Nadu raw rice with distinct flavor and aroma. Cooks to a soft, slightly sticky consistency. Perfect for sambar rice, curd rice, and traditional South Indian meals.',
    pricePerKg: 62,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80',
    stock: 350,
    rating: 4.6,
    ratingCount: 1450,
    tag: 'Best Seller',
    type: 'Standard'
  },
  {
    name: 'Organic Red Rice',
    description: 'Naturally grown red rice with high antioxidant content. Rich in fiber, iron and zinc. Unique earthy taste and beautiful red hue. 100% certified organic, no pesticides.',
    pricePerKg: 145,
    image: 'https://images.unsplash.com/photo-1603048719539-9ecb5f0c1c8e?w=600&q=80',
    stock: 150,
    rating: 4.7,
    ratingCount: 523,
    tag: 'Organic',
    type: 'Organic'
  }
];

// GET /api/products - Get all products with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, type, minPrice, maxPrice, sort } = req.query;
    let query = { available: true };

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerKg = {};
      if (minPrice) query.pricePerKg.$gte = Number(minPrice);
      if (maxPrice) query.pricePerKg.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOption = {};
    if (sort === 'price_asc') sortOption.pricePerKg = 1;
    else if (sort === 'price_desc') sortOption.pricePerKg = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else sortOption.createdAt = -1;

    const products = await Product.find(query).sort(sortOption);
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
});

// GET /api/products/seed - Seed database with sample products
router.get('/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(seedProducts);
    res.json({ success: true, message: `✅ Seeded ${created.length} products successfully`, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Seeding failed', error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
});

module.exports = router;