
import React, { memo, useCallback, useMemo } from 'react';
import { useForm, FieldValues, Path, UseFormProps, DefaultValues } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface OptimizedFormProps<T extends FieldValues> {
  onSubmit: (data: T) => Promise<void> | void;
  defaultValues?: DefaultValues<T>;
  validationSchema?: any;
  children: (form: ReturnType<typeof useForm<T>>) => React.ReactNode;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
  resetOnSubmit?: boolean;
}

function OptimizedFormComponent<T extends FieldValues>({
  onSubmit,
  defaultValues,
  validationSchema,
  children,
  submitLabel = "Salvar",
  isLoading = false,
  className,
  resetOnSubmit = false
}: OptimizedFormProps<T>) {
  // Configurar o formulário com memoização
  const formConfig: UseFormProps<T> = useMemo(() => ({
    defaultValues,
    resolver: validationSchema,
    mode: 'onChange' as const
  }), [defaultValues, validationSchema]);

  const form = useForm<T>(formConfig);

  // Memoizar o handler de submit
  const handleSubmit = useCallback(async (data: T) => {
    try {
      await onSubmit(data);
      if (resetOnSubmit) {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [onSubmit, resetOnSubmit, form]);

  // Memoizar o estado de submissão
  const canSubmit = useMemo(() => {
    return form.formState.isValid && !isLoading;
  }, [form.formState.isValid, isLoading]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        {children(form)}
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Memoizar o componente principal
const OptimizedForm = memo(OptimizedFormComponent) as <T extends FieldValues>(
  props: OptimizedFormProps<T>
) => React.ReactElement;

export { OptimizedForm };
