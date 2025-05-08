
import { ReactNode } from "react";

interface MetricsCardProps {
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  valueColor?: string;
  chart?: ReactNode;
  subtext?: string;
  onClick: () => void;
}

export function MetricsCard({
  icon,
  iconColor,
  iconBgColor,
  title,
  value,
  valueColor = "text-gray-800 dark:text-gray-200",
  chart,
  subtext,
  onClick
}: MetricsCardProps) {
  return (
    <div 
      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md cursor-pointer group"
      onClick={onClick}
    >
      <div className="px-5 py-5">
        <div className="flex items-center mb-4">
          <div className={`rounded-full ${iconBgColor} p-2.5 mr-3`}>
            <div className={`h-5 w-5 ${iconColor}`}>{icon}</div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        </div>
        <div className="pl-2">
          <p className={`text-3xl font-bold ${valueColor}`}>
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {subtext}
            </p>
          )}
          {chart && (
            <div className="h-12 mt-2">
              {chart}
            </div>
          )}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${iconColor.replace('text-', 'bg-')} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
      </div>
    </div>
  );
}
