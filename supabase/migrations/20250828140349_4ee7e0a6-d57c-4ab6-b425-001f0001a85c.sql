-- Add lead_source column to wedding_clients table
ALTER TABLE wedding_clients 
ADD COLUMN lead_source text DEFAULT 'Não informado';

-- Create an index for better performance when filtering by lead source
CREATE INDEX idx_wedding_clients_lead_source ON wedding_clients(lead_source);