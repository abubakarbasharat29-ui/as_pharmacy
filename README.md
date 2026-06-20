# 🏥 AS Pharmacy — Medical Store Automation System

A complete, full-stack pharmacy management system that digitizes the day-to-day operations of a medical store — from inventory tracking and billing to sales analytics and AI-powered health assistance.

---

## 📖 Overview

AS Pharmacy automates the complete workflow of a medical store. When a customer requests a medicine, staff can instantly search the inventory, generate an accurate bill with discounts, and complete the transaction — while the system maintains a centralized, real-time record of every sale. Pharmacy owners (Admins) can securely monitor their business — sales, revenue, and stock — from anywhere, at any time.

---

## ✨ Features

- 📦 **Inventory Management** — Add, edit, and track medicines with stock levels, pricing, categories, and expiry dates, with automated low-stock alerts
- 🧾 **Billing System** — Search medicines, apply discounts, and generate invoices instantly with auto-calculated totals
- 📜 **Sales History** — Searchable, filterable transaction history with invoice details
- 👥 **Role-Based Access Control** — Separate Staff and Admin portals with distinct permissions
- 📊 **Analytics & Reports** — Revenue breakdowns, top-selling medicines, order trends, and exportable reports
- 🤖 **AI Health Assistant** — Built-in chatbot (powered by Google Gemini API) that answers medicine and health-related queries
- 🔐 **Secure Authentication** — Email OTP verification, hashed passwords (bcrypt), and session-based access control
- 🕒 **Staff Attendance Tracking**
- ☁️ **Cloud-Hosted** — Fully deployed and accessible online from any device

---

## 🛠️ Tech Stack

| Layer        | Technology                  |
|--------------|------------------------------|
| Frontend     | HTML, CSS, JavaScript        |
| Backend      | PHP                           |
| Database     | MySQL                         |
| AI Integration | Google Gemini API           |
| Hosting      | Railway                       |
| Deployment   | Docker                        |

---

## 📂 Project Structure

```
as_pharmacy/
├── api/                    # Backend PHP endpoints
│   ├── auth.php            # Login, signup, session handling
│   ├── chatbot.php         # AI health assistant (Gemini API)
│   ├── config.php          # Database connection & helpers
│   ├── medicines.php       # Inventory CRUD operations
│   ├── sales.php           # Billing & sales records
│   ├── settings.php
│   ├── setup.php
│   ├── users.php
│   └── attendance.php
├── assets/
│   ├── css/                # Stylesheets
│   ├── js/                 # Frontend scripts (incl. chatbot.js)
│   └── img/
├── index.html               # Landing page
├── login.html
├── signup.html
├── dashboard.html
├── inventory.html
├── billing.html
├── sales.html
├── reports.html
├── attendance.html
├── admin.html
├── admin-login.html
├── Dockerfile
└── railway.toml
```

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- MySQL database
- A Google Gemini API key

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/abubakarbasharat29-ui/as_pharmacy.git
   cd as_pharmacy
   ```

2. **Configure the database**
   Update database credentials in `api/config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_PORT', 'your_port');
   define('DB_USER', 'root');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'railway');
   ```

### Deployment (Railway)

This project includes a `Dockerfile` and `railway.toml` for one-click deployment on [Railway](https://railway.app):

1. Connect your GitHub repository to Railway
2. Add the `GEMINI_API_KEY` environment variable in the service's Variables tab
3. Railway will automatically build and deploy on every push to `main`

---

## 🔐 Security Notes

- Passwords are hashed using bcrypt
- Email OTP verification required on signup
- Sensitive credentials (DB password, API keys) are managed via environment variables, not hardcoded
- Input sanitization applied to prevent XSS

---

## 🤝 Contributing

This is a personal/student project, but suggestions and feedback are always welcome. Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is open for educational and personal use.

---

## 👤 Author

**Abubakar Basharat**
GitHub: [@abubakarbasharat29-ui](https://github.com/abubakarbasharat29-ui)