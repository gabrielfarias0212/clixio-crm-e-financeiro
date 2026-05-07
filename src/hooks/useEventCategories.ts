import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EventCategory {
  id: string;
  name: string;
  is_default: boolean;
}

let cachedCategories: EventCategory[] | null = null;
const listeners: Array<() => void> = [];

function notify() { listeners.forEach(fn => fn()); }

export function useEventCategories() {
  const [categories, setCategories] = useState<EventCategory[]>(cachedCategories ?? []);
  const [loading, setLoading] = useState(!cachedCategories);

  const refresh = useCallback(() => {
    if (cachedCategories) setCategories(cachedCategories);
  }, []);

  useEffect(() => {
    listeners.push(refresh);
    return () => { const i = listeners.indexOf(refresh); if (i >= 0) listeners.splice(i, 1); };
  }, [refresh]);

  useEffect(() => {
    if (cachedCategories) return;
    setLoading(true);
    supabase
      .from("event_categories")
      .select("id, name, is_default")
      .order("is_default", { ascending: false })
      .order("name")
      .then(async ({ data }) => {
        let cats = data ?? [];
        // Novo usuário sem categorias — seed automático
        if (cats.length === 0) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const defaults = [
              "Casamento","Aniversario","Civil","Ensaio Estudio",
              "Ensaio externo","Evento Corporativo","15 anos","Outros"
            ];
            await supabase.from("event_categories").insert(
              defaults.map(name => ({ user_id: user.id, name, is_default: true }))
            );
            const { data: seeded } = await supabase
              .from("event_categories").select("id, name, is_default").order("name");
            cats = seeded ?? [];
          }
        }
        cachedCategories = cats;
        setCategories(cachedCategories);
        setLoading(false);
        notify();
      });
  }, []);

  const createCategory = useCallback(async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (cachedCategories?.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return true;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("event_categories")
      .insert({ user_id: user.id, name: trimmed, is_default: false })
      .select("id, name, is_default")
      .single();

    if (error) return false;
    cachedCategories = [...(cachedCategories ?? []), data].sort((a, b) =>
      a.is_default === b.is_default ? a.name.localeCompare(b.name) : a.is_default ? -1 : 1
    );
    setCategories(cachedCategories);
    notify();
    return true;
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("event_categories").delete().eq("id", id);
    if (error) return false;
    cachedCategories = (cachedCategories ?? []).filter(c => c.id !== id);
    setCategories(cachedCategories);
    notify();
    return true;
  }, []);

  return { categories, loading, createCategory, deleteCategory };
}
