import React from 'react';
import { EditionType } from '../../types/dex';

interface EditionBadgeProps {
  edition: EditionType;
  size?: 'sm' | 'md' | 'lg';
}

export default function EditionBadge({ edition, size = 'sm' }: EditionBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const getBadgeStyles = () => {
    switch (edition.kind) {
      case 'standard':
        return 'bg-sky-500/15 text-sky-300 border-sky-400/30';
      case 'limited':
        return 'bg-gradient-to-r from-amber-300/20 via-yellow-400/20 to-orange-400/20 text-amber-200 border-amber-300/30';
      case 'collab':
        return 'bg-gradient-to-r from-fuchsia-400/20 to-indigo-400/20 text-fuchsia-200 border-fuchsia-300/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getBadgeText = () => {
    switch (edition.kind) {
      case 'standard':
        return 'STANDARD';
      case 'limited':
        return `LIMITED ${edition.eventCode}`;
      case 'collab':
        return `COLLAB · ${edition.brand.toUpperCase()}`;
      default:
        return 'UNKNOWN';
    }
  };

  const getBadgeIcon = () => {
    switch (edition.kind) {
      case 'limited':
        return '✨';
      case 'collab':
        return '🤝';
      default:
        return '';
    }
  };

  return (
    <div className={`
      inline-flex items-center gap-1 rounded-full border font-medium shadow-soft
      ${sizeClasses[size]} ${getBadgeStyles()}
    `}>
      {getBadgeIcon() && <span>{getBadgeIcon()}</span>}
      <span>{getBadgeText()}</span>
    </div>
  );
}
