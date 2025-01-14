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
	scenarios: {
		load_test: {
			executor: "ramping-vus",
			startVUs: 0,
			stages: [
				{ duration: "60s", target: 100 },
				{ duration: "60s", target: 0 },
			],
		},
	},
};

// Random helper function
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Virtual user actions
export default function () {
	// Randomize userId and productId for each virtual user
	const userId = getRandomElement(userIds);
	const productId = getRandomElement(productIds);

	// Browse products
	const browseResponse = http.get(
		`https://e-commerce-app-vtwx.onrender.com/products?page=${
			Math.floor(Math.random() * 10) + 1
		}&limit=20`
	);
	check(browseResponse, {
		"Browse products status is 200": (r) => r.status === 200,
	});

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

	sleep(1); // Simulate user think time
}
