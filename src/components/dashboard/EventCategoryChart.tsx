
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CircleDot } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
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
  const [timeRange, setTimeRange] = useState("all");
  
  const chartData = useMemo(() => {
    const now = new Date();
    const categoryCount = {} as Record<string, number>;
    
    // Filter clients based on selected time range
    const filteredClients = clients.filter(client => {
      if (timeRange === "all") return true;
      
      const createdAt = new Date(client.createdAt);
      const monthsAgo = parseInt(timeRange);
      const cutoffDate = subMonths(now, monthsAgo);
      
      return createdAt >= cutoffDate && client.status === "fechado";
    });
    
    // Count clients by event category
    filteredClients.forEach(client => {
      if (client.eventCategory && client.status === "fechado") {
        const category = client.eventCategory;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
    
    // Transform the data for the pie chart
    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }));
  }, [clients, timeRange]);

  // Calculate total events
  const totalEvents = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Distribuição de Contratos por Categoria</CardTitle>
          <div className="space-x-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-background border border-input rounded-md px-2 py-1 text-sm"
            >
              <option value="all">Todos</option>
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
              <option value="12">Último ano</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-2">
          {chartData.length > 0 ? (
            <ChartContainer 
              config={chartConfig}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={EVENT_COLORS[entry.name as EventCategory] || "#000000"} 
                      />
                    ))}
                  </Pie>
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percentage = ((data.value / totalEvents) * 100).toFixed(1);
                        
                        return (
                          <ChartTooltipContent>
                            <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
                              <div className="font-medium">{data.name}</div>
                              <div className="flex justify-between gap-2 text-sm">
                                <span className="text-muted-foreground">Quantidade:</span>
                                <span className="font-medium">{data.value}</span>
                              </div>
                              <div className="flex justify-between gap-2 text-sm">
                                <span className="text-muted-foreground">Porcentagem:</span>
                                <span className="font-medium">{percentage}%</span>
                              </div>
                            </div>
                          </ChartTooltipContent>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <CircleDot className="h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="text-center text-muted-foreground">
                {timeRange === "all" ? 
                  "Nenhum contrato fechado até o momento" : 
                  "Nenhum contrato fechado no período selecionado"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
