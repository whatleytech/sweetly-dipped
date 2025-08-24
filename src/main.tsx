import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import { LandingPage } from "./pages/LandingPage";
import { DesignPackagePage } from "./pages/DesignPackagePage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { Layout } from "./components/Layout/Layout";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/about"
              element={<div>About Us Page (Coming Soon)</div>}
            />
            <Route path="/design-package" element={<DesignPackagePage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
