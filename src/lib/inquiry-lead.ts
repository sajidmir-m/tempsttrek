import { supabase } from '@/lib/supabase';

export type InquiryForLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string | null;
  address?: string | null;
  hotel_requirement?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  package_id?: string | null;
  lead_id?: string | null;
  source?: string | null;
};

/** Ensure a CRM lead exists for this website inquiry (DB trigger may already have created one). */
export async function ensureLeadForInquiry(inquiry: InquiryForLead): Promise<string> {
  if (inquiry.lead_id) return inquiry.lead_id;

  const source =
    inquiry.source?.trim() ||
    (inquiry.package_id ? 'package-booking' : 'website');

  const { data, error } = await supabase
    .from('crm_leads')
    .insert({
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      source,
      destination: inquiry.hotel_requirement?.trim() || null,
      message: inquiry.message || null,
      address: inquiry.address || null,
      hotel_requirement: inquiry.hotel_requirement || null,
      check_in: inquiry.check_in || null,
      check_out: inquiry.check_out || null,
      inquiry_id: inquiry.id,
      status: 'new',
    })
    .select('id')
    .single();

  if (error) throw error;

  const leadId = data.id as string;
  await supabase.from('inquiries').update({ lead_id: leadId }).eq('id', inquiry.id);
  return leadId;
}

/** Assign inquiry's lead to an employee (or unassign if employeeId is null). */
export async function assignInquiryToEmployee(
  inquiry: InquiryForLead,
  employeeId: string | null
): Promise<string> {
  const leadId = await ensureLeadForInquiry(inquiry);
  const { error } = await supabase
    .from('crm_leads')
    .update({
      assigned_to: employeeId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);
  if (error) throw error;
  return leadId;
}

export type EmployeeOption = { id: string; email: string };

export async function fetchCrmEmployees(): Promise<EmployeeOption[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email')
    .in('role', ['admin', 'employee'])
    .order('email');
  if (error) throw error;
  return (data || []).map((p) => ({ id: p.id, email: p.email || p.id }));
}
