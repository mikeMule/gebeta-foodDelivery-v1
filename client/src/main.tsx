import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Custom styles for the app
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
  
  h1, h2, h3, h4, h5, h6, .font-heading {
    font-family: 'DM Sans', sans-serif;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes slideUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .animate-slide-up {
    animation: slideUp 0.5s ease-in-out;
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }
`;
document.head.appendChild(style);

// Override the theme with FoodDash colors
document.documentElement.style.setProperty('--primary', '#FF3008');
document.documentElement.style.setProperty('--secondary', '#39C2AA');

createRoot(document.getElementById("root")!).render(<App />);
