export default function LoadingSpinner({ className = 'bg-white' }: { className?: string }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <span className={`h-2.5 w-2.5 animate-bounce rounded-full ${className} [animation-delay:-0.3s]`} />
      <span className={`h-2.5 w-2.5 animate-bounce rounded-full ${className} [animation-delay:-0.15s]`} />
      <span className={`h-2.5 w-2.5 animate-bounce rounded-full ${className}`} />
    </div>
  );
}
