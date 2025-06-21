
import React, { memo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface OptimizedLoadingStateProps {
  variant?: 'skeleton' | 'spinner' | 'card' | 'table' | 'list';
  count?: number;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Componente de skeleton para cards
const CardSkeleton = memo(() => (
  <Card className="overflow-hidden">
    <CardHeader className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
));

CardSkeleton.displayName = 'CardSkeleton';

// Componente de skeleton para lista
const ListSkeleton = memo(() => (
  <div className="space-y-2">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  </div>
));

ListSkeleton.displayName = 'ListSkeleton';

// Componente de skeleton para tabela
const TableSkeleton = memo(({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex space-x-4 p-4 border-b">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-20" />
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

const OptimizedLoadingState = memo(({
  variant = 'skeleton',
  count = 3,
  message = 'Carregando...',
  size = 'md',
  className
}: OptimizedLoadingStateProps) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center p-8 ${className || ''}`}>
        <div className="flex items-center gap-2">
          <Loader2 className={`animate-spin ${spinnerSizes[size]}`} />
          <span className={sizeClasses[size]}>{message}</span>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`border rounded-md ${className || ''}`}>
        <TableSkeleton rows={count} />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        {Array.from({ length: count }).map((_, i) => (
          <ListSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Default skeleton variant
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
});

OptimizedLoadingState.displayName = 'OptimizedLoadingState';

export { OptimizedLoadingState };
