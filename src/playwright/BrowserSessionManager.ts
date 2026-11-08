import { BrowserManager } from './BrowserManager.js';
import type { BrowserContext, Page } from 'playwright';

interface Session {
  id: string;
  context: BrowserContext;
  pages: Page[];
  createdAt: string;
}

export class BrowserSessionManager {
  private readonly sessions = new Map<string, Session>();
  private counter = 0;

  constructor(private readonly browsers = new BrowserManager()) {}

  async openSession(id?: string): Promise<Session> {
    const sessionId = id ?? `session-${++this.counter}`;
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;
    const context = await this.browsers.createContext();
    const session: Session = { id: sessionId, context, pages: [], createdAt: new Date().toISOString() };
    this.sessions.set(sessionId, session);
    return session;
  }

  async openPage(sessionId: string): Promise<Page> {
    const session = await this.openSession(sessionId);
    const page = await session.context.newPage();
    session.pages.push(page);
    return page;
  }

  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  list(): Session[] {
    return [...this.sessions.values()];
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    for (const page of session.pages) await page.close().catch(() => undefined);
    await session.context.close().catch(() => undefined);
    this.sessions.delete(sessionId);
  }

  async closeAll(): Promise<void> {
    for (const id of [...this.sessions.keys()]) await this.closeSession(id);
    await this.browsers.close();
  }
}
