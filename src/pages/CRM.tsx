import React, { useState, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { CRMHeader } from "@/components/crm/CRMHeader";
import { LeadOrigins } from "@/components/crm/LeadOrigins";
import { LeadsVsContractsChart } from "@/components/crm/LeadsVsContractsChart";
import { CRMKanban } from "@/components/crm/CRMKanban";
import { FollowUpBanner } from "@/components/crm/FollowUpBanner";
import { QuickLeadForm } from "@/components/client-form/QuickLeadForm";
import { Button } from "@/components/ui/button";
import { Plus, X, Filter, Search } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { QuickLeadValues } from "@/components/client-form/quickLeadTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EventCategory } from "@/utils/types";

export default function CRM() {
  const navigate = useNavigate();
  const { clients, loading, addClient } = useClients();
  const isMobile = useIsMobile();
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    document.title = "CRM | Wedding CRM";
  }, []);

  const handleQuickLead = async (data: QuickLeadValues) => {
    setSubmitting(true);
    try {
      const newClient = await addClient({
        name: data.name,
        coupleName: "",
        email: data.email,
        phone: data.phone,
        weddingDate: data.weddingDate,
        weddingStartTime: "",
        weddingEndTime: "",
        contractValue: 0,
        downPayment: 0,
        status: "primeiro_contato",
        nextAction: "enviar proposta",
        eventCategory: data.eventCategory as EventCategory,
        eventLocation: "",
        preWeddingDate: null,
        preWeddingStartTime: "",
        preWeddingEndTime: "",
        contractLink: "",
        hasPreWedding: false,
        salesFunnelStage: "primeiro_contato",
        notes: data.notes || "",
        leadSource: data.leadSource,
      });
      
      if (newClient) {
        toast.success("Lead adicionado com sucesso!");
        setShowQuickForm(false);
      }
    } catch (error) {
      toast.error("Erro ao adicionar lead.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter clients based on time filter + name search
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    let result = [...clients];

    // Apply year filter
    if (timeFilter !== "all") {
      const filterYear = parseInt(timeFilter);
      result = result.filter(client => {
        if (client.weddingDate) {
          return new Date(client.weddingDate).getFullYear() === filterYear;
        }
        return new Date(client.createdAt || Date.now()).getFullYear() === filterYear;
      });
    }

    // Apply name search
    if (searchName.trim()) {
      const term = searchName.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        (c.coupleName && c.coupleName.toLowerCase().includes(term))
      );
    }

    return result;
  }, [clients, timeFilter, searchName]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8 space-y-6">
        {/* Header with title and add lead button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Link to="/clients/add">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Plus className="h-4 w-4" />
              Adicionar Lead
            </Button>
          </Link>
        </div>

        {/* CRM Stats Header */}
        <CRMHeader clients={filteredClients} />

        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pipeline">Pipeline de Vendas</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4">
            <FollowUpBanner />
            {/* Search bar above Kanban */}
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Pesquisar cliente por nome..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
              {searchName && (
                <button
                  onClick={() => setSearchName("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* Kanban Board */}
            <CRMKanban clients={filteredClients} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Gráfico Leads vs Contratos */}
            <LeadsVsContractsChart clients={filteredClients} />
            
            {/* Lead Origins */}
            <LeadOrigins clients={filteredClients} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}