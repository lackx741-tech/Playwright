import type { EventSchema } from '../../core/types.js';

export function event(name: string, options: Partial<Omit<EventSchema, 'name'>> = {}): EventSchema {
  return { name, ...options };
}
