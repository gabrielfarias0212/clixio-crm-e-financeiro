import { useState, useRef } from "react";
import { useEventCategories } from "@/hooks/useEventCategories";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Check, X } from "lucide-react";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CategorySelect({ value, onChange, placeholder = "Selecione uma categoria", className }: CategorySelectProps) {
  const { categories, loading, createCategory } = useEventCategories();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = async () => {
    if (!newName.trim()) { setCreating(false); return; }
    setSaving(true);
    const ok = await createCategory(newName.trim());
    setSaving(false);
    if (ok) {
      onChange(newName.trim());
      setNewName("");
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleConfirm(); }
    if (e.key === "Escape") { setCreating(false); setNewName(""); }
  };

  return (
    <div className="space-y-1.5">
      <Select
        value={value}
        onValueChange={(v) => {
          if (v === "__new__") {
            setCreating(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          } else {
            onChange(v);
          }
        }}
        disabled={loading}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={loading ? "Carregando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
          ))}
          <SelectItem value="__new__" className="text-orange-600 font-medium border-t mt-1 pt-1">
            <span className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Nova categoria...
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {creating && (
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome da nova categoria"
            disabled={saving}
            className="flex-1 h-8 px-2.5 text-sm border rounded-md border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <button
            onClick={handleConfirm}
            disabled={saving || !newName.trim()}
            className="h-8 w-8 rounded-md bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setCreating(false); setNewName(""); }}
            className="h-8 w-8 rounded-md border hover:bg-gray-50 flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}
