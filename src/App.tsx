import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Sanchometro from "./pages/Sanchometro";
import Dosier from "./pages/Dosier";
import Troupe from "./pages/Troupe";
import Numeros from "./pages/Numeros";
import Mentiras from "./pages/Mentiras";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <>
      {children}
      <BottomNav />
    </>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/breaking" element={<Layout><Index filter="breaking" /></Layout>} />
            <Route path="/sanchometro" element={<Layout><Sanchometro /></Layout>} />
            <Route path="/dosier" element={<Layout><Dosier /></Layout>} />
            <Route path="/troupe" element={<Layout><Troupe /></Layout>} />
            <Route path="/numeros" element={<Layout><Numeros /></Layout>} />
            <Route path="/mentiras" element={<Layout><Mentiras /></Layout>} />
            <Route path="/saved" element={<Layout><Saved /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
