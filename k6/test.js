// Load testing
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
	vus: 10, // Virtual Users
	duration: "5m",
	thresholds: {
		http_req_failed: ["rate<0.01"],
		http_req_duration: ["p(95)<200"],
	},
	tags: { testName: `TestRun-${Date.now()}` }, // Unique test name for each run
};

export default function () {
	let res = http.get(
		"https://e-commerce-app-vtwx.onrender.com/products?category=electronics"
	);
	check(res, { "status is 200": (r) => r.status === 200 });
	sleep(1);
}
