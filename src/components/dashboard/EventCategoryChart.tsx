
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CircleDot, ChevronDown, ChevronUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  Sector
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { EventCategory } from "@/utils/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Updated modern color palette
const EVENT_COLORS = {
  "Casamento": "#8B5CF6",
  "Aniversario": "#10B981",
  "Civil": "#F59E0B",
  "Ensaio Estudio": "#EF4444",
  "Ensaio externo": "#3B82F6",
  "Evento Corporativo": "#EC4899",
};

// Configuration for the chart
const chartConfig = {
  "Casamento": { color: "#8B5CF6" },
  "Aniversario": { color: "#10B981" },
  "Civil": { color: "#F59E0B" },
  "Ensaio Estudio": { color: "#EF4444" },
  "Ensaio externo": { color: "#3B82F6" },
  "Evento Corporativo": { color: "#EC4899" },
};

type TimeRangeOption = "all" | "3" | "6" | "12";

const timeRangeOptions = [
  { value: "all", label: "Todos" },
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Último ano" },
];

// Active shape for the pie chart to show percentage
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value 
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        fill="#333"
        className="text-xs font-medium"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill="#333"
        className="text-lg font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">
            {entry.value} ({entry.payload.percent}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export function EventCategoryChart() {
  const { clients } = useClients();
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("all");
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  
  const chartData = useMemo(() => {
    const now = new Date();
    const categoryCount = {} as Record<string, number>;
    
    // Filter clients based on selected time range
    const filteredClients = clients.filter(client => {
      if (timeRange === "all") return true;
      
      const createdAt = new Date(client.createdAt);
      const monthsAgo = parseInt(timeRange);
      const cutoffDate = subMonths(now, monthsAgo);
      
      return createdAt >= cutoffDate && client.status === "fechado (aguardando assinatura)";
    });
    
    // Count clients by event category
    filteredClients.forEach(client => {
      if (client.eventCategory && client.status === "fechado (aguardando assinatura)") {
        const category = client.eventCategory;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
    
    // Calculate total for percentages
    const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
    
    // Transform the data for the pie chart
    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? `${((value / total) * 100).toFixed(1)}` : "0"
    }));
  }, [clients, timeRange]);

  // Calculate total events
  const totalEvents = chartData.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <Card className="overflow-hidden shadow-md border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg font-semibold">
            Distribuição de Contratos por Categoria
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-9 border-gray-200 dark:border-gray-700"
              >
                {timeRangeOptions.find(option => option.value === timeRange)?.label || "Filtrar"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <div className="rounded-md border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                      timeRange === option.value ? "font-medium bg-gray-50 dark:bg-gray-900" : ""
                    )}
                    onClick={() => setTimeRange(option.value as TimeRangeOption)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[340px] mt-2">
          {chartData.length > 0 ? (
            <ChartContainer 
              config={chartConfig}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    outerRadius={130}
                    innerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={EVENT_COLORS[entry.name as EventCategory] || "#000000"}
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Legend 
                    content={<CustomLegend />} 
                    verticalAlign="bottom" 
                    align="center"
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percentage = ((data.value / totalEvents) * 100).toFixed(1);
                        
                        return (
                          <ChartTooltipContent>
                            <div className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                              <div className="text-sm font-medium">{data.name}</div>
                              <div className="text-xs mt-1 space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-500">Quantidade:</span>
                                  <span className="font-medium">{data.value}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-500">Porcentagem:</span>
                                  <span className="font-medium">{percentage}%</span>
                                </div>
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
