import { ProLaboreSection } from "./ProLaboreSection";
import { ProLaboreHistorySection } from "./ProLaboreHistorySection";
import { FutureProjections } from "../FutureProjections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, TrendingUp, Wallet } from "lucide-react";

export function ProjectionsSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="gap-2">
            <Wallet className="h-4 w-4" />
            Mês Atual
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="projections" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Projeções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <ProLaboreSection />
        </TabsContent>

        <TabsContent value="history">
          <ProLaboreHistorySection />
        </TabsContent>

        <TabsContent value="projections">
          <FutureProjections />
        </TabsContent>
      </Tabs>
    </div>
  );
}
