from locust import HttpUser, task, between
import random
import csv

# Load userIds and productIds from CSV files
with open("data/userIds.csv", "r") as user_file:
    userIds = [row[0] for row in csv.reader(user_file)][1:]  # Skip header

with open("data/productIds.csv", "r") as product_file:
    productIds = [row[0] for row in csv.reader(product_file)][1:]  # Skip header


# Helper function to get a random element
def get_random_element(array):
    return random.choice(array)


class ECommerceUser(HttpUser):
    wait_time = between(1, 2)  # Simulate user think time between requests

    @task(80)  # /products: 80% of requests
    def browse_products(self):
        page = random.randint(1, 10)
        response = self.client.get(f"/products?page={page}&limit=20")
        if response.status_code == 200:
            self.environment.events.request.fire(
                request_type="GET",
                name="/products",
                response_time=response.elapsed.total_seconds() * 1000,
                response_length=len(response.text),
            )
        else:
            self.environment.events.request.fire(
                request_type="GET",
                name="/products",
                response_time=response.elapsed.total_seconds() * 1000,
                response_length=0,
                exception=Exception("Failed"),
            )

    @task(15)  # /cart: 15% of requests
    def add_to_cart(self):
        user_id = get_random_element(userIds)
        product_id = get_random_element(productIds)
        payload = {"userId": user_id, "productId": product_id, "quantity": 1}
        headers = {"Content-Type": "application/json"}
        response = self.client.post("/cart", json=payload, headers=headers)
        if response.status_code == 201:
            self.environment.events.request.fire(
                request_type="POST",
                name="/cart",
                response_time=response.elapsed.total_seconds() * 1000,
                response_length=len(response.text),
            )
        else:
            self.environment.events.request.fire(
                request_type="POST",
                name="/cart",
                response_time=response.elapsed.total_seconds() * 1000,
                response_length=0,
                exception=Exception("Failed"),
            )

    @task(5)  # /orders: 5% of requests
    def place_order(self):
        user_id = get_random_element(userIds)
        product_id = get_random_element(productIds)
        payload = {
            "userId": user_id,
            "items": [{"productId": product_id, "quantity": 1}],
            "total": 699,
        }
        headers = {"Content-Type": "application/json"}
        response = self.client.post("/orders", json=payload, headers=headers)
        if response.status_code == 201:
            self.environment.events.request.fire(
                request_type="POST",
                name="/orders",
                response_time=response.elapsed.total_seconds() * 1000,
                response_length=len(response.text),
            )
        else:
            self.environment.events.request.fire(
                request_type="POST",
                name="/orders",
                response_time=response.elapsed.total_seconds() * 1000,
                response_length=0,
                exception=Exception("Failed"),
            )
