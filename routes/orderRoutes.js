const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const orderEmailTemplate = require("../utils/orderEmailTemplate");

router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      notes
    } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone and address are required"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required"
      });
    }

    if (!total || Number(total) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total"
      });
    }

    const order = new Order({
      customer,
      items,
      subtotal: Number(subtotal) || Number(total),
      deliveryFee: Number(deliveryFee) || 0,
      total: Number(total),
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "PENDING",
      status: "PLACED",
      notes: notes || ""
    });

    const savedOrder = await order.save();

    try {
      const html = orderEmailTemplate(savedOrder);

      if (savedOrder.customer.email) {
        await sendEmail({
          to: savedOrder.customer.email,
          subject: `Order Placed - ${savedOrder.orderId || savedOrder._id}`,
          html
        });
      }

      if (process.env.SHOP_EMAIL) {
        await sendEmail({
          to: process.env.SHOP_EMAIL,
          subject: `New Order - ${savedOrder.orderId || savedOrder._id}`,
          html
        });
      }
    } catch (emailError) {
      console.log("Email failed, but order saved:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: savedOrder
    });

  } catch (error) {
    console.error("Order create error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});

module.exports = router;