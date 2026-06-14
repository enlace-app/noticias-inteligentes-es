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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Index />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/breaking"
              element={
                <ProtectedRoute>
                  <>
                    <Index filter="breaking" />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sanchometro"
              element={
                <ProtectedRoute>
                  <>
                    <Sanchometro />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <>
                    <Saved />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <>
                    <Profile />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
