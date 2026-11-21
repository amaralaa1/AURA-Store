const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Create order
router.post("/", authMiddleware, async (req, res) => {
  let session;

  try {
    const { products, shippingAddress } = req.body;

    if (
      !Array.isArray(products) ||
      products.length === 0 ||
      typeof shippingAddress !== "string" ||
      !shippingAddress.trim()
    ) {
      return res.status(400).json({
        message: "Please provide valid products and shipping address",
      });
    }

    session = await mongoose.startSession();

    let order;

    await session.withTransaction(async () => {
      let totalPrice = 0;
      const orderProducts = [];

      for (const item of products) {
        if (!item || typeof item !== "object") {
          throw new Error("Invalid product data");
        }

        if (!mongoose.Types.ObjectId.isValid(item.product)) {
          throw new Error("Invalid product ID");
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error("Invalid product quantity");
        }

        const product = await Product.findById(item.product).session(session);

        if (!product) {
          throw new Error("Product not found");
        }

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedProduct) {
          throw new Error(`Not enough stock for ${product.name}`);
        }

        orderProducts.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        });

        totalPrice += product.price * item.quantity;
      }

      order = new Order({
        user: req.user.id,
        products: orderProducts,
        totalPrice,
        shippingAddress: shippingAddress.trim(),
      });

      await order.save({ session });
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.log(error);

    const clientErrors = [
      "Invalid product data",
      "Invalid product ID",
      "Invalid product quantity",
      "Product not found",
    ];

    if (
      clientErrors.includes(error.message) ||
      error.message.startsWith("Not enough stock")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create order",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// Get user orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "products.product"
    );

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});


// Cancel user order
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();

    let order;

    await session.withTransaction(async () => {
      order = await Order.findOne({
        _id: req.params.id,
        user: req.user.id,
      }).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (!["Pending", "Processing"].includes(order.status)) {
        const error = new Error("This order cannot be cancelled");
        error.statusCode = 400;
        throw error;
      }

      for (const item of order.products) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: { stock: item.quantity },
          },
          { session }
        );
      }

      order.status = "Cancelled";
      await order.save({ session });
    });

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.log(error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Failed to cancel order",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// Get single order
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("products.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
});

// Get all orders (Admin)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product");

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch all orders",
    });
  }
});

// Update order status (Admin)

router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  let session;

  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    session = await mongoose.startSession();

    let order;

    await session.withTransaction(async () => {
      order = await Order.findById(req.params.id).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (order.status === "Cancelled" && status !== "Cancelled") {
        const error = new Error("Cancelled orders cannot be updated");
        error.statusCode = 400;
        throw error;
      }

      if (order.status !== "Cancelled" && status === "Cancelled") {
        for (const item of order.products) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: { stock: item.quantity },
            },
            { session }
          );
        }
      }

      order.status = status;
      await order.save({ session });
    });

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.log(error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update order status",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

module.exports = router;
