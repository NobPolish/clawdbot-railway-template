'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 
      shadow-sm p-6 hover:shadow-md transition-shadow
      ${className}
    `}>
      {children}
    </div>
  );
}
