import mongoose from "mongoose";
import dotenv from "dotenv";
import User, { IUser } from "./models/User";
import Product, { IProduct } from "./models/Product";
import { faker } from "@faker-js/faker";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectToDatabase = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI || "");
		console.log("Connected to MongoDB");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
};

// Generate Mock Data
const generateUsers = (count: number): IUser[] => {
	const users: IUser[] = [];
	for (let i = 0; i < count; i++) {
		users.push({
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
		} as IUser);
	}
	return users;
};

const generateProducts = (count: number): IProduct[] => {
	const categories = [
		"electronics",
		"fashion",
		"home",
		"toys",
		"books",
		"sports",
	];
	const products: IProduct[] = [];
	for (let i = 0; i < count; i++) {
		products.push({
			name: faker.commerce.productName(),
			price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
			category: faker.helpers.arrayElement(categories),
			stock: faker.number.int({ min: 1, max: 100 }),
		} as IProduct);
	}
	return products;
};

// Seed Database
const seedDatabase = async ({
	userCount = 10000,
	productCount = 50000,
	batchSize = 1000,
	override = false,
}: {
	userCount: number;
	productCount: number;
	batchSize: number;
	override: boolean;
}) => {
	try {
		await connectToDatabase();

		// Clear existing data
		if (override) {
			await User.deleteMany({});
			await Product.deleteMany({});
			console.log("Existing data cleared");
		}

		// Insert mock data
		const users = generateUsers(userCount);
		const products = generateProducts(productCount);

		console.log(`Seeding ${userCount} users in batches of ${batchSize}...`);
		for (let i = 0; i < users.length; i += batchSize) {
			const batch = users.slice(i, i + batchSize);
			await User.insertMany(batch);
			console.log(
				`Seeded users batch ${i / batchSize + 1}/${Math.ceil(
					userCount / batchSize
				)}`
			);
		}

		console.log(
			`Seeding ${productCount} products in batches of ${batchSize}...`
		);
		for (let i = 0; i < products.length; i += batchSize) {
			const batch = products.slice(i, i + batchSize);
			await Product.insertMany(batch);
			console.log(
				`Seeded products batch ${i / batchSize + 1}/${Math.ceil(
					productCount / batchSize
				)}`
			);
		}

		mongoose.disconnect();
		console.log("Database seeding completed and connection closed");
	} catch (error) {
		console.error("Error seeding database:", (error as any).message);
		mongoose.disconnect();
		process.exit(1);
	}
};

// Run the seeding script
seedDatabase({
	userCount: 10000,
	productCount: 50000,
	batchSize: 10000,
	override: true,
});
