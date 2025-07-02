import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import CashFlow from "./pages/CashFlow";
import Calendar from "./pages/Calendar";
import PersonalControl from "./pages/PersonalControl";
import Layout from "./components/Layout";
import Suppliers from "./pages/Suppliers";
import Projects from "./pages/Projects";
import ServicesProducts from "@/pages/ServicesProducts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/clients"
          element={
            <AuthGuard>
              <Layout>
                <Clients />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/suppliers"
          element={
            <AuthGuard>
              <Layout>
                <Suppliers />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/projects"
          element={
            <AuthGuard>
              <Layout>
                <Projects />
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
