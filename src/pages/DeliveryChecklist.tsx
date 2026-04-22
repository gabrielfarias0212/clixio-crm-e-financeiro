import { useMemo } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { Package, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

function daysSince(dateStr?: string | null): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function DeliveryChecklist() {
  const { clients, updateClient } = useClients();

  const pending = useMemo(() =>
    clients
      .filter(c => c.linkSent && !c.boxDelivered && c.weddingDate)
      .sort((a, b) => new Date(a.weddingDate!).getTime() - new Date(b.weddingDate!).getTime()),
    [clients]
  );

  const handleDeliver = async (id: string, name: string) => {
    await updateClient(id, {
      boxDelivered: true,
      status: "projeto_finalizado" as any,
    });
    toast.success(`${name} — entrega registrada! ✅`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Package className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Entregas Pendentes
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-9">
          {pending.length === 0
            ? "Tudo entregue 🎉"
            : `${pending.length} pen drive${pending.length > 1 ? "s" : ""} para entregar`}
        </p>
      </div>

      {/* Lista */}
      {pending.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Nenhuma entrega pendente</p>
          <p className="text-gray-400 text-sm mt-1">Você está em dia com todas as entregas!</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {pending.map((client, index) => {
            const days = daysSince(client.weddingDate);
            const isUrgent = days > 90;
            const isWarning = days > 60 && !isUrgent;

            return (
              <div
                key={client.id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${
                  isUrgent
                    ? "border-red-200 shadow-sm shadow-red-50"
                    : isWarning
                    ? "border-orange-200"
                    : "border-gray-200"
                }`}
              >
                {/* Número */}
                <span className={`text-2xl font-bold w-8 text-center shrink-0 ${
                  isUrgent ? "text-red-400" : "text-gray-200"
                }`}>
                  {index + 1}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {client.coupleName || client.name}
                  </p>
                  {client.coupleName && (
                    <p className="text-xs text-gray-400 truncate">{client.name}</p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    {isUrgent ? (
                      <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                    ) : (
                      <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                    )}
                    <span className={`text-xs ${
                      isUrgent ? "text-red-500 font-medium" : "text-gray-400"
                    }`}>
                      {new Date(client.weddingDate!).toLocaleDateString("pt-BR")} · {days} dias atrás
                    </span>
                  </div>
                </div>

                {/* Botão */}
                <button
                  onClick={() => handleDeliver(client.id, client.coupleName || client.name)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 active:scale-95 text-white text-sm font-medium rounded-lg transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Entregue
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
