import { ProLaboreSection } from "./ProLaboreSection";
import { ProLaboreHistorySection } from "./ProLaboreHistorySection";
import { FutureProjections } from "../FutureProjections";
import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { CashFlowForecast } from "./CashFlowForecast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, TrendingUp, Wallet, Target, CalendarRange } from "lucide-react";

export function ProjectionsSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current" className="gap-1.5 text-xs sm:text-sm">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Mês Atual</span>
            <span className="sm:hidden">Atual</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
            <span className="sm:hidden">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="projections" className="gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Projeções</span>
            <span className="sm:hidden">Proj.</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-1.5 text-xs sm:text-sm">
            <CalendarRange className="h-4 w-4" />
            <span className="hidden sm:inline">Fluxo Futuro</span>
            <span className="sm:hidden">Fluxo</span>
          </TabsTrigger>
          <TabsTrigger value="breakeven" className="gap-1.5 text-xs sm:text-sm">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Equilíbrio</span>
            <span className="sm:hidden">Equil.</span>
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

        <TabsContent value="cashflow">
          <CashFlowForecast />
        </TabsContent>

        <TabsContent value="breakeven">
          <BreakEvenAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
