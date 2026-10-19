import { getDatabase } from "@netlify/database";

/**
 * Netlify Database (managed Postgres) holds everything the admin can edit —
 * events, the wall, testimonials, FAQ, site text and newsletter sign-ups.
 * The schema lives in db/schema.ts; migrations are applied on deploy.
 *
 * Queries are plain SQL with `?` placeholders, numbered for Postgres here.
 */

type Param = string | number | null;

/** Anything that can run a query: the shared pool or a transaction client. */
export type Runner = { query: (text: string, params?: Param[]) => Promise<{ rows: any[]; rowCount: number | null }> };

let pool: Runner | undefined;
const shared = (): Runner => (pool ??= getDatabase().pool as unknown as Runner);

const numbered = (text: string) => {
  let n = 0;
  return text.replace(/\?/g, () => `$${++n}`);
};

export async function all<T>(text: string, params: Param[] = [], run: Runner = shared()): Promise<T[]> {
  return (await run.query(numbered(text), params)).rows as T[];
}

export async function get<T>(text: string, params: Param[] = [], run: Runner = shared()): Promise<T | undefined> {
  return (await all<T>(text, params, run))[0];
}

/** Runs a write and returns how many rows it touched. */
export async function exec(text: string, params: Param[] = [], run: Runner = shared()): Promise<number> {
  return (await run.query(numbered(text), params)).rowCount ?? 0;
}

/** Runs `fn` inside one transaction on a dedicated connection. */
export async function transaction<T>(fn: (run: Runner) => Promise<T>): Promise<T> {
  const client = await (getDatabase().pool as any).connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client as Runner);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
