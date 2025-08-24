import express from 'express';
import cors from 'cors';
import { formDataRouter } from "./controllers/form-data-controller";
import { orderRouter } from "./controllers/order-controller";
import { healthRouter } from "./controllers/health-controller";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// Form data endpoints: /api/form-data/*
app.use("/api/form-data", formDataRouter);

// Order endpoints: /api/order/*
app.use("/api/order", orderRouter);

// Health endpoints: /api/health/*
app.use("/api/health", healthRouter);

export { app, PORT };
