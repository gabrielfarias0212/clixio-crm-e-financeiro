
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PersonalTransactionFormProps {
  type: 'entry' | 'expense';
  show: boolean;
  amount: string;
  description: string;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function PersonalTransactionForm({
  type,
  show,
  amount,
  description,
  onAmountChange,
  onDescriptionChange,
  onSubmit,
  onCancel
}: PersonalTransactionFormProps) {
  if (!show) return null;

  const isEntry = type === 'entry';
  const title = isEntry ? 'Nova Entrada' : 'Nova Saída';
  const titleColor = isEntry ? 'text-green-600' : 'text-red-600';
  const buttonText = isEntry ? 'Registrar Entrada' : 'Registrar Saída';
  const buttonVariant = isEntry ? 'default' : 'destructive';
  const buttonClass = isEntry ? 'bg-green-600 hover:bg-green-700' : '';
  const placeholder = isEntry ? 'Descreva a origem da entrada...' : 'Descreva o gasto...';

  return (
    <Card>
      <CardHeader>
        <CardTitle className={titleColor}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${type}Amount`}>Valor</Label>
          <Input
            id={`${type}Amount`}
            type="number"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${type}Description`}>Descrição</Label>
          <Textarea
            id={`${type}Description`}
            placeholder={placeholder}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onSubmit} 
            variant={buttonVariant}
            className={buttonClass}
          >
            {buttonText}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
