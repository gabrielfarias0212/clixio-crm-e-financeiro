
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { PeriodType, WeekInfo } from "@/hooks/useWeeklyFilter";

interface WeeklyControlsProps {
  periodType: PeriodType;
  currentWeek: WeekInfo;
  onTogglePeriod: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

export function WeeklyControls({
  periodType,
  currentWeek,
  onTogglePeriod,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek
}: WeeklyControlsProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={periodType === "monthly" ? "default" : "outline"}
              onClick={onTogglePeriod}
              size="sm"
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              {periodType === "monthly" ? "Mensal" : "Semanal"}
            </Button>
            
            {periodType === "weekly" && (
              <Button
                variant="ghost"
                onClick={onCurrentWeek}
                size="sm"
                className="gap-2 text-muted-foreground hover:text-primary"
              >
                <TrendingUp className="h-4 w-4" />
                Semana Atual
              </Button>
            )}
          </div>

          {periodType === "weekly" && (
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousWeek}
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="px-3 py-1 bg-muted rounded-md">
                <span className="text-sm font-medium whitespace-nowrap">
                  {currentWeek.label}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onNextWeek}
                className="px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
