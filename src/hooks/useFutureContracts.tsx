
import { useMemo } from 'react';
import { useClients } from '@/contexts/ClientsContext';

export interface ContractsByYear {
  year: number;
  contracts: any[];
  totalValue: number;
  count: number;
  statusBreakdown: Record<string, number>;
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
    projections
  };
}
