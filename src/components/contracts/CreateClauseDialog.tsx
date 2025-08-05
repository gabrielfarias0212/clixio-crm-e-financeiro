
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useCreateContractClause, useUpdateContractClause } from '@/hooks/useContracts';
import { ContractClause } from '@/types/contract';

interface CreateClauseDialogProps {
  clause?: ContractClause;
  onClose: () => void;
}

interface FormData {
  title: string;
  content: string;
  category: string;
  is_required: boolean;
}

export function CreateClauseDialog({ clause, onClose }: CreateClauseDialogProps) {
  const [variables, setVariables] = useState<string[]>(clause?.variables || []);
  const [newVariable, setNewVariable] = useState('');

  const createClause = useCreateContractClause();
  const updateClause = useUpdateContractClause();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: clause?.title || '',
      content: clause?.content || '',
      category: clause?.category || 'general',
      is_required: clause?.is_required || false,
    }
  });

  const isEditing = !!clause;

  const extractVariablesFromContent = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }
    return [...new Set(matches)];
  };

  const handleContentChange = (content: string) => {
    const extractedVars = extractVariablesFromContent(content);
    setVariables(extractedVars);
  };

  const addVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable.trim())) {
      setVariables([...variables, newVariable.trim()]);
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const clauseData = {
        title: data.title,
        content: data.content,
        category: data.category,
        variables,
        is_required: data.is_required,
        is_default: false,
        user_id: '', // Will be set by RLS
      };

      if (isEditing) {
        await updateClause.mutateAsync({
          id: clause.id,
          updates: clauseData,
        });
      } else {
        await createClause.mutateAsync(clauseData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving clause:', error);
    }
  };

  const categories = [
    { value: 'identification', label: 'Identificação das Partes' },
    { value: 'service_object', label: 'Objeto do Serviço' },
    { value: 'payment', label: 'Pagamento' },
    { value: 'contractor_obligations', label: 'Obrigações do Contratado' },
    { value: 'client_obligations', label: 'Obrigações do Contratante' },
    { value: 'terms', label: 'Termos e Condições' },
    { value: 'cancellation', label: 'Cancelamento' },
    { value: 'general', label: 'Geral' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título da Cláusula *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Título é obrigatório' })}
          placeholder="Ex: Identificação das Partes"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select 
          defaultValue={clause?.category || 'general'}
          onValueChange={(value) => setValue('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo da Cláusula *</Label>
        <Textarea
          id="content"
          {...register('content', { 
            required: 'Conteúdo é obrigatório',
            onChange: (e) => handleContentChange(e.target.value)
          })}
          placeholder="Digite o conteúdo da cláusula. Use {{nome_variavel}} para campos dinâmicos..."
          rows={8}
          className="font-mono text-sm"
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Dica: Use duas chaves para campos que serão preenchidos dinamicamente, como: nome_da_variavel
        </p>
      </div>

      <div className="space-y-3">
        <Label>Variáveis Detectadas</Label>
        {variables.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                {variable}
                <button
                  type="button"
                  onClick={() => removeVariable(variable)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma variável detectada</p>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar variável manualmente"
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
          />
          <Button type="button" onClick={addVariable} variant="outline">
            Adicionar
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is_required"
          {...register('is_required')}
        />
        <Label htmlFor="is_required">Cláusula obrigatória</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Atualizar' : 'Criar'} Cláusula
        </Button>
      </div>
    </form>
  );
}
