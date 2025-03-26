
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function AddClient() {
  const navigate = useNavigate();

  const handleSubmit = (data: ClientFormValues) => {
    // In a real app, this would make an API call
    console.log("Creating client:", data);
    toast.success("Cliente adicionado com sucesso");
    navigate("/clients");
  };

  useEffect(() => {
    document.title = "Adicionar Cliente | Wedding CRM";
  }, []);

  return (
    <Layout>
      <div className="max-w-screen-md mx-auto px-4 py-8">
        <Link 
          to="/clients"
          className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para Clientes
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Adicionar Novo Cliente</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-fade-in">
          <ClientForm onSubmit={handleSubmit} />
        </div>
      </div>
    </Layout>
  );
}
