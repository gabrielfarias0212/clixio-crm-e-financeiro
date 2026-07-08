import React from "react";
import { Control } from "react-hook-form";
import { ClientFormValues } from "./types";
import { ContactFields } from "./field-groups/ContactFields";
import { EventFields } from "./field-groups/EventFields";
import { PaymentFields } from "./field-groups/PaymentFields";
import { StatusFields } from "./field-groups/StatusFields";
import { EventCategoryField } from "./field-groups/EventCategoryField";
import { NotesField } from "./NotesField";
import { PackageSelector } from "./PackageSelector";
import { isLeadStage } from "./quickLeadTypes";
import { User, CalendarDays, DollarSign, Camera, FileText } from "lucide-react";
import { ServicePackage } from "@/utils/supabase/packages";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";

interface ConditionalFormFieldsProps {
  control: Control<ClientFormValues>;
  watchStatus: string;
  watchHasPreWedding?: boolean;
  clientId?: string;
  isLeadForm?: boolean;
  selectedPackageId?: string | null;
  onPackageSelect?: (pkg: ServicePackage | null) => void;
}

// ── Card de seção reutilizável ─────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  iconBg,
  iconColor,
  headerAction,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-stone-50 border-b border-stone-200">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-stone-900 leading-none mb-0.5">{title}</h3>
          <p className="text-xs text-stone-500">{subtitle}</p>
        </div>
        {headerAction}
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export function ConditionalFormFields({
  control,
  watchStatus,
  watchHasPreWedding = true,
  clientId,
  isLeadForm = false,
  selectedPackageId,
  onPackageSelect,
}: ConditionalFormFieldsProps) {
  const isLead = isLeadForm || isLeadStage(watchStatus);

  return (
    <div className="space-y-4">

      {/* ── Card 1: Identificação ── */}
      <SectionCard
        icon={User}
        title="Identificação"
        subtitle="Dados do responsável e contato"
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      >
        <ContactFields control={control} />
      </SectionCard>

      {/* ── Card 2: Evento ── */}
      <SectionCard
        icon={CalendarDays}
        title="Evento"
        subtitle={isLead ? "Categoria e status do lead" : "Tipo, data e local do evento"}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EventCategoryField control={control} />
          <StatusFields control={control} />
        </div>
        {!isLead && (
          <EventFields
            control={control}
            watchHasPreWedding={watchHasPreWedding}
            clientId={clientId}
          />
        )}
      </SectionCard>

      {/* ── Cards 3 e 4: só para clientes com status avançado ── */}
      {!isLead && (
        <>
          {/* ── Card 3: Contrato e Valores ── */}
          <SectionCard
            icon={DollarSign}
            title="Contrato e valores"
            subtitle="Pacote, valor contratado e entrada"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          >
            {onPackageSelect && (
              <PackageSelector
                selectedId={selectedPackageId ?? null}
                onSelect={onPackageSelect}
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PaymentFields control={control} watchStatus={watchStatus} />
            </div>
            <FormField
              control={control}
              name="contractLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link do contrato{" "}
                    <span className="text-stone-400 font-normal">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Cole o link do contrato (Google Drive, Notion...)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SectionCard>

          {/* ── Card 4: Ensaio / Pré-wedding + Notas ── */}
          <SectionCard
            icon={Camera}
            title="Ensaio / Pré-wedding"
            subtitle="Opcional — ative para adicionar a data do ensaio"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            headerAction={
              <FormField
                control={control}
                name="hasPreWedding"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 flex-shrink-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-xs text-stone-500 font-normal cursor-pointer whitespace-nowrap">
                      Tem ensaio
                    </FormLabel>
                  </FormItem>
                )}
              />
            }
          >
            {watchHasPreWedding && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="preWeddingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do ensaio</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Selecione uma data"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="preWeddingStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="preWeddingEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Término</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <NotesField control={control} />
          </SectionCard>
        </>
      )}

      {/* ── Modo lead: notas separadas ao final ── */}
      {isLead && (
        <SectionCard
          icon={FileText}
          title="Observações"
          subtitle="Notas sobre o lead"
          iconBg="bg-stone-100"
          iconColor="text-stone-500"
        >
          <NotesField control={control} />
        </SectionCard>
      )}
    </div>
  );
}
