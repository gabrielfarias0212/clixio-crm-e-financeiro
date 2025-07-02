
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import ClientList from "./pages/ClientList";
import Index from "./pages/Index";
import CashFlow from "./pages/CashFlow";
import Calendar from "./pages/Calendar";
import PersonalControl from "./pages/PersonalControl";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import ServicesProducts from "@/pages/ServicesProducts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout>
                <Index />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/clients"
          element={
            <AuthGuard>
              <Layout>
                <ClientList />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/cash-flow"
          element={
            <AuthGuard>
              <Layout>
                <CashFlow />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/calendar"
          element={
            <AuthGuard>
              <Layout>
                <Calendar />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/personal-control"
          element={
            <AuthGuard>
              <Layout>
                <PersonalControl />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/services-products"
          element={
            <AuthGuard>
              <Layout>
                <ServicesProducts />
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
