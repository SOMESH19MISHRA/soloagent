
export enum InterestType {
  Buy = 'Buy',
  Rent = 'Rent',
  Sell = 'Sell'
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  VisitScheduled = 'Visit Scheduled',
  Negotiation = 'Negotiation',
  Closed = 'Closed',
  Lost = 'Lost'
}

export enum FollowUpType {
  Call = 'Call',
  Message = 'Message',
  Visit = 'Visit',
  Email = 'Email'
}

export enum FollowUpOutcome {
  Spoke = 'Spoke - Interested',
  NoAnswer = 'No Answer',
  Reschedule = 'Requested Reschedule',
  NotInterested = 'Not Interested'
}

export interface Note {
  id: string;
  lead_id: string;
  text: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  date: string;
  type: FollowUpType;
  notes: string;
  completed: boolean;
  outcome?: FollowUpOutcome;
}

export interface Lead {
  id: string;
  user_id: string;
  fullName: string;
  phone: string;
  interestType: InterestType;
  budget: number;
  area: string;
  status: LeadStatus;
  notes: Note[];
  followUps: FollowUp[];
  createdAt: string;
}

export interface Subscription {
  user_id: string;
  is_active: boolean;
  paid_until: string | null;
  updated_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  created_at?: string;
  subscription?: Subscription;
}

export type View = 'dashboard' | 'leads' | 'lead-detail' | 'add-lead' | 'profile-setup' | 'profile' | 'feedback';
