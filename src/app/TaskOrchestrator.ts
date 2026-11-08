export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';

export interface OrchestratedTask<T = unknown> {
  id: string;
  name: string;
  status: TaskStatus;
  result?: T;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

export class TaskOrchestrator {
  private readonly tasks = new Map<string, OrchestratedTask>();
  private counter = 0;

  add<T>(name: string, run: () => Promise<T>): OrchestratedTask<T> {
    const task: OrchestratedTask<T> = { id: `task-${++this.counter}`, name, status: 'pending' };
    this.tasks.set(task.id, task as OrchestratedTask);
    return task;
  }

  async run<T>(name: string, run: () => Promise<T>): Promise<T> {
    const task = this.add(name, run);
    task.status = 'running';
    task.startedAt = new Date().toISOString();
    try {
      const result = await run();
      task.result = result;
      task.status = 'done';
      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      task.finishedAt = new Date().toISOString();
    }
  }

  async runAll<T>(steps: { name: string; run: () => Promise<T> }[]): Promise<T[]> {
    const results: T[] = [];
    for (const step of steps) results.push(await this.run(step.name, step.run));
    return results;
  }

  list(): OrchestratedTask[] {
    return [...this.tasks.values()];
  }

  summary(): { total: number; done: number; failed: number; running: number } {
    const tasks = this.list();
    return {
      total: tasks.length,
      done: tasks.filter((task) => task.status === 'done').length,
      failed: tasks.filter((task) => task.status === 'failed').length,
      running: tasks.filter((task) => task.status === 'running').length,
    };
  }
}
