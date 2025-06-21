
import React, { Suspense, memo } from "react";
import { TransactionCategoryCharts } from "@/components/TransactionCategoryCharts";
import { Transaction } from "@/utils/types";
import { PeriodType, WeekInfo } from "@/hooks/useWeeklyFilter";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyTransactionChartsProps {
  transactions: Transaction[];
  periodType: PeriodType;
  currentWeek: WeekInfo;
}

// Skeleton para os gráficos
const ChartsLoadingSkeleton = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  </div>
));

ChartsLoadingSkeleton.displayName = 'ChartsLoadingSkeleton';

// Wrapper lazy para os gráficos
const LazyTransactionCharts = memo(({ 
  transactions, 
  periodType, 
  currentWeek 
}: LazyTransactionChartsProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Análise por Categorias</h2>
      <Suspense fallback={<ChartsLoadingSkeleton />}>
        <TransactionCategoryCharts 
          transactions={transactions}
          periodType={periodType}
          currentWeek={currentWeek}
        />
      </Suspense>
    </div>
  );
});

LazyTransactionCharts.displayName = 'LazyTransactionCharts';

export { LazyTransactionCharts };
