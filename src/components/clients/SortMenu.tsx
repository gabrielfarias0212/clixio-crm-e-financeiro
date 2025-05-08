
import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ClientSortOption, SortDirection } from '@/utils/supabase/client-fetch';
import { 
  ArrowDownAZ, 
  ArrowUpAZ, 
  CalendarIcon, 
  ChevronDown,
  CalendarArrowUp,
  CalendarArrowDown
} from 'lucide-react';

interface SortMenuProps {
  sortBy: ClientSortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: ClientSortOption, direction: SortDirection) => void;
}

export function SortMenu({ sortBy, sortDirection, onSortChange }: SortMenuProps) {
  // Helper to generate a display label for the current sort
  const getSortLabel = () => {
    switch (sortBy) {
      case 'name':
        return sortDirection === 'asc' ? 'Nome (A-Z)' : 'Nome (Z-A)';
      case 'created_at':
        return sortDirection === 'desc' ? 'Mais recentes' : 'Mais antigos';
      case 'wedding_date':
        return sortDirection === 'asc' ? 'Eventos mais próximos' : 'Eventos mais distantes';
      default:
        return 'Ordenar por';
    }
  };

  // Helper to get the icon for current sort
  const getSortIcon = () => {
    switch (sortBy) {
      case 'name':
        return sortDirection === 'asc' ? <ArrowDownAZ className="h-4 w-4 mr-2" /> : <ArrowUpAZ className="h-4 w-4 mr-2" />;
      case 'created_at':
        return sortDirection === 'desc' ? <CalendarArrowDown className="h-4 w-4 mr-2" /> : <CalendarArrowUp className="h-4 w-4 mr-2" />;
      case 'wedding_date':
        return sortDirection === 'asc' ? <CalendarArrowDown className="h-4 w-4 mr-2" /> : <CalendarArrowUp className="h-4 w-4 mr-2" />;
      default:
        return <ChevronDown className="h-4 w-4 ml-2" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[160px] flex items-center justify-between">
          <span className="flex items-center">
            {getSortIcon()}
            {getSortLabel()}
          </span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onSortChange('name', 'asc')}
          className="flex items-center cursor-pointer"
        >
          <ArrowDownAZ className="h-4 w-4 mr-2" /> Nome (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange('name', 'desc')}
          className="flex items-center cursor-pointer"
        >
          <ArrowUpAZ className="h-4 w-4 mr-2" /> Nome (Z-A)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onSortChange('created_at', 'desc')}
          className="flex items-center cursor-pointer"
        >
          <CalendarArrowDown className="h-4 w-4 mr-2" /> Mais recentes primeiro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange('created_at', 'asc')}
          className="flex items-center cursor-pointer"
        >
          <CalendarArrowUp className="h-4 w-4 mr-2" /> Mais antigos primeiro
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onSortChange('wedding_date', 'asc')}
          className="flex items-center cursor-pointer"
        >
          <CalendarIcon className="h-4 w-4 mr-2" /> Data de evento (próximos)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange('wedding_date', 'desc')}
          className="flex items-center cursor-pointer"
        >
          <CalendarIcon className="h-4 w-4 mr-2" /> Data de evento (distantes)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
