# 🚀 Express Template Quickstart

*A lightweight, ready-to-use boilerplate to jumpstart your Express.js + TypeScript + auth + security backend projects.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)



## 🧭 Table of Contents               |

- [About](#-about)
- [Features](#-features)
- [Quickstart](#-quickstart)
- [Structure](#-structure)
- [Contributing](#-contributing)
- [Feedback and Contributions](#-feedback-and-contributions)
- [License](#-license)



## 🧠 About the Project

As a web developer, I got tired of retyping the same Express boilerplate for every new project.
**So I decided to build my own clean, modular, and secure template** — a solid foundation to **quickstart any backend** without wasting time reinventing setup, structure, or config.

This template comes ready with TypeScript, Express, security middlewares, logging, and best practices.
Clone it, configure it, and start coding your features immediately.


## ✨ Features

* **🧩 TypeScript support** — modern syntax, type safety, and scalability
* **⚡ Express 4.18** — minimal and fast web framework for Node.js
* **🛡️ Security ready** — Helmet, CORS, CSRF protection, rate limiting, and bcrypt
* **🧱 Clean structure** — controllers, routes, services, middleware, config
* **🧰 Centralized config** — manage everything via `.env`
* **📜 Logging** — organized and centralized logs
* **🚀 Ready to deploy** — easily adaptable for production environments


## ⚙️ Requirements

Make sure you have the following installed:

* **Node.js** ≥ 16
* **npm** or **yarn**
* **MongoDB** ≥ 5 (local or remote instance)


## 🪄 Quickstart

### 1. Clone the Repository

```bash
git clone https://github.com/Dev-Relax/express-template-quickstart.git
cd express-template-quickstart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill it with your own values:

```bash
cp .env.example .env
```

Example `.env`:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CSRF_SECRET=your_csrf_secret
```

### 4. Start the Development Server

```bash
npm run dev
```

Your API is now running at **[http://localhost:3000](http://localhost:3000)** 🚀

### 5. Build for Production

```bash
npm run build
npm start
```

## 📂 Structure

```
.
├── src/
│   ├── config/          # Configuration (env, db)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, error handling, logging
│   ├── routes/          # API routes
│   ├── services/        # Business logic and data access
│   └── index.ts         # App entry point
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🤝 Contributing

Contributions are welcome!
If you have improvements, bug fixes, or feature ideas:

1. Fork the repo
2. Create a new branch (`feature/your-feature-name`)
3. Make your changes
4. Submit a pull request

Please follow the existing coding style and keep commits clean and descriptive.


## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> *“Start once, build faster every time.”*
> Made with ❤️ by [Dev-Relax](https://github.com/Dev-Relax)
