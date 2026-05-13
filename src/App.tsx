import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { autoCarryForwardCheck } from "@/lib/carryForward";
import { isSupabaseConfigured } from "@/lib/supabase";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading, signIn, signUp, signInWithMagicLink, signOut } = useAuth();

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Auto-carry-forward tasks when user signs in
  useEffect(() => {
    if (user) {
      autoCarryForwardCheck();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!isSupabaseConfigured()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Daily Blueprint setup required</h1>
              <p className="text-sm text-muted-foreground">
                The app cannot start until Supabase environment variables are configured.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-left text-sm text-muted-foreground space-y-2">
              <p>Add these values to a .env.local file in the project root:</p>
              <p>NEXT_PUBLIC_SUPABASE_URL</p>
              <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</p>
            </div>
            <p className="text-xs text-muted-foreground">
              After adding them, restart the dev server.
            </p>
          </div>
        </div>
      );
    }

    return (
      <AuthForm
        onSignIn={signIn}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index user={user} onSignOut={signOut} />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
