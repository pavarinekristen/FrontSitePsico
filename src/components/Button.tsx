import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-blue text-white shadow-brand hover:-translate-y-0.5 hover:shadow-xl',
  secondary: 'bg-brand-yellow text-ink shadow-yellow hover:-translate-y-0.5',
  whatsapp: 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-whatsapp hover:-translate-y-0.5',
  ghost: 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25',
};

export function Button({ className, variant = 'primary', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
