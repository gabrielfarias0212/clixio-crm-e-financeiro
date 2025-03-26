
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { clients } from "@/utils/mockData";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function EditClient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState(clients.find(c => c.id === id));

  useEffect(() => {
    if (!client) {
      toast.error("Cliente não encontrado");
      navigate("/clients");
      return;
    }
    
    document.title = `Editar ${client.name} | Wedding CRM`;
  }, [client, navigate]);

  const handleSubmit = (data: ClientFormValues) => {
    // In a real app, this would make an API call
    console.log("Updating client:", data);
    toast.success("Cliente atualizado com sucesso");
    navigate(`/clients/${id}`);
  };

  if (!client) return null;

  return (
    <Layout>
      <div className="max-w-screen-md mx-auto px-4 py-8">
        <Link 
          to={`/clients/${id}`}
          className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para Detalhes do Cliente
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Editar {client.name}</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-fade-in">
          <ClientForm client={client} onSubmit={handleSubmit} />
        </div>
      </div>
    </Layout>
  );
}
