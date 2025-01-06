import mongoose from "mongoose";
import dotenv from "dotenv";
import User, { IUser } from "./models/User";
import Product, { IProduct } from "./models/Product";

// Load environment variables
dotenv.config();

// Sample Data
const sampleUsers = [
	{ name: "John Doe", email: "john@example.com", password: "password123" },
	{ name: "Jane Smith", email: "jane@example.com", password: "password123" },
	{
		name: "Alice Johnson",
		email: "alice@example.com",
		password: "password123",
	},
];

const sampleProducts = [
	{ name: "Smartphone", price: 699, category: "electronics", stock: 50 },
	{ name: "Laptop", price: 999, category: "electronics", stock: 30 },
	{ name: "Shoes", price: 79, category: "fashion", stock: 100 },
	{ name: "Watch", price: 199, category: "accessories", stock: 20 },
];

// Seed Database
const seedDatabase = async () => {
	try {
		// Connect to MongoDB
		const mongoUri = process.env.MONGO_URI || "";
		await mongoose.connect(mongoUri);
		console.log("Connected to MongoDB");

		// Clear existing data
		await User.deleteMany({});
		await Product.deleteMany({});
		console.log("Existing data cleared");

		// Insert sample data
		await User.insertMany(sampleUsers);
		await Product.insertMany(sampleProducts);
		console.log("Sample data added successfully");

		// Disconnect from MongoDB
		await mongoose.disconnect();
		console.log("Database connection closed");
	} catch (error) {
		console.error("Error seeding database:", error);
		await mongoose.disconnect();
	}
};

// Run the seeding script
seedDatabase();
