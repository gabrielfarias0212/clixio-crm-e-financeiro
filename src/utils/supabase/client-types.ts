
import { Client, ClientStatus, NextAction, EventCategory } from '../types';

export interface ClientCreateData extends Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'> {}

export interface ClientUpdateData extends Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>> {}
