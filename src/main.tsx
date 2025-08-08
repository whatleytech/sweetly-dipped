import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import { LandingPage } from "./pages/LandingPage";
import { Layout } from "./components/Layout/Layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/about"
            element={<div>About Us Page (Coming Soon)</div>}
          />
          <Route
            path="/build-box"
            element={<div>Build Your Box Page (Coming Soon)</div>}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>
);
