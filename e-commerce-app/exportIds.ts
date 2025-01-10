import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { json2csv } from "json-2-csv";
import User from "./models/User";
import Product from "./models/Product";

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

// Function to export IDs to a CSV file
const exportIdsToCsv = async (
	collectionName: string,
	ids: Record<string, string>[]
) => {
	try {
		const csv = json2csv(ids); // Convert to CSV
		const fileName = `${collectionName}Ids.csv`;
		fs.writeFileSync(fileName, csv); // Write CSV to file
		console.log(`Exported ${ids.length} IDs to ${fileName}`);
	} catch (error) {
		console.error(`Error exporting ${collectionName} IDs to CSV:`, error);
	}
};

// Main function to query and export IDs
const exportIds = async () => {
	try {
		await connectToDatabase();

		console.log("Querying user IDs...");
		const userIds = await User.find({}, { _id: 1 }).lean().exec();
		console.log(`Fetched ${userIds.length} user IDs.`);

		console.log("Querying product IDs...");
		const productIds = await Product.find({}, { _id: 1 }).lean().exec();
		console.log(`Fetched ${productIds.length} product IDs.`);

		console.log("Exporting user IDs to CSV...");
		await exportIdsToCsv(
			"user",
			userIds.map((user) => ({
				userId: user._id.toString(),
			}))
		);

		console.log("Exporting product IDs to CSV...");
		await exportIdsToCsv(
			"product",
			productIds.map((product) => ({ productId: product._id.toString() }))
		);

		mongoose.disconnect();
		console.log("Export process completed. Database connection closed.");
	} catch (error) {
		console.error("Error during export process:", error);
		mongoose.disconnect();
		process.exit(1);
	}
};

// Run the script
exportIds();
