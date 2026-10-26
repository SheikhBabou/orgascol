import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-card-bg border border-dashed border-border rounded-2xl p-12 text-center space-y-4 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary/40" />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted max-w-sm mx-auto">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors btn-press"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
