
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const EVENT_COLORS = {
  "casamento": "#FEC6A1",
  "casamento civil": "#D3E4FD",
  "aniversário": "#F2FCE2",
  "evento corporativo": "#E5DEFF",
  "ensaio externo": "#D6BCFA",
  "ensaio estudio": "#FFE4E6",
  "ensaio corporativo": "#FFEDD5",
  "outro": "#E2E8F0"
};

export function ContractDistribution() {
  const { clients } = useClients();

  const distribution = clients.reduce((acc, client) => {
    const category = client.eventCategory || "outro";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Tipo de Evento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={EVENT_COLORS[entry.name as keyof typeof EVENT_COLORS] || "#E2E8F0"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
