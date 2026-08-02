interface EmptyStateProps {
  message: string;
  children: React.ReactNode;
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-sm font-semibold">{message}</p>
      {children}
    </div>
  );
}
