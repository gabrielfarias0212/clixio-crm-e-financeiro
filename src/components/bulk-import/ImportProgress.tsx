
interface ImportProgressProps {
  current: number;
  total: number;
  isVisible: boolean;
}

export function ImportProgress({ current, total, isVisible }: ImportProgressProps) {
  if (!isVisible) return null;
  
  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${(current / total) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500">
        Importando {current} de {total} clientes...
      </p>
    </div>
  );
}
