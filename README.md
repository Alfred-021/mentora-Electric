Mentora Electrics

Mentora Electrics is an eCommerce web application designed to sell electrical components at affordable prices, while ensuring easy availability and accessibility for customers. The platform aims to simplify the process of browsing, selecting, and purchasing electrical products online.



Tech Stack

Backend: Django (Python)

Frontend: HTML, CSS

Database: MongoDB (via `django-mongodb-backend`)

Styling: Custom CSS (static files).

Version Control: Git & GitHub




Features (Current & Planned)

✅ Current

Django project setup

Static pages and styling

Basic site structure

🔜 Planned

Product listing & categories

Shopping cart functionality

Checkout system

Payment integration (e.g. M-Pesa / Stripe)

User authentication

Admin product management

Search & filtering

🔐 Security Considerations

Django CSRF protection enabled

Input validation via Django forms

Planned HTTPS enforcement on deployment


Local Setup (MongoDB)

1. Install MongoDB Community Server and start it on `mongodb://127.0.0.1:27017`.
2. Install Python dependencies:
	`pip install -r requirements.txt`
3. (Optional) Set environment variables:
	`MONGODB_URI=mongodb://127.0.0.1:27017/`
	`MONGODB_NAME=mentora_db`
4. Run migrations:
	`python manage.py migrate`
5. Start the app:
	`python manage.py runserver`
