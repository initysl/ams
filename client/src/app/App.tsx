import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/common/ScrollToTop";
import AppRoutes from "./routes";

function App() {
  return (
    <div className="bg-gray-100">
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>

      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}

export default App;
