
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
          coupleName: client.coupleName || "",
          email: client.email,
          phone: client.phone,
          weddingDate: client.weddingDate, // Now a string
          weddingStartTime: client.weddingStartTime || "",
          weddingEndTime: client.weddingEndTime || "",
          contractValue: client.contractValue,
          downPayment: client.downPayment,
          status: client.status,
          nextAction: client.nextAction,
          eventCategory: client.eventCategory,
          eventLocation: client.eventLocation || "",
          preWeddingDate: client.preWeddingDate, // Now a string
          preWeddingStartTime: client.preWeddingStartTime || "",
          preWeddingEndTime: client.preWeddingEndTime || "",
          contractLink: client.contractLink || "",
          notes: client.notes,
        }
      : {
          name: "",
          coupleName: "",
          email: "",
          phone: "",
          weddingDate: null,
          weddingStartTime: "",
          weddingEndTime: "",
          contractValue: 0,
          downPayment: 0,
          status: "orçamento enviado",
          nextAction: "enviar proposta",
          eventCategory: "Casamento",
          eventLocation: "",
          preWeddingDate: null,
          preWeddingStartTime: "",
          preWeddingEndTime: "",
          contractLink: "",
          notes: "",
        },
  });

  const handleSubmit = (data: ClientFormValues) => {
    onSubmit(data);
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
