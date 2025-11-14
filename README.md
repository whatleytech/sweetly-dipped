# Sweetly Dipped

A luxury chocolate-treat e-commerce platform built with modern web technologies. This monorepo contains a full-stack application for ordering custom chocolate-covered treats with a beautiful, responsive design.

## Project Description

Sweetly Dipped is a multi-page web application that allows customers to:
- Browse chocolate-covered treats (pretzels, oreos, marshmallows, rice krispies)
- Select from various package sizes and pricing tiers
- Design custom orders with detailed specifications
- Complete the ordering process with contact and pickup information
- Receive order confirmations and thank you messages

## Technologies Used

### Frontend (Web Package)
- **React 19** - Modern React with latest features
- **TypeScript** - Full type safety throughout the application
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form state management and validation
- **TanStack Query** - Server state management
- **CSS Modules** - Scoped styling with component isolation
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities

### Backend (API Package)
- **Node.js** - JavaScript runtime
- **NestJS** - Opinionated framework atop Express/Fastify
- **TypeScript** - Type-safe server code
- **Prisma** - Type-safe ORM for PostgreSQL
- **PostgreSQL** - Production database
- **CORS** - Cross-origin resource sharing
- **Vitest** - API testing

### Development Tools
- **Turbo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Yarn** - Package manager with workspaces
- **Playwright** - End-to-end testing framework
- **Docker** - Containerization for deployment

### Deployment (Deploy Package)
- **Railway** - Production hosting platform
- **Railway CLI** - Deployment automation
- **PostgreSQL** - Managed database service
- **Bash Scripts** - Automated deployment workflows

## Package Structure

This is a monorepo using Yarn workspaces with the following packages:

```
packages/
├── web/                    # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   ├── assets/        # Static assets (images, CSS)
│   │   └── api/           # API client functions
│   └── package.json
├── api/                    # Backend NestJS server
│   ├── src/
│   │   ├── app.module.ts  # Root Nest module
│   │   ├── main.ts        # Bootstrap entry point
│   │   ├── forms/         # Feature module for order form APIs
│   │   ├── orders/        # Feature module for order numbers
│   │   └── health/        # Feature module for health checks
│   ├── prisma/            # Prisma schema and migrations
│   └── package.json
├── deploy/                 # Railway deployment scripts
│   ├── configs/           # Railway service configurations
│   ├── scripts/           # Deployment automation scripts
│   ├── .env.railway.example  # Environment template (gitignored actual)
│   └── README.md          # Deployment documentation
├── shared-types/           # Shared TypeScript types
│   ├── formTypes.ts       # Form data interfaces
│   └── index.ts
├── config-eslint/          # Shared ESLint configuration
├── config-ts/             # Shared TypeScript configuration
├── e2e/                   # End-to-end tests with Playwright
└── root package.json      # Workspace configuration
```

## Installation Instructions

### Prerequisites
- **Node.js** (version specified in `.nvmrc`)
- **Yarn** (version 4.9.4 or later)

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd sweetly-dipped
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Verify installation**:
   ```bash
   yarn type-check
   yarn lint
   ```

## Usage Instructions

### Development

**Start both frontend and backend in development mode**:
```bash
yarn dev
```

**Start only the web application**:
```bash
yarn dev:web
```

**Start only the API server**:
```bash
yarn dev:api
```

The web application will be available at `http://localhost:5173`
The API server will be available at `http://localhost:3001`

### Building for Production

**Build all packages**:
```bash
yarn build
```

**Preview production build**:
```bash
yarn preview
```

### Testing

**Run all tests**:
```bash
yarn test
```

**Run tests with coverage**:
```bash
yarn test:coverage
```

**Generate coverage report**:
```bash
yarn coverage:full
```

**Run end-to-end tests**:
```bash
yarn test:e2e
```

**Run e2e tests with UI mode**:
```bash
yarn test:e2e:ui
```

