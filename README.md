# Sweetly Dipped

A luxury-but-accessible chocolate-treat e-commerce site built with React, TypeScript, and Vite.

## Features

- **Responsive Design**: Mobile-first approach with tablet and desktop breakpoints
- **Brand Consistency**: Sweetly Dipped color palette and typography
- **Component Architecture**: Modular, reusable components with CSS Modules
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive test coverage with Vitest and React Testing Library

## Landing Page

The landing page showcases our chocolate-covered treats with:

- **Hero Section**: Lifestyle imagery with compelling headline and sub-copy
- **Treats Grid**: Four treat categories (Pretzels, Oreos, Marshmallows, Rice Krispies)
- **Packages Table**: Four pricing tiers with "Medium" highlighted as most popular
- **CTA Band**: Prominent call-to-action to start the order funnel
- **Footer**: Brand information and social links

### Running Locally

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Start development server**:
   ```bash
   yarn dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests once
- `yarn test:watch` - Run tests in watch mode
- `yarn lint` - Run ESLint

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS Modules with custom properties
- **Testing**: Vitest, React Testing Library
- **Routing**: React Router DOM
- **Package Manager**: Yarn

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Main layout wrapper
│   ├── HeroSection/    # Landing page hero
│   ├── TreatsGrid/     # Treat categories grid
│   ├── PackagesTable/  # Pricing packages
│   ├── CtaBand/        # Call-to-action section
│   └── Footer/         # Site footer
├── pages/              # Route components
│   └── LandingPage.tsx # Main landing page
├── assets/             # Static assets
│   ├── theme.css       # Global CSS variables
│   └── images/         # Image assets
├── types/              # TypeScript type definitions
└── main.tsx           # App entry point
```

## Brand Colors

Our design system uses a carefully crafted color palette:

- **Chocolate Coating**: `#4b2e2b` (Dark brown)
- **Drip Highlight**: `#6b433f` (Light brown)
- **Logo Pink**: `#ff66a0` (Primary accent)
- **Background Tint**: `#ffe6f1` (Light pink)
- **Frosting**: `#fffaf6` (Cream)
- **Pure White**: `#ffffff` (White)
- **Gold Accent**: `#bfa276` (Secondary accent)

All colors are defined as CSS custom properties for consistent usage across components.
