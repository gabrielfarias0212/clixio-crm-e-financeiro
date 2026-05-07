
# Corrigir PDF do Relatório de Fluxo de Trabalho

## Problema

O relatório usa `window.print()` com CSS `@media print` para gerar o PDF. O CSS atual tem problemas:

1. **`position: fixed`** no `#print-area` — impede paginação correta, todo conteúdo fica sobreposto na primeira página
2. **`visibility: hidden` em `body *`** — esconde tudo, mas o `#print-area` com `position: fixed` não respeita o fluxo natural do documento
3. **Falta de estilos de impressão adequados** — sem controle de quebra de página, margens, e dimensionamento

## Solução

Reescrever o CSS de impressão (`PRINT_CSS`) para:

- Usar `display: none` em vez de `visibility: hidden` para esconder elementos fora do `#print-area`
- Remover `position: fixed` do `#print-area` — deixar no fluxo normal para permitir paginação
- Adicionar regras de quebra de página (`page-break-inside: avoid`) nos cards e linhas de tabela
- Garantir que o `#print-area` ocupe toda a largura com fundo branco
- Ajustar `@page` com margens adequadas

## Arquivo alterado

- `src/components/workflow/WorkflowReportDialog.tsx` — apenas o bloco `PRINT_CSS` (linhas 66-73)

## Detalhes técnicos

```css
@media print {
  /* Esconder tudo exceto o conteúdo do relatório */
  body > *:not(#print-area) { display: none !important; }
  [role="dialog"] { position: static !important; }
  [role="dialog"] > *:not(:has(#print-area)) { display: none !important; }
  
  #print-area {
    position: static !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
    overflow: visible !important;
  }
  
  /* Controle de quebra de página */
  #print-area table tr { page-break-inside: avoid; }
  
  @page { margin: 1.5cm; size: A4; }
}
```

A abordagem correta é: clonar o `#print-area` para um container temporário no `body`, esconder todo o resto, imprimir, e restaurar. Isso garante que o conteúdo fique no fluxo normal do documento e a paginação funcione corretamente.
