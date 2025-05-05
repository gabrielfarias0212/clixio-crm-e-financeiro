
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { BulkClientImporter } from "@/components/BulkClientImporter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/contexts/ClientsContext";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export default function ImportClients() {
  const navigate = useNavigate();
  const { refreshClients } = useClients();
  const [isImportComplete, setIsImportComplete] = useState(false);
  
  useEffect(() => {
    document.title = "Importar Clientes | Wedding CRM";
  }, []);
  
  const handleImportComplete = async () => {
    await refreshClients();
    setIsImportComplete(true);
  };
  
  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/clients"
            className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Clientes
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Importar Clientes</h1>
          </div>
        </div>
        
        {isImportComplete ? (
          <Card>
            <CardHeader>
              <CardTitle>Importação Concluída</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Os clientes foram importados com sucesso para o sistema!
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-3">
                <Button onClick={() => navigate("/clients")}>
                  Ver Lista de Clientes
                </Button>
                <Button variant="outline" onClick={() => setIsImportComplete(false)}>
                  Importar Mais Clientes
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Importar Clientes de Planilha</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkClientImporter onComplete={handleImportComplete} />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
