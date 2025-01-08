import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product";

dotenv.config();

const app = express();
app.use(express.json());

// Get Products by Category
app.get("/products", async (req: Request, res: Response) => {
	const category = req.query.category as string | undefined; // Optional category filter
	const page = parseInt(req.query.page as string) || 1; // Default to page 1
	const limit = parseInt(req.query.limit as string) || 10; // Default to 10 products per page

	try {
		const query: { category?: string } = {};
		if (category) {
			query.category = category;
		}

		const totalProducts = await Product.countDocuments(query); // Total matching products
		const products = await Product.find(query)
			.skip((page - 1) * limit) // Skip products for pagination
			.limit(limit); // Limit products per page

		res.status(200).json({
			totalProducts,
			currentPage: page,
			totalPages: Math.ceil(totalProducts / limit),
			products,
		});
	} catch (error) {
		res.status(500).json({ message: "Error fetching products", error });
	}
});

// Cart Schema
const cartSchema = new mongoose.Schema({
	userId: String,
	productId: String,
	quantity: Number,
});

const Cart = mongoose.model("Cart", cartSchema);

// Add to Cart
app.post("/cart", async (req: Request, res: Response) => {
	const { userId, productId, quantity } = req.body;
	try {
		const cartItem = new Cart({ userId, productId, quantity });
		await cartItem.save();
		res.status(201).json({ message: "Product added to cart", cartItem });
	} catch (error) {
		res.status(500).json({
			message: "Error adding product to cart",
			error,
		});
	}
});

// Order Schema
const orderSchema = new mongoose.Schema({
	userId: String,
	items: [
		{
			productId: String,
			quantity: Number,
		},
	],
	total: Number,
	createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// Place an Order
app.post("/orders", async (req: Request, res: Response) => {
	const { userId, items, total } = req.body;
	try {
		const order = new Order({ userId, items, total });
		await order.save();
		res.status(201).json({ message: "Order placed successfully", order });
	} catch (error) {
		res.status(500).json({ message: "Error placing order", error });
	}
});

const startServer = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI || "");
		console.log("Connected to MongoDB");
		app.listen(process.env.PORT || 3000, () => {
			console.log(
				`Server is running on port ${process.env.PORT || 3000}`
			);
		});
	} catch (error) {
		console.error("Failed to connect to MongoDB", error);
	}
};

startServer();
