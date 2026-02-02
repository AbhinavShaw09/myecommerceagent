# Customer Data Platform for E-commerce

A full-stack agentic AI application for email marketing and customer data management for e-commerce brands.

## Features

1. **Customer Management** - Full CRUD with Create, Read, Update, Delete operations
2. **Customer Segments** - Full CRUD with dynamic condition builder (field, operator, value)
3. **Email Flows** - Full CRUD with multi-step email sequence builder
4. **Campaigns** - Full CRUD to combine segments with email flows
5. **AI Assistant** - Generate customer segments and campaign ideas using AI

## Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: SQLite
- **AI**: Simple rule-based logic (can be extended with OpenAI/Claude)
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toast library

## Quick Start

### 1. Backend Setup
```bash
cd backend
make migrate    # Create database and run migrations
make setup      # Create sample customer data
make dev        # Start Django server on http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend
make install    # Install dependencies
make dev        # Start Next.js server on http://localhost:3000
```

### 3. Start Both Services
```bash
make start      # Start both frontend and backend
```

## API Endpoints

- `GET /api/customers/` - List all customers
- `POST /api/customers/` - Create new customer
- `GET /api/segments/` - List all segments
- `POST /api/segments/` - Create new segment
- `GET /api/flows/` - List all email flows
- `POST /api/flows/` - Create new flow
- `POST /api/generate/` - AI assistant endpoint

## Customer Data Model

The Customer model includes:
- Basic info: email, name, phone
- Address: city, state, zip, country
- E-commerce metrics: LTV, total orders, last order date, AOV
- Marketing: email subscription status, acquisition source

## AI Assistant Example

Input:
```
I want to improve revenue from high lifetime value customers that haven't purchased recently.
```

Output:
- **Segment**: Customers with LTV > 75th percentile, subscribed to email, no orders in last 60 days
- **Campaign**: Subject line, send time, content ideas

## Development

### Backend Commands
- `make dev` - Start Django server
- `make migrate` - Run database migrations
- `make setup` - Create sample data
- `make clean` - Clean cache files

### Frontend Commands
- `make dev` - Start Next.js development server
- `make build` - Build for production
- `make install` - Install dependencies
- `make clean` - Clean build files

## Sample Data

The setup includes 5 sample customers with varying:
- Locations (Texas, California)
- Lifetime values ($450 - $2100)
- Order history (3-12 orders)
- Email subscription status
- Last order dates (15-90 days ago)

## Future Enhancements

1. **Real AI Integration** - Connect to OpenAI/Claude for smarter segment and campaign generation
2. **Advanced Segmentation** - More complex conditions and operators
3. **Email Templates** - Visual email builder
4. **Analytics Dashboard** - Campaign performance metrics
5. **A/B Testing** - Test different email variations
6. **Automation Triggers** - Event-based email sending
