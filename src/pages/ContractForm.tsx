
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractFormSchema, ContractFormValues, paymentMethods } from "@/components/contract-form/ContractFormSchema";
import { getContractFormByToken, submitContractForm } from "@/utils/supabase/contract-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ContractFormSubmission, ContractFormInput } from "@/utils/types";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logoImage from "/lovable-uploads/6b189f38-b0b9-4a2e-8ff2-6635102e14a9.png";

export default function ContractForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContractFormSubmission | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      brideName: "",
      groomName: "",
      brideId: "",
      brideCpf: "",
      contactPhone: "",
      contactEmail: "",
      completeAddress: "",
      eventDate: "",
      eventTime: "",
      eventLocation: "",
      eventAddress: "",
      contractedPackage: "",
      ceremonialTeam: "",
      hasExclusivity: true,
      totalValue: 0,
      paymentMethod: "",
      installmentsInfo: "",
      finalPaymentDate: "",
      observations: "",
      allowsPortfolioUsage: true,
      acceptsTerms: false,
    },
  });

  useEffect(() => {
    const fetchFormData = async () => {
      if (!token) {
        toast.error("Link de formulário inválido");
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        const data = await getContractFormByToken(token);

        if (!data) {
          toast.error("Formulário não encontrado ou expirado");
          navigate("/");
          return;
        }

        setFormData(data);

        // If form is already completed, show submitted state
        if (data.formStatus === "completed" || data.formStatus === "approved") {
          setSubmitted(true);
        }

        // Pre-fill form with existing data if available
        if (data.formStatus === "completed" || data.formStatus === "approved") {
          form.reset({
            brideName: data.brideName,
            groomName: data.groomName,
            brideId: data.brideId,
            brideCpf: data.brideCpf,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            completeAddress: data.completeAddress,
            eventDate: data.eventDate,
            eventTime: data.eventTime,
            eventLocation: data.eventLocation,
            eventAddress: data.eventAddress,
            contractedPackage: data.contractedPackage,
            ceremonialTeam: data.ceremonialTeam || "",
            hasExclusivity: data.hasExclusivity,
            totalValue: data.totalValue,
            paymentMethod: data.paymentMethod,
            installmentsInfo: data.installmentsInfo || "",
            finalPaymentDate: data.finalPaymentDate || "",
            observations: data.observations || "",
            allowsPortfolioUsage: data.allowsPortfolioUsage,
            acceptsTerms: data.acceptsTerms,
          });
        } else if (data.brideName) {
          // Pre-fill with client data if available
          form.setValue("brideName", data.brideName);
          if (data.contactEmail) form.setValue("contactEmail", data.contactEmail);
          if (data.contactPhone) form.setValue("contactPhone", data.contactPhone);
        }

      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Erro ao carregar formulário");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [token, navigate, form]);

  const onSubmit = async (values: ContractFormValues) => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      
      // Create a properly typed input object from the form values
      // This ensures all required fields are present
      const formInput: ContractFormInput = {
        brideName: values.brideName,
        groomName: values.groomName,
        brideId: values.brideId,
        brideCpf: values.brideCpf,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        completeAddress: values.completeAddress,
        eventDate: values.eventDate,
        eventTime: values.eventTime,
        eventLocation: values.eventLocation,
        eventAddress: values.eventAddress,
        contractedPackage: values.contractedPackage,
        hasExclusivity: values.hasExclusivity,
        totalValue: values.totalValue,
        paymentMethod: values.paymentMethod,
        acceptsTerms: values.acceptsTerms,
        // Optional fields
        ceremonialTeam: values.ceremonialTeam,
        installmentsInfo: values.installmentsInfo,
        finalPaymentDate: values.finalPaymentDate,
        observations: values.observations,
        allowsPortfolioUsage: values.allowsPortfolioUsage
      };
      
      const success = await submitContractForm(token, formInput);
      
      if (success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar formulário");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <img src={logoImage} alt="Gabriel Farias Fotografias" className="h-24 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Formulário Enviado com Sucesso!</h1>
          <p className="text-gray-600 mb-6">
            Obrigado por preencher o formulário para seu contrato. Entraremos em contato em breve para finalizar os detalhes.
          </p>
          <div className="inline-flex items-center justify-center">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            Você pode fechar esta janela agora.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white text-center">
          <img src={logoImage} alt="Gabriel Farias Fotografias" className="h-24 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Formulário de Contrato</h1>
          <p className="mt-2">Preencha todos os campos abaixo para finalizar seu contrato fotográfico</p>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Dados do Contratante */}
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 h-8 w-8 mr-2 text-lg">1</span>
                  Dados do Contratante
                </h2>
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="brideName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo da noiva*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="groomName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo do noivo*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brideId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG da contratante*</FormLabel>
                        <FormControl>
                          <Input placeholder="RG" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brideCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF da contratante*</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone para contato*</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail*</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="exemplo@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="completeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço completo*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Rua, número, bairro, cidade, estado e CEP"
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Dados do Evento */}
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 h-8 w-8 mr-2 text-lg">2</span>
                  Dados do Evento
                </h2>
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do evento*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => 
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                              }
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário previsto*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local do evento*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Igreja Nossa Senhora, Salão de Festas..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço completo do evento*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Rua, número, cidade, estado" 
                            className="resize-none h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contractedPackage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pacote contratado*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Pré-wedding, Making of, Cerimônia, Recepção..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ceremonialTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da equipe cerimonial (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cerimonial Eventos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="hasExclusivity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Exclusividade fotográfica
                          </FormLabel>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground">
                            Confirme se Gabriel Farias será o único fotógrafo profissional do evento
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Dados Financeiros */}
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 h-8 w-8 mr-2 text-lg">3</span>
                  Dados Financeiros
                </h2>
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="totalValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor total acordado (R$)*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de pagamento*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma forma de pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="installmentsInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parcelamento (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 3x de R$ 1.000,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="finalPaymentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data prevista para pagamento final (opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => 
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                              }
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Observações Adicionais */}
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 h-8 w-8 mr-2 text-lg">4</span>
                  Observações Adicionais
                </h2>
                <Separator className="my-4" />
                
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações gerais (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informações adicionais que julgar importantes"
                          className="resize-none min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 mt-6">
                  <FormField
                    control={form.control}
                    name="allowsPortfolioUsage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Autorizo o uso das imagens do meu evento para o portfólio de Gabriel Farias Fotografias
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="acceptsTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Li e aceito os termos e condições do contrato, incluindo cláusulas de entrega, prazos e responsabilidades*
                          </FormLabel>
                          <FormMessage />
                          <p className="text-sm text-gray-500 mt-1">
                            Ao marcar esta opção, você confirma que está ciente e de acordo com todas as condições estabelecidas para a prestação do serviço fotográfico.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Formulário"}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  * Campos obrigatórios
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
