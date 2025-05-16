import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { AttendanceProvider } from "./context/AttendanceContex.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendanceProvider>
          <App />
        </AttendanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
