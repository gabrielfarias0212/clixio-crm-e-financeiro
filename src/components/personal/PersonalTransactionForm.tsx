
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalTransactionFormProps {
  type: 'entry' | 'expense';
  show: boolean;
  amount: string;
  description: string;
  category: string;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const INCOME_CATEGORIES = [
  'salário',
  'freelance',
  'vendas',
  'investimentos',
  'pró-labore',
  'outros'
];

const EXPENSE_CATEGORIES = [
  'alimentação',
  'transporte',
  'moradia',
  'saúde',
  'educação',
  'lazer',
  'compras',
  'outros'
];

export function PersonalTransactionForm({
  type,
  show,
  amount,
  description,
  category,
  onAmountChange,
  onDescriptionChange,
  onCategoryChange,
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
  const categories = isEntry ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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
          <Label htmlFor={`${type}Category`}>Categoria</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
