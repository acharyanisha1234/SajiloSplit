# 🏦 SajiloSplit

**Smart Digital Money Management Platform for Nepal**

SajiloSplit is a modern, full-stack fintech application that revolutionizes how people in Nepal manage their money — combining digital wallet, group expense splitting, shared budgets, settlements, bill management, and purpose-locked funds into one seamless platform.

---

## 🎯 About

**SajiloSplit** (meaning "Easy Split" in Nepali) is a comprehensive financial platform built to solve real problems faced by Nepali users:

- **Split expenses** with friends, roommates, and family
- **Track shared budgets** for trips, events, and group projects
- **Settle debts** automatically with optimized algorithms
- **Lock funds** for specific goals like education, rent, or emergencies
- **Manage bills** with recurring reminders
- **Send and receive money** with a simple, modern interface

Unlike existing apps like eSewa or Khalti, SajiloSplit is **not just a wallet** — it's a complete **financial operating system** for groups and individuals.

### Why SajiloSplit?

| Problem | SajiloSplit Solution |
|---------|---------------------|
| Manual expense splitting is confusing | Smart split: Equal, Percentage, Exact, Shares |
| Forget who owes whom | Auto-settlement optimization |
| No visibility into group spending | Real-time group dashboards |
| Money disappears on random spending | Purpose-locked funds |
| Missed bill payments | Smart bill reminders |
| No control over budgets | Monthly budgets with alerts |

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- bcrypt password hashing
- Email verification
- Password reset with secure tokens
- Two-factor authentication (2FA)
- Progressive account lockout (15min → 1hr → 24hr)
- Device fingerprinting
- Session management with device tracking
- Security logging (90-day retention)
- Rate limiting (5 attempts per 15 minutes)
- Password strength enforcement
- Password history (prevent reuse)

### 💰 Digital Wallet
- Personal wallet with balance tracking
- Available vs Locked balance
- Add money (simulated)
- Send money to other users
- Transaction history with filters
- PDF/CSV statement export
- QR code for receiving payments

### 👥 Group Wallet System
- Create groups (Trips, Roommates, Family, Friends)
- Add/remove members
- Group roles (Owner, Admin, Member)
- Group balance tracking
- Target amount with progress bar

### 🧮 Smart Expense Splitting
- **Equal Split** — Divide equally
- **Percentage Split** — Custom percentages
- **Exact Amount** — Each member's share
- **Shares** — Weighted shares
- Receipt upload
- Category organization

### ⚖️ Smart Settlement System
- Automatic who-owes-whom calculation
- Settlement optimization algorithm
- Mark as Pending/Paid/Cancelled
- Settlement history

### 📊 Budget Management
- Monthly budgets by category
- Visual progress bars
- Alerts at 70%, 80%, 90%, 100%
- Over-budget warnings

### 📋 Bill Management
- One-time and recurring bills
- Due date tracking
- Set reminders
- Status: Pending, Paid, Overdue

### 🔒 Purpose-Locked Funds
- Lock money for specific purposes
- Set unlock date
- Cannot spend locked money
- Track status

### 🚨 Emergency Fund System
- Create emergency funds for groups
- Member contributions
- Request emergency funds
- Approve/Reject requests

### 🔔 Real-time Notifications
- Socket.IO powered
- Money received/sent
- Group invitations
- Expense approvals
- Bill reminders
- Budget warnings

### 🛡️ KYC Verification
- Document upload (Citizenship, Passport, License)
- Selfie verification
- Admin verification workflow
- Payment locking without KYC

### 👑 Admin Dashboard
- Comprehensive statistics
- User management
- Transaction monitoring
- Dispute resolution
- Audit logs

### 🌍 Multi-Language Support
- English, Nepali, Hindi, Spanish, French, German
- Portuguese, Turkish, Arabic (RTL), Chinese, Japanese, Korean

### 🎨 Dark Mode
- Full application-wide dark mode
- Persists across sessions

### 📱 Responsive Design
- Mobile-first design
- Desktop sidebar
- Touch-friendly

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router DOM v6
- Axios
- Socket.IO Client
- Recharts
- React Hook Form
- React Hot Toast
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- Nodemailer
- Multer
- Helmet
- express-rate-limit
- express-validator

---
