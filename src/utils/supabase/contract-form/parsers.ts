
import { ContractFormSubmission } from '@/utils/types';

export const parseContractForm = (form: any): ContractFormSubmission => {
  return {
    id: form.id,
    clientId: form.client_id,
    createdAt: form.created_at,
    updatedAt: form.updated_at,
    
    // Contratante data
    brideName: form.bride_name,
    groomName: form.groom_name,
    brideId: form.bride_id,
    brideCpf: form.bride_cpf,
    contactPhone: form.contact_phone,
    contactEmail: form.contact_email,
    completeAddress: form.complete_address,
    
    // Event data
    eventDate: form.event_date,
    eventTime: form.event_time,
    eventLocation: form.event_location,
    eventAddress: form.event_address,
    contractedPackage: form.contracted_package,
    ceremonialTeam: form.ceremonial_team,
    hasExclusivity: form.has_exclusivity,
    
    // Financial data
    totalValue: Number(form.total_value),
    paymentMethod: form.payment_method,
    installmentsInfo: form.installments_info,
    finalPaymentDate: form.final_payment_date,
    
    // Additional information
    observations: form.observations,
    allowsPortfolioUsage: form.allows_portfolio_usage,
    acceptsTerms: form.accepts_terms,
    
    // Form access
    accessToken: form.access_token,
    formStatus: form.form_status as 'pending' | 'completed' | 'approved'
  };
};

export const formatContractFormInput = (input: ContractFormSubmission) => {
  return {
    bride_name: input.brideName,
    groom_name: input.groomName,
    bride_id: input.brideId,
    bride_cpf: input.brideCpf,
    contact_phone: input.contactPhone,
    contact_email: input.contactEmail,
    complete_address: input.completeAddress,
    event_date: input.eventDate,
    event_time: input.eventTime,
    event_location: input.eventLocation,
    event_address: input.eventAddress,
    contracted_package: input.contractedPackage,
    ceremonial_team: input.ceremonialTeam,
    has_exclusivity: input.hasExclusivity,
    total_value: input.totalValue,
    payment_method: input.paymentMethod,
    installments_info: input.installmentsInfo,
    final_payment_date: input.finalPaymentDate,
    observations: input.observations,
    allows_portfolio_usage: input.allowsPortfolioUsage,
    accepts_terms: input.acceptsTerms,
    form_status: input.formStatus
  };
};
