import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { FormTemplate, FormInstance, FormQuestion } from "@/utils/types";
import {
  fetchFormTemplates,
  fetchFormInstances,
  createFormTemplate,
  updateFormTemplate,
  deleteFormTemplate,
  createFormInstance,
  deleteFormInstance,
} from "@/utils/forms";
import { useToast } from "@/hooks/use-toast";

interface FormsContextValue {
  templates: FormTemplate[];
  instances: FormInstance[];
  loading: boolean;
  refreshTemplates: () => Promise<void>;
  refreshInstances: () => Promise<void>;
  addTemplate: (payload: Pick<FormTemplate, "title" | "description" | "category" | "questions">) => Promise<FormTemplate | null>;
  editTemplate: (id: string, payload: Partial<Pick<FormTemplate, "title" | "description" | "category" | "questions">>) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  sendForm: (payload: { client_id: string; template_id?: string; title: string; questions: FormQuestion[]; expires_at?: string }) => Promise<FormInstance | null>;
  removeInstance: (id: string) => Promise<void>;
}

const FormsContext = createContext<FormsContextValue | null>(null);

export function FormsProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [instances, setInstances] = useState<FormInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshTemplates = useCallback(async () => {
    try {
      const data = await fetchFormTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("FormsContext: fetchTemplates", err);
    }
  }, []);

  const refreshInstances = useCallback(async () => {
    try {
      const data = await fetchFormInstances();
      setInstances(data);
    } catch (err) {
      console.error("FormsContext: fetchInstances", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshTemplates(), refreshInstances()]).finally(() => setLoading(false));
  }, [refreshTemplates, refreshInstances]);

  const addTemplate = useCallback(async (payload: Pick<FormTemplate, "title" | "description" | "category" | "questions">) => {
    try {
      const tpl = await createFormTemplate(payload);
      setTemplates(prev => [...prev, tpl]);
      toast({ title: "Template criado com sucesso!" });
      return tpl;
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao criar template", variant: "destructive" });
      return null;
    }
  }, [toast]);

  const editTemplate = useCallback(async (id: string, payload: Partial<Pick<FormTemplate, "title" | "description" | "category" | "questions">>) => {
    try {
      await updateFormTemplate(id, payload);
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...payload } : t));
      toast({ title: "Template atualizado!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao atualizar template", variant: "destructive" });
    }
  }, [toast]);

  const removeTemplate = useCallback(async (id: string) => {
    try {
      await deleteFormTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Template excluído." });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao excluir template", variant: "destructive" });
    }
  }, [toast]);

  const sendForm = useCallback(async (payload: { client_id: string; template_id?: string; title: string; questions: FormQuestion[]; expires_at?: string }) => {
    try {
      const inst = await createFormInstance(payload);
      setInstances(prev => [inst, ...prev]);
      toast({ title: "Formulário criado!", description: "Copie o link e envie ao cliente." });
      return inst;
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao criar formulário", variant: "destructive" });
      return null;
    }
  }, [toast]);

  const removeInstance = useCallback(async (id: string) => {
    try {
      await deleteFormInstance(id);
      setInstances(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <FormsContext.Provider value={{
      templates, instances, loading,
      refreshTemplates, refreshInstances,
      addTemplate, editTemplate, removeTemplate,
      sendForm, removeInstance,
    }}>
      {children}
    </FormsContext.Provider>
  );
}

export function useForms() {
  const ctx = useContext(FormsContext);
  if (!ctx) throw new Error("useForms must be used within FormsProvider");
  return ctx;
}
