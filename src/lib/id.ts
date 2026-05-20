/**
 * Lightweight unique ID for client-side use (Storage paths, draft keys).
 *
 * Not RFC 4122 compliant. For DB primary keys use `gen_random_uuid()` on the server.
 * Per-user folder isolation in label-photos RLS means within-user collision is the
 * only concern, and millisecond+random is sufficient for that.
 */
export function shortId(): string {
  const time = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1e10).toString(36);
  return `${time}-${rand}`;
}
