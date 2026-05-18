/** Columns guaranteed on public.profiles across all project schemas. */
export type ProfileRow = {
  id: string;
  email?: string | null;
  role: string;
};

export function profileWritePayload(row: ProfileRow): ProfileRow {
  return {
    id: row.id,
    email: row.email?.toLowerCase() ?? null,
    role: row.role,
  };
}
