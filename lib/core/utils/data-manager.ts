import { promises as fs } from 'fs';
import path from 'path';
import { withFileLock } from './file-lock';

type DataManagerConfiguration = {
  dataDir: string;
  debug: boolean;
};

export class DataManager {
  private static instance: DataManager | null = null;
  private configuration: Required<DataManagerConfiguration>;

  private constructor(configuration?: Partial<DataManagerConfiguration>) {
    this.configuration = {
      dataDir: path.join(process.cwd(), 'data'),
      debug: false,
      ...(configuration || {}),
    };
  }

  static getInstance(
    configuration?: Partial<DataManagerConfiguration>,
  ): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager(configuration);
    }
    return DataManager.instance;
  }

  private log(...args: any[]) {
    if (this.configuration.debug) console.log('[DataManager]', ...args);
  }

  private getSafeAbsolutePath(relativePathWithoutExtension: string): string {
    if (relativePathWithoutExtension.includes('..')) {
      throw new Error('Caminho inválido: ".." não é permitido.');
    }

    const fullPath = path.join(
      this.configuration.dataDir,
      `${relativePathWithoutExtension}.json`,
    );
    const resolvedBase = path.resolve(this.configuration.dataDir);
    const resolvedTarget = path.resolve(fullPath);

    if (!resolvedTarget.startsWith(resolvedBase)) {
      throw new Error(
        'Acesso negado: tentativa de acessar um caminho fora do diretório de dados.',
      );
    }
    return fullPath;
  }

  private async ensureFileExists(filePath: string, initialData: any) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(
        filePath,
        JSON.stringify(initialData, null, 2),
        'utf-8',
      );
    }
  }

  async get<T = unknown>(
    relativeFilePathWithoutExtension: string,
    fallback?: T,
  ): Promise<T> {
    const filePath = this.getSafeAbsolutePath(relativeFilePathWithoutExtension);
    const defaultValue = fallback ?? ({} as T);

    await this.ensureFileExists(filePath, defaultValue);

    try {
      const data = await withFileLock(filePath, async () => {
        const raw = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(raw) as T;
      });
      return data;
    } catch (e) {
      this.log('Erro ao ler', filePath, e);
      return defaultValue;
    }
  }

  async set<T = unknown>(relativeFilePathWithoutExtension: string, data: T): Promise<void> {
    const filePath = this.getSafeAbsolutePath(relativeFilePathWithoutExtension);
    await withFileLock(filePath, async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    });
  }
}

export const dataManager = DataManager.getInstance();
