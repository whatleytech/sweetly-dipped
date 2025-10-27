import express from 'express';
import cors from 'cors';
import { formsRouter } from '@/controllers/forms-controller';
import { orderRouter } from "@/controllers/order-controller";
import { healthRouter } from "@/controllers/health-controller";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// Form endpoints: /api/forms/*
app.use("/api/forms", formsRouter);

// Order endpoints: /api/order/*
app.use("/api/order", orderRouter);

// Health endpoints: /api/health/*
app.use("/api/health", healthRouter);

export { app, PORT };
