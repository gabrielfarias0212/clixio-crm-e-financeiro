
import React from 'react';
import { Payment, Client } from "@/utils/types";
import { formatCurrency } from "@/utils/currency";
import { Camera, Globe, Phone, Mail, Facebook, Instagram } from "lucide-react";
import { PhotographerProfile } from "@/hooks/usePhotographerProfile";

interface PaymentReceiptTemplateProps {
  payment: Payment;
  client: Client;
  receiptNumber: string;
  contractValue: number;
  totalPaid: number;
  remainingBalance: number;
  photographerProfile?: PhotographerProfile | null;
}

export function PaymentReceiptTemplate({
  payment,
  client,
  receiptNumber,
  contractValue,
  totalPaid,
  remainingBalance,
  photographerProfile
}: PaymentReceiptTemplateProps) {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const isContractPaid = remainingBalance <= 0;
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 font-sans">
      {/* Cabeçalho */}
      <div className="relative text-center mb-10 pb-6 border-b-2 border-gray-800">
        <div className="absolute top-0 right-0 text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded">
          Comprovante Nº: {receiptNumber}
        </div>
        
        <div className="flex flex-col items-center mb-3">
          {photographerProfile?.logo_url ? (
            <img 
              src={photographerProfile.logo_url} 
              alt="Logo" 
              className="h-12 w-auto mb-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Camera size={32} className={`text-gray-600 ${photographerProfile?.logo_url ? 'hidden' : ''}`} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          COMPROVANTE DE PAGAMENTO
        </h1>
        
        {photographerProfile?.company_name && (
          <p className="text-lg text-gray-600 font-medium">
            {photographerProfile.company_name}
          </p>
        )}
        
        {photographerProfile?.brand_name && photographerProfile.brand_name !== photographerProfile.company_name && (
          <p className="text-md text-gray-500">
            {photographerProfile.brand_name}
          </p>
        )}
        
        {!photographerProfile?.company_name && !photographerProfile?.brand_name && (
          <p className="text-lg text-gray-600">Fotografia Profissional</p>
        )}

        {/* Informações de contato */}
        {photographerProfile && (photographerProfile.whatsapp || photographerProfile.email || photographerProfile.website) && (
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-gray-600">
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

      {/* Dados do Cliente */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
          Dados do Cliente
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-600">Nome:</span>
            <span className="text-gray-800">{client.name}</span>
          </div>
          {client.email && (
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="text-gray-800">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Telefone:</span>
              <span className="text-gray-800">{client.phone}</span>
            </div>
          )}
          {client.eventCategory && (
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Evento:</span>
              <span className="text-gray-800">{client.eventCategory}</span>
            </div>
          )}
          {client.weddingDate && (
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Data do Evento:</span>
              <span className="text-gray-800">{new Date(client.weddingDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {client.eventLocation && (
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Local:</span>
              <span className="text-gray-800">{client.eventLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalhes do Pagamento */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
          Detalhes do Pagamento
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-600">Data do Pagamento:</span>
            <span className="text-gray-800">{payment.date}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-600">Valor Pago:</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(payment.amount)}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-600">Status:</span>
            <span>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                payment.payment_status === 'pago' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              }`}>
                {payment.payment_status === 'pago' ? 'Pago' : 'Pendente'}
              </span>
            </span>
          </div>
          {payment.due_date && (
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Vencimento:</span>
              <span className="text-gray-800">{payment.due_date}</span>
            </div>
          )}
        </div>
        {payment.notes && (
          <div className="flex justify-between py-2 mt-2">
            <span className="font-medium text-gray-600">Observações:</span>
            <span className="text-gray-800">{payment.notes}</span>
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Resumo Financeiro do Contrato
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-5 bg-white rounded-lg border border-gray-200">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Valor Total do Contrato
            </div>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(contractValue)}
            </div>
          </div>
          <div className="text-center p-5 bg-white rounded-lg border border-gray-200">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Total Pago
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </div>
          <div className="text-center p-5 bg-white rounded-lg border border-gray-200">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Saldo Devedor
            </div>
            <div className={`text-xl font-bold ${remainingBalance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(remainingBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="border-t-2 border-gray-800 pt-6 text-center">
        <div className="font-medium mb-3 text-gray-800">
          Comprovante emitido em: {currentDate}
        </div>
        <div className="text-sm text-gray-600 mb-5 leading-relaxed">
          Este comprovante é válido como prova de pagamento.<br />
          Guarde-o para seus registros financeiros.
        </div>
        
        {isContractPaid ? (
          <div className="inline-block bg-green-100 text-green-800 border border-green-300 px-4 py-3 rounded-lg font-medium">
            ✅ Parabéns! Contrato totalmente quitado.
          </div>
        ) : (
          <div className="inline-block bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-3 rounded-lg font-medium">
            ⚠️ Atenção: Ainda há saldo devedor de {formatCurrency(remainingBalance)} para quitação completa do contrato.
          </div>
        )}
      </div>
    </div>
  );
}
