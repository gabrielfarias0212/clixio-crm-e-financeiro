
import { useState } from 'react';
import { Plus, FileText, Template, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useContractTemplates, useGeneratedContracts } from '@/hooks/useContracts';
import { ContractTemplateList } from '@/components/contracts/ContractTemplateList';
import { GeneratedContractList } from '@/components/contracts/GeneratedContractList';
import { CreateTemplateDialog } from '@/components/contracts/CreateTemplateDialog';
import { ClauseLibrary } from '@/components/contracts/ClauseLibrary';

export default function Contracts() {
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [clauseLibraryOpen, setClauseLibraryOpen] = useState(false);
  
  const { data: templates, isLoading: templatesLoading } = useContractTemplates();
  const { data: contracts, isLoading: contractsLoading } = useGeneratedContracts();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerador de Contratos</h1>
          <p className="text-gray-600 mt-2">
            Crie e gerencie contratos personalizados para seus eventos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={clauseLibraryOpen} onOpenChange={setClauseLibraryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Template className="w-4 h-4 mr-2" />
                Biblioteca de Cláusulas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Biblioteca de Cláusulas</DialogTitle>
              </DialogHeader>
              <ClauseLibrary />
            </DialogContent>
          </Dialog>

          <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
              </DialogHeader>
              <CreateTemplateDialog onClose={() => setCreateTemplateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Template className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Contratos Gerados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Contrato</CardTitle>
              <CardDescription>
                Gerencie seus templates personalizados para diferentes tipos de evento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContractTemplateList 
                templates={templates || []}
                loading={templatesLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contratos Gerados</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os contratos já criados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneratedContractList 
                contracts={contracts || []}
                loading={contractsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
