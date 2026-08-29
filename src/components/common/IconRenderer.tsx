import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  className = 'w-5 h-5',
  size,
  color,
}) => {
  // Check if name is emoji
  if (name && (name.match(/\p{Emoji}/u) || name.length <= 2)) {
    return <span className={`inline-block ${className}`}>{name}</span>;
  }

  // Find icon in lucide-react
  const IconComponent = (Icons as unknown as Record<string, React.FC<Icons.LucideProps>>)[name] || Icons.BookOpen;

  return <IconComponent className={className} size={size} color={color} />;
};
