
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import { Receipt, TrendingUp } from "lucide-react";

interface PersonalFixedExpensesSummaryProps {
  totalMonthly: number;
  activeCount: number;
  inactiveCount: number;
}

export const PersonalFixedExpensesSummary = ({
  totalMonthly,
  activeCount,
  inactiveCount,
}: PersonalFixedExpensesSummaryProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-900">
          Contas Fixas Mensais
        </CardTitle>
        <Receipt className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalMonthly)}
            </div>
            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Total mensal estimado
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {activeCount} ativas
            </Badge>
            {inactiveCount > 0 && (
              <Badge variant="outline" className="text-gray-600">
                {inactiveCount} inativas
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
