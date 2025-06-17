# Coffee Order System - Next.js Production Setup

## Project Structure
```
coffee-order-system/
├── app/
│   ├── api/
│   │   └── orders/
│   │       └── route.js
│   ├── barista/
│   │   └── page.js
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── select.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── textarea.jsx
│   │   │   └── alert.jsx
│   │   ├── OrderForm.jsx
│   │   ├── CustomerOrderStatus.jsx
│   │   └── BaristaView.jsx
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── utils.js
│   └── store.js
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Setup Commands

# 1. Create Next.js project
npx create-next-app@latest coffee-order-system --typescript --tailwind --eslint --app

# 2. Navigate to project
cd coffee-order-system

# 3. Install additional dependencies
npm install lucide-react class-variance-authority clsx tailwind-merge

# 4. Install shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select tabs textarea alert

## Files to create/modify:
