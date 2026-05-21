## Problema

Ao adicionar um evento personalizado sem cliente vinculado na aba Calendário, ele é salvo corretamente no banco (`calendar_events`) e aparece na barra lateral do dia selecionado, mas **não aparece nenhum marcador (dot) no grid mensal**. Isso dá a sensação de que o evento "não aparece no calendário".

## Causa

Em `src/components/calendar/CalendarGrid.tsx`, o `DayContent` do calendário mensal monta `clientsByDate` usando apenas a lista `clients` (datas de casamento e pré-wedding). Os eventos manuais vindos de `useCalendarEvents()` são totalmente ignorados, então dias que só têm evento manual ficam sem marcação.

O `useCalendarPage` já calcula `eventsByDate` e `eventDates` corretamente, mas esses valores não são passados/usados pelo `CalendarGrid` para desenhar os dots.

## Correção

Atualizar apenas `src/components/calendar/CalendarGrid.tsx`:

1. Consumir os eventos manuais via `useCalendarEvents()` (igual a `WeekView`).
2. Construir um `eventsByDate` local (respeitando `eventTypeFilter`: quando o filtro for `"all"` ou `"custom"`, incluir os eventos manuais).
3. No `DayContent`, somar o badge de dots de clientes com um dot adicional para eventos manuais do dia (usando a cor do evento via `EVENT_COLORS`, fallback cinza).
4. Manter o limite visual atual (3 dots + "+N").
5. Atualizar a legenda para incluir "Evento personalizado".

Nenhuma mudança de schema, hooks de dados, sidebar, semana ou dia — esses já tratam eventos manuais corretamente.

## Arquivos afetados

- `src/components/calendar/CalendarGrid.tsx` (única edição)
