
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ChartColumnStacked } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { EventCategory } from "@/utils/types";

// Color palette for different event categories
const EVENT_COLORS = {
  "Casamento": "#8884d8",
  "Aniversario": "#82ca9d",
  "Civil": "#ffc658",
  "Ensaio Estudio": "#ff8042",
  "Ensaio externo": "#0088fe",
  "Evento Corporativo": "#00C49F",
};

// Configuration for the chart
const chartConfig = {
  "Casamento": { color: "#8884d8" },
  "Aniversario": { color: "#82ca9d" },
  "Civil": { color: "#ffc658" },
  "Ensaio Estudio": { color: "#ff8042" },
  "Ensaio externo": { color: "#0088fe" },
  "Evento Corporativo": { color: "#00C49F" },
};

export function EventCategoryChart() {
  const { clients } = useClients();
  const [monthsToShow, setMonthsToShow] = useState(6);
  
  const chartData = useMemo(() => {
    const now = new Date();
    const uniqueCategories = new Set<EventCategory>();
    
    // Get all unique event categories to build our chart
    clients.forEach(client => {
      if (client.eventCategory) {
        uniqueCategories.add(client.eventCategory);
      }
    });
    
    // Create data points for each month with counts by category
    const data = Array.from({ length: monthsToShow }).map((_, i) => {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthName = format(date, "MMM");
      
      // Basic data point with month name
      const dataPoint = {
        month: monthName,
        total: 0, // Track total for each month
      } as Record<string, any>;
      
      // Count closed contracts by category for this month
      uniqueCategories.forEach(category => {
        const count = clients.filter(client => {
          const createdAt = new Date(client.createdAt);
          return createdAt >= monthStart && 
                 createdAt <= monthEnd && 
                 client.status === "fechado" && 
                 client.eventCategory === category;
        }).length;
        
        dataPoint[category] = count;
        dataPoint.total += count;
      });
      
      return dataPoint;
    }).reverse(); // Show oldest to newest left to right
    
    return {
      data,
      categories: Array.from(uniqueCategories)
    };
  }, [clients, monthsToShow]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Contratos por Categoria de Evento</CardTitle>
          <div className="space-x-2">
            <select 
              value={monthsToShow}
              onChange={(e) => setMonthsToShow(Number(e.target.value))}
              className="bg-background border border-input rounded-md px-2 py-1 text-sm"
            >
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] mt-2">
          <ChartContainer 
            config={chartConfig}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          className="bg-white p-2 border border-gray-200 shadow-md"
                        >
                          <p className="font-medium">{label}</p>
                          <div className="mt-2 space-y-1">
                            {payload
                              .filter((item) => item.name !== "total" && item.value !== undefined && Number(item.value) > 0)
                              .map((item) => (
                                <div key={item.name} className="flex items-center justify-between gap-2">
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm">{item.name}</span>
                                  </div>
                                  <span className="font-medium">{item.value}</span>
                                </div>
                              ))
                            }
                          </div>
                        </ChartTooltipContent>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {chartData.categories.map((category) => (
                  <Bar 
                    key={category} 
                    dataKey={category} 
                    stackId="a"
                    fill={EVENT_COLORS[category] || "#000000"}
                    name={category}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        {chartData.data.every(item => item.total === 0) && (
          <p className="text-center text-muted-foreground mt-4">
            Nenhum contrato fechado no período selecionado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
