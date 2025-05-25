
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface MonthlyGoalProgressProps {
  progress: number;
}

export function MonthlyGoalProgress({ progress }: MonthlyGoalProgressProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Meta Mensal</p>
              <p className={`text-2xl font-bold ${getProgressColor(progress)}`}>
                {Math.min(progress, 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {progress > 100 ? '🎉 Meta superada!' : 'Progresso da meta'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={Math.min(progress, 100)} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        
        {progress > 100 && (
          <div className="mt-2 text-center">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              +{(progress - 100).toFixed(1)}% acima da meta
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
