
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { ConditionalFormFields } from "./client-form/ConditionalFormFields";
import { NotesField } from "./client-form/NotesField";
import { FormActions } from "./client-form/FormActions";
import { createFormSchema, ClientFormProps, ClientFormValues } from "./client-form/types";

export { type ClientFormValues };

export function ClientForm({ client, onSubmit, isSubmitting = false }: ClientFormProps) {
  const navigate = useNavigate();
  
  // Get dynamic schema based on client status
  const currentStatus = client?.status || "primeiro_contato";
  const dynamicSchema = createFormSchema(currentStatus);
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: client
      ? {
          name: client.name,
          coupleName: client.coupleName || "",
          email: client.email,
          phone: client.phone,
          weddingDate: client.weddingDate,
          weddingStartTime: client.weddingStartTime || "",
          weddingEndTime: client.weddingEndTime || "",
          contractValue: client.contractValue,
          downPayment: client.downPayment,
          status: client.status,
          nextAction: client.nextAction,
          eventCategory: client.eventCategory,
          eventLocation: client.eventLocation || "",
          preWeddingDate: client.preWeddingDate,
          preWeddingStartTime: client.preWeddingStartTime || "",
          preWeddingEndTime: client.preWeddingEndTime || "",
          contractLink: client.contractLink || "",
          hasPreWedding: client.hasPreWedding !== false,
          notes: client.notes,
          leadSource: client.leadSource || "Não informado",
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
          status: "primeiro_contato",
          nextAction: "enviar proposta",
          eventCategory: "Casamento",
          eventLocation: "",
          preWeddingDate: null,
          preWeddingStartTime: "",
          preWeddingEndTime: "",
          contractLink: "",
          hasPreWedding: true,
          notes: "",
          leadSource: "Não informado",
        },
  });

  const handleSubmit = (data: ClientFormValues) => {
    onSubmit(data);
  };

  const watchStatus = form.watch("status");
  const watchHasPreWedding = form.watch("hasPreWedding");

  // Update schema when status changes
  useEffect(() => {
    const newSchema = createFormSchema(watchStatus);
    // Reset resolver with new schema
    form.clearErrors();
  }, [watchStatus, form]);

  // If hasPreWedding is false, clear the pre-wedding date fields
  useEffect(() => {
    if (!watchHasPreWedding) {
      form.setValue("preWeddingDate", null);
      form.setValue("preWeddingStartTime", "");
      form.setValue("preWeddingEndTime", "");
    }
  }, [watchHasPreWedding, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 animate-fade-in">
        <ConditionalFormFields 
          control={form.control} 
          watchStatus={watchStatus} 
          watchHasPreWedding={watchHasPreWedding}
          clientId={client?.id}
        />
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
