export type ArrivalRow = {
  id: string;
  arrival_date: string;
  destination: string | null;
  status: string | null;
  crm_quotations?: {
    quote_id: string | null;
    crm_leads?: { name: string | null; phone: string | null } | null;
  } | null;
};

export type FollowupRow = {
  id: string;
  followup_at: string;
  remark: string | null;
  status: 'pending' | 'done';
  crm_quotations?: {
    quote_id: string | null;
    crm_leads?: { name: string | null; phone: string | null } | null;
  } | null;
};
