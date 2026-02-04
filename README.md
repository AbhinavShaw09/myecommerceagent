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
- **AI**: Google Gemini API integration
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

## AI Assistant Integration

The application now includes a Gemini-based AI assistant that can:

- Generate customer segments from natural language prompts
- Create complete email campaign elements
- Suggest optimal send times and content ideas

### Usage

1. Set your Gemini API key:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

2. Use the AI assistant endpoint:
```bash
POST /api/generate/
{
  "prompt": "I want to improve revenue from high lifetime value customers that haven't purchased recently."
}
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

1. **Advanced AI Features** - More sophisticated prompt engineering and response handling
2. **Real-time Analytics** - Campaign performance tracking
3. **Multi-channel Support** - SMS and push notifications
4. **A/B Testing** - Test different email variations
5. **Automation Triggers** - Event-based email sending
