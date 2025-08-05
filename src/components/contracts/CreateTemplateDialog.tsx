
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateContractTemplate } from '@/hooks/useContracts';
import { useNavigate } from 'react-router-dom';

interface CreateTemplateDialogProps {
  onClose: () => void;
}

interface FormData {
  name: string;
  description: string;
  category: string;
}

export function CreateTemplateDialog({ onClose }: CreateTemplateDialogProps) {
  const navigate = useNavigate();
  const createTemplate = useCreateContractTemplate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const template = await createTemplate.mutateAsync({
        name: data.name,
        description: data.description,
        category: data.category,
        content: '',
        is_default: false,
        clauses_order: [],
        user_id: '', // Will be set by RLS
      });
      
      onClose();
      navigate(`/contracts/template/${template.id}`);
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Template *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Ex: Contrato de Casamento"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select onValueChange={(value) => setValue('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wedding">Casamento</SelectItem>
            <SelectItem value="pre_wedding">Pré-Wedding</SelectItem>
            <SelectItem value="event">Eventos</SelectItem>
            <SelectItem value="portrait">Ensaio</SelectItem>
            <SelectItem value="corporate">Corporativo</SelectItem>
            <SelectItem value="other">Outros</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Breve descrição do template..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Template'}
        </Button>
      </div>
    </form>
  );
}
