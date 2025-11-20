export function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className='flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground py-4'>
      <Icon className='w-8 h-8 text-muted-foreground/50' />
      <p>{message}</p>
    </div>
  );
}
