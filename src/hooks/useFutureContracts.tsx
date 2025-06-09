
import { useMemo } from 'react';
import { useClients } from '@/contexts/ClientsContext';
import { Client } from '@/utils/types';

export interface ContractsByYear {
  year: number;
  contracts: Client[];
  totalValue: number;
  count: number;
  statusBreakdown: Record<string, number>;
}

export interface EventsByMonth {
  month: string;
  year: number;
  events: Client[];
  count: number;
  totalValue: number;
}

export function useFutureContracts() {
  const { clients } = useClients();

  const futureContracts = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const futureClients = clients.filter(client => {
      if (!client.weddingDate) return false;
      const weddingYear = new Date(client.weddingDate).getFullYear();
      return weddingYear >= currentYear;
    });

    return futureClients;
  }, [clients]);

  const contractsByYear = useMemo(() => {
    const yearMap = new Map<number, ContractsByYear>();
    
    futureContracts.forEach(client => {
      if (!client.weddingDate) return;
      
      const year = new Date(client.weddingDate).getFullYear();
      
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          contracts: [],
          totalValue: 0,
          count: 0,
          statusBreakdown: {}
        });
      }
      
      const yearData = yearMap.get(year)!;
      yearData.contracts.push(client);
      yearData.totalValue += client.contractValue;
      yearData.count += 1;
      
      const status = client.status;
      yearData.statusBreakdown[status] = (yearData.statusBreakdown[status] || 0) + 1;
    });

    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, [futureContracts]);

  const eventsByMonth = useMemo(() => {
    const monthMap = new Map<string, EventsByMonth>();
    
    futureContracts.forEach(client => {
      if (!client.weddingDate) return;
      
      const date = new Date(client.weddingDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthName,
          year,
          events: [],
          count: 0,
          totalValue: 0
        });
      }
      
      const monthData = monthMap.get(monthKey)!;
      monthData.events.push(client);
      monthData.count += 1;
      monthData.totalValue += client.contractValue;
    });

    return Array.from(monthMap.values()).sort((a, b) => {
      const aDate = new Date(a.year, parseInt(a.month.split(' ')[0]) - 1);
      const bDate = new Date(b.year, parseInt(b.month.split(' ')[0]) - 1);
      return aDate.getTime() - bDate.getTime();
    });
  }, [futureContracts]);

  const projections = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    const nextYearContracts = contractsByYear.find(c => c.year === nextYear);
    const totalActiveContracts = futureContracts.length;
    const guaranteedRevenue = futureContracts
      .filter(c => c.status === 'fechado' || c.status === 'pago')
      .reduce((sum, c) => sum + c.contractValue, 0);
    
    const totalProjectedRevenue = futureContracts.reduce((sum, c) => sum + c.contractValue, 0);

    return {
      totalActiveContracts,
      nextYearContracts: nextYearContracts?.count || 0,
      nextYearRevenue: nextYearContracts?.totalValue || 0,
      guaranteedRevenue,
      totalProjectedRevenue
    };
  }, [contractsByYear, futureContracts]);

  return {
    futureContracts,
    contractsByYear,
    eventsByMonth,
    projections
  };
}
