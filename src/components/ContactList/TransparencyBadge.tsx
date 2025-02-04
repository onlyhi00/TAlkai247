import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TransparencyLevel } from '@/types/contact';

interface TransparencyBadgeProps {
  level: TransparencyLevel;
}

export function TransparencyBadge({ level }: TransparencyBadgeProps) {
  const variant = 
    level === 'Full Disclosure'
      ? 'default'
      : level === 'Partial Disclosure'
      ? 'secondary'
      : 'destructive';

  return (
    <Badge variant={variant}>
      {level}
    </Badge>
  );
}