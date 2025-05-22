
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
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface ContactFieldsProps {
  control: Control<ClientFormValues>;
}

export function ContactFields({ control }: ContactFieldsProps) {
  const getWhatsAppLink = (phone: string) => {
    // Remove any non-numeric characters from the phone number
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  const watchPhone = control._formValues.phone;
  
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
            <div className="flex gap-2">
              <FormControl>
                <Input 
                  placeholder="(00) 00000-0000" 
                  {...field}
                  className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </FormControl>
              {field.value && (
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon"
                  className="bg-green-500 hover:bg-green-600 text-white border-none"
                  onClick={() => window.open(getWhatsAppLink(field.value), '_blank')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="white" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-4 w-4"
                  >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                    <path d="M9 10a1 1 0 0 0 1 1c1 0 2.5-2.5 2.5-2.5s1.5 2.5 2.5 2.5 1-1 1-1v3c0 1-1 2-3 2s-3-1-3-2v-3"/>
                  </svg>
                </Button>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
