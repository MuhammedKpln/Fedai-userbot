export function loadSession(session: string) {
  return JSON.parse(Buffer.from(session, 'base64').toString('utf-8'));
}
