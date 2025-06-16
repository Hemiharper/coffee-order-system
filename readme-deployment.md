# Coffee Order System

A modern, production-ready coffee ordering system built with Next.js, featuring separate customer and barista interfaces.

## Features

- **Customer Interface**: Place orders, track status, cancel pending orders, mark as collected
- **Barista Interface**: Manage all orders, update status, view customer notes
- **Real-time Updates**: Orders sync across interfaces automatically
- **Responsive Design**: Works perfectly on mobile and desktop
- **Production Ready**: Built with Next.js 14 and modern practices

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd coffee-order-system

# Install dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for customer interface
Open [http://localhost:3000/barista](http://localhost:3000/barista) for barista interface

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
coffee-order-system/
├── app/
│   ├── api/orders/route.js      # API endpoints for orders
│   ├── barista/page.js          # Barista interface page
│   ├── components/              # Reusable components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── OrderForm.jsx        # Order placement form
│   │   ├── CustomerOrderStatus.jsx # Customer order tracking
│   │   └── BaristaView.jsx      # Barista order management
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   └── page.