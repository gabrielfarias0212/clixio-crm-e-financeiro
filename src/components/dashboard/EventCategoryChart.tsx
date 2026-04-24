import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { subMonths } from "date-fns";
import { CircleDot, ChevronDown } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, Sector
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { EventCategory } from "@/utils/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EVENT_COLORS: Record<string, string> = {
  "Casamento":          "#a8a29e",
  "Aniversario":        "#78716c",
  "Civil":              "#d6d3d1",
  "Ensaio Estudio":     "#57534e",
  "Ensaio externo":     "#c4b5ad",
  "Evento Corporativo": "#44403c",
  "15 anos":            "#e7e5e4",
};

const chartConfig = Object.fromEntries(
  Object.entries(EVENT_COLORS).map(([k, v]) => [k, { color: v }])
);

type TimeRangeOption = "all" | "3" | "6" | "12";

const timeRangeOptions = [
  { value: "all", label: "Todos" },
  { value: "3",   label: "Últimos 3 meses" },
  { value: "6",   label: "Últimos 6 meses" },
  { value: "12",  label: "Último ano" },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#1c1917" fontSize={11} fontWeight={500}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#1c1917" fontSize={16} fontWeight={600}
        fontFamily="monospace">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

export function EventCategoryChart() {
  const { clients } = useClients();
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("all");
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartData = useMemo(() => {
    const now = new Date();
    const categoryCount: Record<string, number> = {};

    const filtered = clients.filter(client => {
      if (client.status !== "fechado") return false;
      if (timeRange === "all") return true;
      const createdAt = new Date(client.createdAt);
      return createdAt >= subMonths(now, parseInt(timeRange));
    });

    filtered.forEach(client => {
      if (client.eventCategory) {
        categoryCount[client.eventCategory] = (categoryCount[client.eventCategory] || 0) + 1;
      }
    });

    const total = Object.values(categoryCount).reduce((s, n) => s + n, 0);
    return Object.entries(categoryCount).map(([name, value]) => ({
      name, value,
      percent: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
    }));
  }, [clients, timeRange]);

  const selectedLabel = timeRangeOptions.find(o => o.value === timeRange)?.label ?? "Filtrar";

  return (
    <Card className="rounded-xl border-stone-200 shadow-sm overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400">
            Contratos por Categoria
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-stone-50">
                {selectedLabel}
                <ChevronDown size={11} strokeWidth={1.5} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1 rounded-xl border-stone-200 shadow-md">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as TimeRangeOption)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[12px] rounded-lg transition-colors",
                    timeRange === option.value
                      ? "bg-stone-100 text-stone-900 font-medium"
                      : "text-stone-500 hover:bg-stone-50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="h-[220px]">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    outerRadius={90} innerRadius={52}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, i) => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={EVENT_COLORS[entry.name] ?? "#e7e5e4"}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div className="px-3 py-2 bg-white border border-stone-200 rounded-lg shadow-md text-[11px]">
                            <p className="font-medium text-stone-800 mb-1">{d.name}</p>
                            <p className="text-stone-500">{d.value} contrato{d.value !== 1 ? "s" : ""} · {d.percent}%</p>
                          </div>
                        </ChartTooltipContent>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <CircleDot size={28} strokeWidth={1} className="text-stone-300 mb-2" />
              <p className="text-[11px] text-stone-400 text-center">
                {timeRange === "all"
                  ? "Nenhum contrato fechado até o momento"
                  : "Nenhum contrato fechado no período"}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(EVENT_COLORS).map(([category, color]) => {
              const item = chartData.find(d => d.name === category);
              return (
                <div key={category} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0">
                    <span className="text-[11px] text-stone-600 truncate block">{category}</span>
                    {item && (
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.value} · {item.percent}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
