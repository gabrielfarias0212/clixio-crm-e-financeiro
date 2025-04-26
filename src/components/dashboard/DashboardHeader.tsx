
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
      <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
      <Link to="/clients/add">
        <Button>Adicionar Novo Cliente</Button>
      </Link>
    </div>
  );
}
