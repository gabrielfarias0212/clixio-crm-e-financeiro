
import React, { memo, useMemo, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key: string;
  title: string;
  render: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface OptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: keyof T | ((item: T) => string);
  onRowClick?: (item: T, index: number) => void;
  striped?: boolean;
  hover?: boolean;
}

// Skeleton para linhas da tabela
const TableRowSkeleton = memo(({ columnsCount }: { columnsCount: number }) => (
  <TableRow>
    {Array.from({ length: columnsCount }).map((_, i) => (
      <TableCell key={i}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))}
  </TableRow>
));

TableRowSkeleton.displayName = 'TableRowSkeleton';

function OptimizedTableComponent<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "Nenhum item encontrado",
  className,
  rowKey,
  onRowClick,
  striped = true,
  hover = true
}: OptimizedTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Memoizar dados ordenados
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Handler para ordenação
  const handleSort = useCallback((columnKey: string) => {
    setSortConfig(current => {
      if (current?.key === columnKey) {
        return current.direction === 'asc'
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  }, []);

  // Memoizar ícone de ordenação
  const getSortIcon = useCallback((columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  }, [sortConfig]);

  // Gerar key para cada linha
  const getRowKey = useCallback((item: T, index: number) => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    if (rowKey) {
      return String((item as any)[rowKey]);
    }
    return index.toString();
  }, [rowKey]);

  return (
    <div className={`rounded-md border ${className || ''}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                style={{ width: column.width }}
                className={column.className}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.title}
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  column.title
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} columnsCount={columns.length} />
            ))
          ) : sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item, index) => (
              <TableRow
                key={getRowKey(item, index)}
                className={`
                  ${striped && index % 2 === 0 ? 'bg-gray-50/50' : ''}
                  ${hover ? 'hover:bg-gray-100/50' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={column.className}
                  >
                    {column.render(item, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Memoizar o componente principal
const OptimizedTable = memo(OptimizedTableComponent) as <T>(
  props: OptimizedTableProps<T>
) => React.ReactElement;

export { OptimizedTable };
export type { Column };
