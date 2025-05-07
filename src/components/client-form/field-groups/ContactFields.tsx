
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { ClientFormValues } from "../types";

interface ContactFieldsProps {
  control: Control<ClientFormValues>;
}

export function ContactFields({ control }: ContactFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Responsável</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome do responsável"
                {...field}
                className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-500">
              Nome do titular do contrato
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="coupleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Casal <span className="text-gray-500">(opcional)</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome do casal (se aplicável)"
                {...field}
                value={field.value || ""}
                className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-500">
              Nome dos noivos ou casal (se aplicável)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="email@exemplo.com" 
                type="email"
                {...field}
                className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input 
                placeholder="(00) 00000-0000" 
                {...field}
                className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
