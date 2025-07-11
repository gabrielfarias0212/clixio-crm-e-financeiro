
import React from 'react';
import { BudgetWithItems } from '@/types/budget';
import { formatCurrency } from '@/utils/currency';
import { Camera, Globe, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { PhotographerProfile } from '@/hooks/usePhotographerProfile';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetReceiptTemplateProps {
  budget: BudgetWithItems;
  photographerProfile?: PhotographerProfile | null;
}

export function BudgetReceiptTemplate({
  budget,
  photographerProfile
}: BudgetReceiptTemplateProps) {
  const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
  const validityDate = new Date(budget.created_at);
  validityDate.setDate(validityDate.getDate() + budget.validity_days);
  const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });

  const statusLabels = {
    draft: 'Rascunho',
    sent: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 font-sans">
      {/* Cabeçalho */}
      <div className="relative text-center mb-10 pb-6 border-b-2 border-gray-800">
        <div className="flex flex-col items-center mb-3">
          {photographerProfile?.logo_url ? (
            <img 
              src={photographerProfile.logo_url} 
              alt="Logo" 
              className="h-16 w-auto mb-3"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Camera size={40} className={`text-gray-600 ${photographerProfile?.logo_url ? 'hidden' : ''}`} />
        </div>
        
        <h1 className="text-3xl font-bold mb-3 text-gray-800">
          ORÇAMENTO
        </h1>
        
        {photographerProfile?.company_name && (
          <p className="text-xl text-gray-600 font-medium">
            {photographerProfile.company_name}
          </p>
        )}
        
        {photographerProfile?.brand_name && photographerProfile.brand_name !== photographerProfile.company_name && (
          <p className="text-lg text-gray-500">
            {photographerProfile.brand_name}
          </p>
        )}
        
        {!photographerProfile?.company_name && !photographerProfile?.brand_name && (
          <p className="text-xl text-gray-600">Fotografia Profissional</p>
        )}

        {/* Informações de contato */}
        {photographerProfile && (photographerProfile.whatsapp || photographerProfile.email || photographerProfile.website) && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-600">
            {photographerProfile.whatsapp && (
              <div className="flex items-center gap-1">
                <Phone size={14} />
                <span>{photographerProfile.whatsapp}</span>
              </div>
            )}
            {photographerProfile.email && (
              <div className="flex items-center gap-1">
                <Mail size={14} />
                <span>{photographerProfile.email}</span>
              </div>
            )}
            {photographerProfile.website && (
              <div className="flex items-center gap-1">
                <Globe size={14} />
                <span>{photographerProfile.website}</span>
              </div>
            )}
          </div>
        )}

        {/* Redes sociais */}
        {photographerProfile && (photographerProfile.facebook || photographerProfile.instagram) && (
          <div className="flex justify-center gap-3 mt-2 text-sm text-gray-500">
            {photographerProfile.facebook && (
              <div className="flex items-center gap-1">
                <Facebook size={14} />
                <span>{photographerProfile.facebook}</span>
              </div>
            )}
            {photographerProfile.instagram && (
              <div className="flex items-center gap-1">
                <Instagram size={14} />
                <span>{photographerProfile.instagram}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informações do Orçamento */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
            Informações do Orçamento
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Título:</span>
              <span className="text-gray-800">{budget.budget_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Data de Criação:</span>
              <span className="text-gray-800">{createdDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Válido até:</span>
              <span className="text-gray-800">{validityFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                budget.status === 'approved' 
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : budget.status === 'sent'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : budget.status === 'rejected'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}>
                {statusLabels[budget.status as keyof typeof statusLabels] || budget.status}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
            Dados do Cliente
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Nome:</span>
              <span className="text-gray-800">{budget.client_name}</span>
            </div>
            {budget.client_email && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-800">{budget.client_email}</span>
              </div>
            )}
            {budget.client_phone && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Telefone:</span>
                <span className="text-gray-800">{budget.client_phone}</span>
              </div>
            )}
            {budget.event_date && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Data do Evento:</span>
                <span className="text-gray-800">
                  {format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itens do Orçamento */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
          Itens e Serviços
        </h2>
        {budget.budget_items && budget.budget_items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Serviço</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Descrição</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Qtd</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Preço Unit.</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {budget.budget_items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2">{item.service_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.description || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum item foi adicionado a este orçamento.</p>
        )}
        
        <div className="mt-6 text-right">
          <div className="inline-block bg-gray-100 p-4 rounded border border-gray-300">
            <div className="text-2xl font-bold text-gray-800">
              Total Geral: {formatCurrency(budget.total_amount)}
            </div>
          </div>
        </div>
      </div>

      {/* Condições de Pagamento e Observações */}
      <div className="grid grid-cols-1 gap-8">
        {(budget.payment_method || budget.payment_conditions) && (
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
              Condições de Pagamento
            </h2>
            <div className="space-y-3">
              {budget.payment_method && (
                <div>
                  <span className="font-medium text-gray-600">Forma de Pagamento: </span>
                  <span className="text-gray-800">{budget.payment_method}</span>
                </div>
              )}
              {budget.payment_conditions && (
                <div>
                  <span className="font-medium text-gray-600">Condições:</span>
                  <div className="mt-2 text-gray-800 whitespace-pre-wrap">{budget.payment_conditions}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {budget.general_notes && (
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
              Observações Gerais
            </h2>
            <div className="text-gray-800 whitespace-pre-wrap">{budget.general_notes}</div>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="border-t-2 border-gray-800 pt-6 mt-8 text-center">
        <div className="text-sm text-gray-600 mb-4">
          Orçamento válido por {budget.validity_days} dias a partir da data de emissão.
        </div>
        <div className="text-sm text-gray-500">
          Este orçamento foi gerado automaticamente em {format(new Date(), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}.
        </div>
      </div>
    </div>
  );
}
