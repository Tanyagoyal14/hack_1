import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Survey from "@/pages/survey";
import Dashboard from "@/pages/dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Survey} />
      <Route path="/survey" component={Survey} />
      <Route path="/dashboard/:studentId" component={Dashboard} />
      <Route path="/teacher/:studentId" component={TeacherDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityToolbar />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
