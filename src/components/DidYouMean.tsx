import { HelpCircle } from 'lucide-react';

interface DidYouMeanProps {
  suggestion: string | null;
  onAccept: (term: string) => void;
}

export function DidYouMean({ suggestion, onAccept }: DidYouMeanProps) {
  if (!suggestion) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
      <HelpCircle className="h-4 w-4 text-primary/60" />
      <span>¿Quisiste decir:</span>
      <button
        type="button"
        className="font-medium text-primary hover:underline cursor-pointer"
        onClick={() => onAccept(suggestion)}
      >
        {suggestion}
      </button>
      <span>?</span>
    </div>
  );
}
