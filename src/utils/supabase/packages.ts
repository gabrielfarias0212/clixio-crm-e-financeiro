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
  category_id?: string | null;
  costs:       PackageCost[];
  created_at?: string;
}

export async function fetchPackages(): Promise<ServicePackage[]> {
  const { data, error } = await supabase
    .from("service_packages")
    .select("*, package_costs(*), package_categories(id, name)")
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
    .insert({ name: pkg.name, description: pkg.description, price: pkg.price, category_id: pkg.category_id ?? null, user_id: user.id, active: true })
    .select()
    .single();
  if (error) throw error;
  return { ...data, costs: [] };
}

export async function updatePackage(id: string, changes: Partial<Pick<ServicePackage, "name" | "description" | "price" | "active" | "category_id">>): Promise<void> {
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

// ── Package Categories ──────────────────────────────────────────
export interface PackageCategory {
  id: string;
  name: string;
}

const DEFAULT_CATEGORIES = [
  "Casamento", "Pré-Wedding", "Aniversário", "Ensaio", "Corporativo", "Evento",
];

export async function fetchPackageCategories(): Promise<PackageCategory[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return [];

  // Seed defaults if none exist
  const { data: existing } = await supabase
    .from("package_categories")
    .select("id, name")
    .eq("user_id", user.id);

  if (!existing || existing.length === 0) {
    await supabase.from("package_categories").insert(
      DEFAULT_CATEGORIES.map(name => ({ name, user_id: user.id }))
    );
    const { data: seeded } = await supabase
      .from("package_categories").select("id, name").eq("user_id", user.id);
    return seeded ?? [];
  }
  return existing;
}

export async function addPackageCategory(name: string): Promise<PackageCategory> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("package_categories")
    .insert({ name: name.trim(), user_id: user.id })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function deletePackageCategory(id: string): Promise<void> {
  const { error } = await supabase.from("package_categories").delete().eq("id", id);
  if (error) throw error;
}
