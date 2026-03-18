# 📊 Dynamic Dashboard System (Node.js + MySQL)

## 🚀 Overview

This project is a **dynamic dashboard application** built using:

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js (Express)
* Database: MySQL

Users can:

* Register & Login
* View dashboard analytics
* Add customizable widgets (charts, tables, KPI)
* Filter data (Today / 7 Days / 30 Days / 90 Days)
* Manage customer orders

---
Video Link : https://drive.google.com/file/d/1F_QaMAhBxKwMfDzZqx-gOJqmjs7dv5o2/view?usp=drivesdk
## ✨ Features

### 🔐 Authentication

* User registration with MySQL
* Login with role-based validation (Admin/User)
* Displays logged-in user's name on dashboard

### 📊 Dashboard

* Dynamic widgets:

  * Bar Chart
  * Line Chart
  * Pie Chart
  * Table
  * KPI Values
* Drag & drop widget builder
* Save dashboard layout
* Delete widgets (persistent)

### 📅 Data Filtering

* Filter data by:

  * Today
  * Last 7 Days
  * Last 30 Days
  * Last 90 Days
  * All Time

### 📦 Order Management

* Add new orders
* View all orders
* Delete orders

---

## 🛠️ Tech Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Frontend | HTML, CSS, JavaScript |
| Backend  | Node.js, Express      |
| Database | MySQL                 |
| Charts   | Chart.js              |

---

## 📂 Project Structure

```
project/
│
├── server.js
├── package.json
│
├── /css
│   └── style.css
│
├── /js
│   └── dashboard.js
│
├── dashboard.html
├── login.html
├── register.html
├── admin-orders.html
└── detail.html
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/dashboard-project.git
cd dashboard-project
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup MySQL Database

Create database:

```sql
CREATE DATABASE halleyx;
```

Create tables:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(100),
  role VARCHAR(20)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  postal VARCHAR(20),
  country VARCHAR(50),
  product VARCHAR(100),
  quantity INT,
  total FLOAT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4️⃣ Start server

```bash
node server.js
```

Server runs at:

```
http://localhost:3000
```

---

## 🔑 Login Flow

1. User logs in → backend verifies from MySQL
2. User name is stored (for UI display)
3. Dashboard shows:






