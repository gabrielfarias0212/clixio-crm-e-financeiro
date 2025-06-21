
import React, { memo, Suspense } from "react";
import { TransactionSummary } from "@/components/TransactionSummary";
import { Transaction } from "@/utils/types";
import { PeriodType, WeekInfo } from "@/hooks/useWeeklyFilter";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedFinancialSummaryProps {
  transactions: Transaction[];
  className?: string;
  periodType: PeriodType;
  currentWeek: WeekInfo;
  onWeeklyBalanceChange: (balance: number) => void;
}

// Skeleton para o resumo financeiro
const SummaryLoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-lg border">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-32" />
    </div>
  </div>
));

SummaryLoadingSkeleton.displayName = 'SummaryLoadingSkeleton';

// Componente otimizado para o resumo financeiro
const OptimizedFinancialSummary = memo(({ 
  transactions, 
  className, 
  periodType, 
  currentWeek, 
  onWeeklyBalanceChange 
}: OptimizedFinancialSummaryProps) => {
  return (
    <Suspense fallback={<SummaryLoadingSkeleton />}>
      <TransactionSummary 
        transactions={transactions} 
        className={className}
        periodType={periodType}
        currentWeek={currentWeek}
        onWeeklyBalanceChange={onWeeklyBalanceChange}
      />
    </Suspense>
  );
});

OptimizedFinancialSummary.displayName = 'OptimizedFinancialSummary';

export { OptimizedFinancialSummary };
