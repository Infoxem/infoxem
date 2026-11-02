/** Supabase limits each result; read every ordered page, including the final partial page. */
export async function readPages<T>(read: (from: number, to: number) => Promise<T[]>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 500) {
    const page = await read(from, from + 499);
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}
