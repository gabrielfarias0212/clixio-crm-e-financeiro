
-- Criar sequence para numeração automática dos contratos
CREATE SEQUENCE contract_number_seq START 1;

-- Adicionar campos necessários na tabela contracts
ALTER TABLE contracts 
ADD COLUMN contract_number INTEGER DEFAULT nextval('contract_number_seq'),
ADD COLUMN ceremonial_team TEXT,
ADD COLUMN rg TEXT;

-- Atualizar template padrão com o novo formato
UPDATE contract_templates 
SET content = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS
CONTRATO Nº {{numeroContrato}}

CONTRATANTE:
Nome: {{nomeContratante}}
RG: {{rg}}
CPF: {{cpf}}
Celular: {{telefone}}
Endereço: {{enderecoContratante}}
Cidade: {{cidadeContratante}}
Email: {{email}}

CASAL: {{nomeCasal}}

CONTRATADA:
Gabriel Farias Fotografias
CNPJ: 37.328.836/0001-20
Celular: (67) 99855-2095
Cidade: Dourados
Email: gabrielfariasfotografias@gmail.com

---

### INFORMAÇÕES DO EVENTO
**Tipo de Evento:** {{tipoEvento}}
**Data:** {{dataEvento}}
**Horário:** {{horarioEvento}}
**Cidade:** {{cidadeEvento}}
**Local:** {{enderecoEvento}}
**Número de convidados:** {{numeroConvidados}}
**Equipe Cerimonial:** {{equipeCerimonial}}

---

### OBJETOS E SERVIÇOS INCLUSOS
**Pacote contratado:** {{pacoteEscolhido}}
**Serviços inclusos:**
{{itensInclusos}}

---

### CLÁUSULAS CONTRATUAIS

**1. OBJETO DO CONTRATO**
A CONTRATADA prestará ao CONTRATANTE os serviços de cobertura fotográfica para o evento acima descrito, respeitando os padrões técnicos e artísticos da empresa.

**2. EXCLUSIVIDADE**
A equipe da Gabriel Farias Fotografias será a única responsável pela cobertura do evento. A contratação de outro profissional sem consentimento resultará na rescisão do contrato e retenção de 30% do valor.

**3. VALOR E FORMA DE PAGAMENTO**
Valor total: {{precoTotal}}
Forma de pagamento: {{formaPagamento}}
*A hora extra, se houver, será cobrada à parte no valor de R$ 600,00 por hora ou fração superior a 30 minutos.*

**4. ENTREGA DOS MATERIAIS**
Prévias serão entregues em até 8 dias úteis.
Entrega final do material será realizada em até 120 dias úteis após o evento.

**5. SELEÇÃO DE FOTOS**
O CONTRATANTE tem até 120 dias corridos após a entrega do link para selecionar as imagens.

**6. USO DE IMAGEM**
O CONTRATANTE autoriza o uso das imagens para portfólio e redes sociais. Caso deseje revogar, deverá solicitar por escrito.

**7. INADIMPLÊNCIA**
Multa de 2% + juros de 1% ao mês + correção pelo INPC em caso de atraso.
Após 30 dias, medidas judiciais poderão ser tomadas.

**8. CANCELAMENTOS E RESCISÕES**
Cancelamentos por parte do CONTRATANTE:
- Multa de 50% se com mais de 90 dias de antecedência
- Multa de 80% se com menos de 90 dias

Cancelamentos pela CONTRATADA: mesmas condições.

**9. CASO FORTUITO E FORÇA MAIOR**
Ambas as partes ficam isentas de penalidades mediante justificativa válida (ex: doença, falecimento, desastres naturais etc.).

**10. ALIMENTAÇÃO DA EQUIPE**
O CONTRATANTE fornecerá alimentação completa e bebidas não alcoólicas à equipe, no mesmo horário dos noivos ou convidados principais.

**11. FORO**
Fica eleito o foro da comarca de Dourados/MS para eventuais litígios, salvo o direito do consumidor.

---

**E por estarem de acordo, firmam o presente contrato.**

Dourados, {{dataAtual}}

_________________________________
CONTRATANTE: {{nomeContratante}}

_________________________________
CONTRATADO: Gabriel Farias'
WHERE name = 'Template Padrão Profissional';

-- Inserir cláusulas padrão na tabela contract_clauses
INSERT INTO contract_clauses (user_id, title, content, clause_order, is_required) VALUES
('00000000-0000-0000-0000-000000000000', 'OBJETO DO CONTRATO', 'A CONTRATADA prestará ao CONTRATANTE os serviços de cobertura fotográfica para o evento acima descrito, respeitando os padrões técnicos e artísticos da empresa.', 1, true),
('00000000-0000-0000-0000-000000000000', 'EXCLUSIVIDADE', 'A equipe da Gabriel Farias Fotografias será a única responsável pela cobertura do evento. A contratação de outro profissional sem consentimento resultará na rescisão do contrato e retenção de 30% do valor.', 2, true),
('00000000-0000-0000-0000-000000000000', 'VALOR E FORMA DE PAGAMENTO', 'Valor total: {{precoTotal}}\nForma de pagamento: {{formaPagamento}}\n*A hora extra, se houver, será cobrada à parte no valor de R$ 600,00 por hora ou fração superior a 30 minutos.*', 3, true),
('00000000-0000-0000-0000-000000000000', 'ENTREGA DOS MATERIAIS', 'Prévias serão entregues em até 8 dias úteis.\nEntrega final do material será realizada em até 120 dias úteis após o evento.', 4, true),
('00000000-0000-0000-0000-000000000000', 'SELEÇÃO DE FOTOS', 'O CONTRATANTE tem até 120 dias corridos após a entrega do link para selecionar as imagens.', 5, true),
('00000000-0000-0000-0000-000000000000', 'USO DE IMAGEM', 'O CONTRATANTE autoriza o uso das imagens para portfólio e redes sociais. Caso deseje revogar, deverá solicitar por escrito.', 6, false),
('00000000-0000-0000-0000-000000000000', 'INADIMPLÊNCIA', 'Multa de 2% + juros de 1% ao mês + correção pelo INPC em caso de atraso.\nApós 30 dias, medidas judiciais poderão ser tomadas.', 7, true),
('00000000-0000-0000-0000-000000000000', 'CANCELAMENTOS E RESCISÕES', 'Cancelamentos por parte do CONTRATANTE:\n- Multa de 50% se com mais de 90 dias de antecedência\n- Multa de 80% se com menos de 90 dias\n\nCancelamentos pela CONTRATADA: mesmas condições.', 8, true),
('00000000-0000-0000-0000-000000000000', 'CASO FORTUITO E FORÇA MAIOR', 'Ambas as partes ficam isentas de penalidades mediante justificativa válida (ex: doença, falecimento, desastres naturais etc.).', 9, false),
('00000000-0000-0000-0000-000000000000', 'ALIMENTAÇÃO DA EQUIPE', 'O CONTRATANTE fornecerá alimentação completa e bebidas não alcoólicas à equipe, no mesmo horário dos noivos ou convidados principais.', 10, false),
('00000000-0000-0000-0000-000000000000', 'FORO', 'Fica eleito o foro da comarca de Dourados/MS para eventuais litígios, salvo o direito do consumidor.', 11, true);
