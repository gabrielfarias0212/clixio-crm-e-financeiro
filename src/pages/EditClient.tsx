import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { ChevronLeft } from "lucide-react";
import { clients } from "@/utils/mockData";
import { toast } from "sonner";
import { Client, Payment } from "@/utils/types";
import { v4 as uuidv4 } from 'uuid';

export default function EditClient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | undefined>(
    () => clients.find(c => c.id === id)
  );

  useEffect(() => {
    if (!client) {
      toast.error("Cliente não encontrado");
      navigate("/clients");
      return;
    }
    
    document.title = `Editar ${client.name} | Wedding CRM`;
  }, [client, navigate]);

  const handleUpdateClient = (data: ClientFormValues) => {
    if (!client) return;
    
    // Handle downpayment changes
    let updatedPayments = [...client.payments];
    
    // Check if downpayment was changed and needs to be updated
    const oldDownpayment = client.downPayment;
    const newDownpayment = data.downPayment;
    
    if (newDownpayment !== oldDownpayment) {
      // If this is a new downpayment (no payments existed before)
      if (client.payments.length === 0 && newDownpayment > 0) {
        updatedPayments.push({
          id: uuidv4(),
          amount: newDownpayment,
          date: new Date(),
          notes: "Entrada inicial"
        });
      }
      // If existing downpayment exists, update the first payment
      else if (client.payments.length > 0 && oldDownpayment > 0) {
        // Find the earliest payment (which should be the downpayment)
        const earliestPaymentIndex = client.payments
          .map((p, index) => ({ date: p.date, index }))
          .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.index;
        
        if (earliestPaymentIndex !== undefined) {
          // If new downpayment is 0, remove the payment
          if (newDownpayment === 0) {
            updatedPayments.splice(earliestPaymentIndex, 1);
          } else {
            // Otherwise update the amount
            updatedPayments[earliestPaymentIndex] = {
              ...updatedPayments[earliestPaymentIndex],
              amount: newDownpayment
            };
          }
        }
      }
    }
    
    // Create updated client
    const updatedClient = {
      ...client,
      ...data,
      payments: updatedPayments,
      updatedAt: new Date(),
    };
    
    // Find and update the client in the array
    const clientIndex = clients.findIndex(c => c.id === id);
    if (clientIndex !== -1) {
      clients[clientIndex] = updatedClient;
    }
    
    toast.success("Cliente atualizado com sucesso!");
    navigate(`/clients/${client.id}`);
  };

  if (!client) return null;

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to={`/clients/${id}`}
            className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para o Cliente
          </Link>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
        </div>
        
        <ClientForm client={client} onSubmit={handleUpdateClient} />
      </div>
    </Layout>
  );
}
