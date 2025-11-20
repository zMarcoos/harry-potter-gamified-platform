const lockQueues = new Map<string, Promise<unknown>>();

export async function withFileLock<T>(
  filePath: string,
  task: () => Promise<T>,
): Promise<T> {
  const previousTask = lockQueues.get(filePath) ?? Promise.resolve();

  let releaseLock: () => void = () => {};
  const currentTaskLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  const nextTask = previousTask.finally(() => currentTaskLock);
  lockQueues.set(filePath, nextTask);

  try {
    return await task();
  } finally {
    releaseLock();
    if (lockQueues.get(filePath) === nextTask) {
      lockQueues.delete(filePath);
    }
  }
}
