interface BadgeProps {
  variant:
    | 'scheduled'
    | 'completed'
    | 'cancelled'
    | 'pending'
    | 'acute'
    | 'chronic'
    | 'preventive'
    | 'custom';
  label: string;
  color?: string;
}

export default function Badge({ variant, label, color }: BadgeProps) {
  const variantClasses = {
    scheduled: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-error/10 text-error border-error/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    acute: 'bg-warning/10 text-warning border-warning/20',
    chronic: 'bg-error/10 text-error border-error/20',
    preventive: 'bg-success/10 text-success border-success/20',
    custom: color || 'bg-text-dim/10 text-text-dim border-text-dim/20',
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
