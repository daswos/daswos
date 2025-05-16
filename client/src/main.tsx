import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize analytics
if (typeof window !== 'undefined') {
  // Set up Google Analytics
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', 'G-MEASUREMENT_ID');

  // Make gtag available globally
  window.gtag = gtag;
}

createRoot(document.getElementById("root")!).render(<App />);
