import { Wand2 } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center text-center p-4'>
      <Wand2 className='w-16 h-16 text-yellow-400 mb-4 animate-pulse' />
      <h1 className='text-6xl font-bold text-chroma mb-2'>404</h1>
      <h2 className='text-2xl font-semibold mb-4'>Página Não Encontrada</h2>
      <p className='text-muted-foreground mb-8 max-w-sm'>
        Parece que você usou um feitiço de desaparecimento na página errada. Ela
        não está por aqui!
      </p>
      <Link
        className='inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90'
        href='/'
      >
        Voltar para o Salão Principal
      </Link>
    </div>
  );
}
