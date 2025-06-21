
import { Card, CardContent } from "@/components/ui/card";

interface ClientListSkeletonProps {
  count?: number;
  variant?: 'cards' | 'table';
}

export function ClientListSkeleton({ count = 6, variant = 'cards' }: ClientListSkeletonProps) {
  if (variant === 'table') {
    return (
      <div className="bg-white rounded-md border overflow-hidden">
        <div className="animate-pulse">
          {/* Header */}
          <div className="h-12 bg-gray-100 border-b"></div>
          {/* Rows */}
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-100 flex items-center px-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-6 bg-gray-200 rounded ml-4"></div>
              <div className="w-32 h-4 bg-gray-200 rounded ml-4"></div>
              <div className="w-16 space-x-2 flex ml-4">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded"></div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="w-16 h-5 bg-gray-200 rounded"></div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