**Run e2e tests in headed mode**:
```bash
yarn test:e2e:headed
```

### Code Quality

**Lint all packages**:
```bash
yarn lint
```

**Type checking**:
```bash
yarn type-check
```

**Format code**:
```bash
yarn format
```

## Features

### Customer Experience
- **Responsive Design** - Mobile-first approach with tablet and desktop breakpoints
- **Multi-step Order Process** - Guided form flow with progress tracking
- **Real-time Validation** - Immediate feedback on form inputs
- **Order Confirmation** - Clear confirmation and thank you pages
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation

### Technical Features
- **Type Safety** - Full TypeScript implementation across frontend and backend
- **Component Architecture** - Modular, reusable components with CSS Modules
- **Form Management** - Advanced form handling with React Hook Form
- **State Management** - Efficient client and server state management
- **Testing** - Comprehensive test coverage with Vitest, React Testing Library, and Playwright E2E tests
- **Performance** - Optimized builds with Vite and code splitting

### Available Pages
- **Landing Page** - Hero section, treats showcase, and pricing
- **Design Package Page** - Multi-step order form with validation
- **Confirmation Page** - Order summary and confirmation
- **Thank You Page** - Post-order completion message

## Brand Colors

The Sweetly Dipped design system uses a carefully crafted color palette defined as CSS custom properties:

### Primary Colors
- **Chocolate Coating**: `#4b2e2b` (`--sd-brown-dark`)
- **Drip Highlight**: `#6b433f` (`--sd-brown-light`)
- **Logo Pink**: `#ff66a0` (`--sd-pink-base`)
- **Background Tint**: `#ffe6f1` (`--sd-pink-light`)

### Neutral Colors
- **Frosting**: `#fffaf6` (`--sd-cream`)
- **Pure White**: `#ffffff` (`--sd-white`)

### Accent Colors
- **Gold Accent**: `#bfa276` (`--sd-gold-accent`)

### Usage Guidelines
- All colors are accessible with proper contrast ratios
- Use `--sd-cream` or `--sd-white` as foreground on dark brown backgrounds
- Use `--sd-brown-dark` as text over light pink backgrounds
- Maintain ≥ 4.5:1 contrast ratio for body text
- Maintain ≥ 3:1 contrast ratio for large headings and button text

## Development Standards

### Code Quality
- **ESLint** - Enforced code style and best practices
- **Prettier** - Consistent code formatting
- **TypeScript** - Strict type checking enabled
- **Testing** - Minimum 80% test coverage required

### Accessibility
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **ARIA attributes** for interactive elements

### Performance
- **Lighthouse** optimization targets
- **Bundle size** monitoring
- **Image optimization** for web assets
- **Code splitting** for optimal loading

## Deployment

### Production Deployment to Railway

The project is deployed to Railway using automated scripts in the `packages/deploy` package.

**Quick deployment workflow**:

```bash
# One-time setup (already completed)
yarn deploy:init                  # Initialize Railway project
yarn deploy:setup                 # Create services and database

# Deploy services
yarn deploy:api                   # Deploy API + run migrations
yarn deploy:web                   # Deploy web application
yarn deploy:verify                # Verify both services are running

# Monitor deployments
yarn logs:api:follow              # Watch API logs
yarn logs:web:follow              # Watch web logs
yarn railway:status               # Check service status
```

**Production URLs**:
- API: `https://sweetly-dipped-api-production.up.railway.app`
- Web: `https://sweetly-dipped-web-production.up.railway.app`
- Railway Dashboard: `https://railway.com/dashboard`

For detailed deployment documentation, see `packages/deploy/README.md`.

### Database Operations

```bash
# Run migrations in production
yarn db:migrate:prod

# Seed production database
yarn db:seed:prod
```

## Contributing

1. Follow the established code style and patterns
2. Write tests for new features
3. Ensure accessibility compliance
4. Update documentation as needed
5. Run the full test suite before submitting changes

## License

Private project - All rights reserved.
