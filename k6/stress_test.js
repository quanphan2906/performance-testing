// Stress testing
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
	thresholds: {
		http_req_failed: ["rate<0.01"],
		http_req_duration: ["p(95)<200"],
	},
	stages: [
		{
			duration: "1m",
			target: 10,
		},
		{
			duration: "2m",
			target: 10,
		},
		{
			duration: "1m",
			target: 30,
		},
		{
			duration: "2m",
			target: 30,
		},
		{
			duration: "1m",
			target: 100,
		},
		{
			duration: "2m",
			target: 100,
		},
		{
			duration: "1m",
			target: 0,
		},
	],
};

export default function () {
	let res = http.get(
		"https://e-commerce-app-vtwx.onrender.com/products?category=electronics"
	);
	check(res, { "status is 200": (r) => r.status === 200 });
	sleep(1);
}
