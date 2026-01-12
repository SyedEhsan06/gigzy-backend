# GigFlow - Backend API

## Overview
GigFlow is a freelance marketplace platform where clients can post jobs (Gigs) and freelancers can submit bids.

## Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud instance)
- npm or pnpm

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd gigflow/server
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_secret_jwt_key_here_make_it_long_and_secure
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. Start the server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Gigs
- `GET /api/gigs` - Get all open gigs (supports search query)
- `GET /api/gigs/:id` - Get single gig by ID
- `GET /api/gigs/my-gigs` - Get user's own gigs (protected)
- `POST /api/gigs` - Create new gig (protected)

### Bids
- `POST /api/bids` - Submit a bid (protected)
- `GET /api/bids/my-bids` - Get user's own bids (protected)
- `GET /api/bids/:gigId` - Get all bids for a gig (owner only, protected)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (protected)

## Database Schema

### User
```typescript
{
  name: string;
  email: string (unique);
  password: string (hashed);
}
```

### Gig
```typescript
{
  title: string;
  description: string;
  budget: number;
  ownerId: ObjectId (ref: User);
  status: 'open' | 'assigned';
  timestamps: true;
}
```

### Bid
```typescript
{
  gigId: ObjectId (ref: Gig);
  freelancerId: ObjectId (ref: User);
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  timestamps: true;
}
```

## Features Implemented

✅ **Core Features:**
- Secure authentication with JWT + HttpOnly cookies
- CRUD operations for Gigs
- Bidding system with status tracking
- Atomic hiring logic (prevents race conditions)

✅ **Bonus Features:**
- MongoDB Transactions for data integrity
- Proper authorization checks
- Search/filter functionality

## Technologies
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT with HttpOnly cookies
- **Security:** bcryptjs for password hashing

## Project Structure
```
server/
├─ src/
│  ├─ config/
│  │  └─ db.ts
│  ├─ models/
│  │  ├─ User.ts
│  │  ├─ Gig.ts
│  │  └─ Bid.ts
│  ├─ controllers/
│  │  ├─ auth.controller.ts
│  │  ├─ gig.controller.ts
│  │  └─ bid.controller.ts
│  ├─ routes/
│  │  ├─ auth.routes.ts
│  │  ├─ gig.routes.ts
│  │  └─ bid.routes.ts
│  ├─ middlewares/
│  │  └─ auth.middleware.ts
│  └─ app.ts
├─ .env.example
├─ package.json
└─ tsconfig.json
```

## License
MIT