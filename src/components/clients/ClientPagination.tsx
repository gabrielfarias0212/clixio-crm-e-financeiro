
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClientPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function ClientPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onNextPage,
  onPrevPage
}: ClientPaginationProps) {
  // Gerar números de página visíveis (máximo 5)
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-gray-500">
        Mostrando {startIndex} a {endIndex} de {totalItems} clientes
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          className="p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getVisiblePages().map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className="min-w-[40px]"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
