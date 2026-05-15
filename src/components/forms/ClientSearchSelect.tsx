import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const C = {
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  navy:    "#1E3A5F",
  navyBg:  "#E8EEF6",
  border:  "#E8E4DE",
};

interface ClientSearchSelectProps {
  clients: { id: string; name: string }[];
  value: string;           // selected client id
  onChange: (id: string) => void;
  placeholder?: string;
}

export function ClientSearchSelect({
  clients,
  value,
  onChange,
  placeholder = "Buscar cliente...",
}: ClientSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.id === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : clients;

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Input / selected display */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 12px", borderRadius: 8,
        border: `1px solid ${open ? C.navy : C.border}`,
        background: C.itemBg, cursor: "text",
        boxShadow: open ? `0 0 0 2px ${C.navyBg}` : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
        onClick={() => { setOpen(true); }}
      >
        <Search style={{ width: 14, height: 14, color: C.textSub, flexShrink: 0 }} />

        {selectedClient && !open ? (
          // Show selected name
          <span style={{ flex: 1, fontSize: 13, color: C.text, userSelect: "none" }}>
            {selectedClient.name}
          </span>
        ) : (
          // Show search input
          <input
            autoFocus={open}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={selectedClient ? selectedClient.name : placeholder}
            style={{
              flex: 1, border: "none", background: "transparent",
              fontSize: 13, color: C.text, outline: "none",
            }}
          />
        )}

        {value && (
          <button
            onClick={e => { e.stopPropagation(); handleClear(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
          >
            <X style={{ width: 13, height: 13, color: C.textSub }} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#FFFFFF", borderRadius: 8,
          border: `1px solid ${C.border}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          zIndex: 100, maxHeight: 200, overflowY: "auto",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "10px 12px", fontSize: 12, color: C.textSub }}>
              Nenhum cliente encontrado
            </div>
          ) : (
            filtered.map(c => (
              <div
                key={c.id}
                onClick={() => handleSelect(c.id)}
                style={{
                  padding: "9px 12px", fontSize: 13, cursor: "pointer",
                  background: c.id === value ? C.navyBg : "#FFFFFF",
                  color: c.id === value ? C.navy : C.text,
                  fontWeight: c.id === value ? 600 : 400,
                  borderBottom: `1px solid ${C.divider}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => {
                  if (c.id !== value) (e.currentTarget as HTMLDivElement).style.background = C.itemBg;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = c.id === value ? C.navyBg : "#FFFFFF";
                }}
              >
                {c.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
