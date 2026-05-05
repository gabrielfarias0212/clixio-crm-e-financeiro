import { supabase } from "@/integrations/supabase/client";
import { COST_CATEGORIES } from "./project-costs";

export interface PackageCost {
  id:          string;
  package_id:  string;
  description: string;
  amount:      number;
  category:    string;
  supplier?:   string;
}

export interface ServicePackage {
  id:          string;
  name:        string;
  description?: string;
  price:       number;
  active:      boolean;
  costs:       PackageCost[];
  created_at?: string;
}

export async function fetchPackages(): Promise<ServicePackage[]> {
  const { data, error } = await supabase
    .from("service_packages")
    .select("*, package_costs(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ ...p, costs: p.package_costs ?? [] }));
}

export async function addPackage(
  pkg: Omit<ServicePackage, "id" | "active" | "costs" | "created_at">
): Promise<ServicePackage> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("service_packages")
    .insert({ name: pkg.name, description: pkg.description, price: pkg.price, user_id: user.id, active: true })
    .select()
    .single();
  if (error) throw error;
  return { ...data, costs: [] };
}

export async function updatePackage(id: string, changes: Partial<Pick<ServicePackage, "name" | "description" | "price" | "active">>): Promise<void> {
  const { error } = await supabase.from("service_packages").update(changes).eq("id", id);
  if (error) throw error;
}

export async function deletePackage(id: string): Promise<void> {
  const { error } = await supabase.from("service_packages").delete().eq("id", id);
  if (error) throw error;
}

export async function addPackageCost(
  packageId: string,
  cost: Omit<PackageCost, "id" | "package_id">
): Promise<PackageCost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("package_costs")
    .insert({ ...cost, package_id: packageId, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as PackageCost;
}

export async function deletePackageCost(id: string): Promise<void> {
  const { error } = await supabase.from("package_costs").delete().eq("id", id);
  if (error) throw error;
}
