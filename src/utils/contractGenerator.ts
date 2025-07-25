
import jsPDF from 'jspdf';
import { ContractFormData, ContractPlaceholders } from '@/types/contract';

export const generateContractPlaceholders = (formData: ContractFormData): ContractPlaceholders => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return {
    nomeContratante: formData.contractorName,
    nomeCasal: formData.coupleNames,
    dataEvento: formatDate(formData.eventDate),
    rg: `${formData.brideRg} / ${formData.groomRg}`,
    cpf: formData.cpf,
    telefone: formData.phone,
    email: formData.email,
    enderecoContratante: formData.contractorAddress,
    cidadeContratante: formData.contractorCity,
    cidadeEvento: formData.eventCity,
    enderecoEvento: formData.eventAddress,
    horarioEvento: formData.eventTime,
    numeroConvidados: formData.guestCount.toString(),
    pacoteEscolhido: formData.packageName,
    itensInclusos: formData.includedItems,
    formaPagamento: formData.paymentMethod,
    precoTotal: formatCurrency(formData.totalPrice),
    tipoEvento: formData.eventType,
    dataAtual: formatDate(new Date().toISOString())
  };
};

export const parseContractTemplate = (template: string, placeholders: ContractPlaceholders): string => {
  let parsedTemplate = template;

  Object.entries(placeholders).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    parsedTemplate = parsedTemplate.replace(regex, value);
  });

  return parsedTemplate;
};

export const generateContractPDF = (contractContent: string, fileName: string = 'contrato.pdf'): void => {
  const doc = new jsPDF();
  
  // Configurar fonte
  doc.setFont('helvetica');
  doc.setFontSize(12);
  
  // Adicionar título
  doc.setFontSize(16);
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 20, 20);
  
  // Adicionar conteúdo
  doc.setFontSize(12);
  const lines = contractContent.split('\n');
  let yPosition = 40;
  
  lines.forEach((line) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });
  
  // Salvar PDF
  doc.save(fileName);
};

export const copyContractToClipboard = (contractContent: string): void => {
  navigator.clipboard.writeText(contractContent).then(() => {
    console.log('Contrato copiado para a área de transferência');
  }).catch((err) => {
    console.error('Erro ao copiar contrato:', err);
  });
};
