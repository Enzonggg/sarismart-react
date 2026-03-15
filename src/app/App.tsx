import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/auth-context";
import { DataProvider } from "./context/data-context";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RouterProvider router={router} />
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}