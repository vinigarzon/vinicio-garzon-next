'use client';

interface ServiceIconProps {
  type: string;
  className?: string;
}

export default function ServiceIcon({ type, className = '' }: ServiceIconProps) {
  const iconProps = {
    className: className || 'w-10 h-10',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    viewBox: '0 0 24 24',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'loyalty':
      // Award/medal icon
      return (
        <svg {...iconProps}>
          <path d="M12 15a5 5 0 100-10 5 5 0 000 10z" />
          <path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5" />
        </svg>
      );
    case 'engagement':
      // Chat/conversation icon
      return (
        <svg {...iconProps}>
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      );
    case 'education':
      // Graduation cap / book icon
      return (
        <svg {...iconProps}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case 'growth':
      // Chart growing icon
      return (
        <svg {...iconProps}>
          <path d="M23 6l-9.5 9.5-5-5L1 18" />
          <path d="M17 6h6v6" />
        </svg>
      );
    case 'partnership':
      // Handshake / connected nodes
      return (
        <svg {...iconProps}>
          <circle cx="9" cy="7" r="4" />
          <circle cx="17" cy="7" r="4" />
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
          <path d="M21 21v-2a4 4 0 00-3-3.87" />
        </svg>
      );
    case 'digital':
      // Circuit / digital transformation icon
      return (
        <svg {...iconProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
          <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
        </svg>
      );
    default:
      return null;
  }
}
