const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const orderEmailTemplate = require("../utils/orderEmailTemplate");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required"
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `FRS_${Date.now()}`
    });

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Razorpay order creation failed",
      error: error.message
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderPayload) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    const savedOrder = await Order.create({
      ...orderPayload,
      paymentMethod: "RAZORPAY",
      paymentStatus: "PAID",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "PLACED"
    });

    const html = orderEmailTemplate(savedOrder);

    if (savedOrder.customer.email) {
      await sendEmail({
        to: savedOrder.customer.email,
        subject: `Order Confirmed - ${savedOrder.orderId}`,
        html
      });
    }

    if (process.env.SHOP_EMAIL) {
      await sendEmail({
        to: process.env.SHOP_EMAIL,
        subject: `New Paid Order - ${savedOrder.orderId}`,
        html
      });
    }

    res.json({
      success: true,
      message: "Payment verified, order saved, email sent",
      data: savedOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
});

module.exports = router;