import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

// Load user and product IDs from CSV files
const userIds = new SharedArray("userIds", function () {
	return open("data/userIds.csv")
		.split("\n")
		.slice(1)
		.map((line) => line.split(",")[0]);
});

const productIds = new SharedArray("productIds", function () {
	return open("data/productIds.csv")
		.split("\n")
		.slice(1)
		.map((line) => line.split(",")[0]);
});

// Test options
export const options = {
	thresholds: {
		http_req_failed: ["rate<0.01"], // Errors should be less than 1%
		http_req_duration: ["p(50)<300", "p(95)<500", "p(99)<1000"], // Latency requirements
	},
	stages: [
		{ duration: "120s", target: 100 }, // Ramp-up
		{ duration: "300s", target: 100 }, // Steady load
		{ duration: "120s", target: 0 }, // Ramp-down
	],
};

// Random helper function
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Weighted random selection function
function weightedRandom(weights) {
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
	const random = Math.random() * totalWeight;
	let cumulativeWeight = 0;

	for (let i = 0; i < weights.length; i++) {
		cumulativeWeight += weights[i];
		if (random <= cumulativeWeight) {
			return i;
		}
	}
	return weights.length - 1; // Default to the last index
}

// Virtual user actions
export default function () {
	// Randomize userId and productId for each virtual user
	const userId = getRandomElement(userIds);
	const productId = getRandomElement(productIds);

	// Define weights for actions
	const weights = [0.8, 0.15, 0.05]; // Corresponding to /products, /cart, /orders
	const actionIndex = weightedRandom(weights);

	// Perform action based on weighted random selection
	if (actionIndex === 0) {
		// Browse products
		const browseResponse = http.get(
			`https://e-commerce-app-vtwx.onrender.com/products?page=${
				Math.floor(Math.random() * 10) + 1
			}&limit=20`
		);
		check(browseResponse, {
			"Browse products status is 200": (r) => r.status === 200,
		});
	} else if (actionIndex === 1) {
		// Add to cart
		const addToCartResponse = http.post(
			"https://e-commerce-app-vtwx.onrender.com/cart",
			JSON.stringify({
				userId: userId,
				productId: productId,
				quantity: 1,
			}),
			{
				headers: { "Content-Type": "application/json" },
			}
		);
		check(addToCartResponse, {
			"Add to cart status is 201": (r) => r.status === 201,
		});
	} else if (actionIndex === 2) {
		// Place order
		const placeOrderResponse = http.post(
			"https://e-commerce-app-vtwx.onrender.com/orders",
			JSON.stringify({
				userId: userId,
				items: [{ productId: productId, quantity: 1 }],
				total: 699,
			}),
			{
				headers: { "Content-Type": "application/json" },
			}
		);
		check(placeOrderResponse, {
			"Place order status is 201": (r) => r.status === 201,
		});
	}

	sleep(1); // Simulate user think time
}
