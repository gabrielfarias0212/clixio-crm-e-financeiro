import { PersonalControlCards } from "@/components/personal/PersonalControlCards";
import { PersonalFinancialSummary } from "@/components/personal/PersonalFinancialSummary";

export default function PersonalControl() {
  const totalEntries = 5000;
  const totalExpenses = 2500;
  const balance = totalEntries - totalExpenses;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Controle Pessoal</h1>
      <PersonalFinancialSummary totalEntries={totalEntries} totalExpenses={totalExpenses} balance={balance} />
      <PersonalControlCards />
    </div>
  );
}
