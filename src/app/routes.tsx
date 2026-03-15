import { createBrowserRouter } from "react-router";
import { DashboardPage } from "./pages/dashboard-page";
import { InventoryPage } from "./pages/inventory-page";
import { ForecastPage } from "./pages/forecast-page";
import { AnalyticsPage } from "./pages/analytics-page";
import { SettingsPage } from "./pages/settings-page";
import { LoginPage } from "./pages/login-page";
import { SignupPage } from "./pages/signup-page";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: DashboardPage },
      { path: "inventory", Component: InventoryPage },
      { path: "forecast", Component: ForecastPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);