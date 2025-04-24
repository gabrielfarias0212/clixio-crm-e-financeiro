
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { FormFields } from "./client-form/FormFields";
import { NotesField } from "./client-form/NotesField";
import { FormActions } from "./client-form/FormActions";
import { formSchema, ClientFormProps, ClientFormValues } from "./client-form/types";

export { type ClientFormValues };

export function ClientForm({ client, onSubmit, isSubmitting = false }: ClientFormProps) {
  const navigate = useNavigate();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: client
      ? {
          name: client.name,
          email: client.email,
          phone: client.phone,
          weddingDate: client.weddingDate,
          contractValue: client.contractValue,
          downPayment: client.downPayment,
          status: client.status,
          nextAction: client.nextAction,
          notes: client.notes,
          eventCategory: client.eventCategory || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          weddingDate: null,
          contractValue: 0,
          downPayment: 0,
          status: "orçamento enviado",
          nextAction: "enviar proposta",
          notes: "",
          eventCategory: "",
        },
  });

  const handleSubmit = (data: ClientFormValues) => {
    const sanitizedData = {
      ...data,
      eventCategory: data.eventCategory || 'outro'
    };
    onSubmit(sanitizedData);
  };

  const watchStatus = form.watch("status");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 animate-fade-in">
        <FormFields control={form.control} watchStatus={watchStatus} />
        <NotesField control={form.control} />
        <FormActions 
          isSubmitting={isSubmitting} 
          onCancel={() => navigate(-1)} 
          isEditing={!!client}
        />
      </form>
    </Form>
  );
}
