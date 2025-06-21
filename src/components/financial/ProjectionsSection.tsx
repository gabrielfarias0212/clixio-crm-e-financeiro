
import { FutureProjections } from "@/components/FutureProjections";
import { ProLaboreSection } from "@/components/financial/ProLaboreSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Wallet } from "lucide-react";

export function ProjectionsSection() {
  return (
    <Tabs defaultValue="projections" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="projections" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Projeções Futuras
        </TabsTrigger>
        <TabsTrigger value="prolabore" className="gap-2">
          <Wallet className="h-4 w-4" />
          Pró-Labore
        </TabsTrigger>
      </TabsList>

      <TabsContent value="projections">
        <FutureProjections />
      </TabsContent>

      <TabsContent value="prolabore">
        <ProLaboreSection />
      </TabsContent>
    </Tabs>
  );
}
