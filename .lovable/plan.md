Vou corrigir o problema na aba `/workflow` sem duplicar lógica e sem aumentar complexidade desnecessária.

Plano de correção:

1. Ajustar atualização parcial de clientes
- Corrigir `src/utils/supabase/client-update.ts` para montar o payload de update apenas com campos realmente enviados.
- Isso evita que ao clicar em uma etapa do workflow o sistema envie `wedding_date: null` e apague a data do evento.
- Também evita apagar outros campos do cliente quando a atualização é apenas de progresso.

2. Manter compatibilidade dos campos de Cópia/Backup e Curadoria
- Garantir que `backupCompleted` e `curationCompleted` sejam os campos principais usados pelo `/workflow`.
- Quando necessário, manter sincronizados os campos legados do banco (`backup_done` e `curadoria_done`) para não quebrar telas antigas ou dados já existentes.

3. Corrigir cálculo visual no card do `/workflow`
- Fazer o card considerar corretamente Cópia/Backup e Curadoria como concluídos.
- Assim, ao clicar nesses botões:
  - o botão passa a assumir a cor de concluído;
  - o contador `x/y etapas` aumenta;
  - a barra de progresso evolui;
  - a data do evento permanece intacta.

4. Melhorar robustez do estado após update
- Preservar no estado local do contexto os dados atuais do cliente quando a resposta do update vier parcial ou quando o payload for parcial.
- Evitar que campos não relacionados ao update desapareçam da interface.

Validação após aplicar:
- Rodar verificação TypeScript/build para garantir que não há erro de tipo.
- Conferir especificamente o fluxo: clicar em “Cópia/Backup” e “Curadoria” na aba `/workflow` e confirmar que progresso, cor do botão e data do evento permanecem corretos.

Arquivos previstos:
- `src/utils/supabase/client-update.ts`
- `src/utils/supabase/client-parsers.ts` se necessário para compatibilidade dos campos legados
- `src/pages/Workflow.tsx` somente se precisar ajustar o fallback visual dos botões