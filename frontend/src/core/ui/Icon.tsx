import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export type IconName = ComponentProps<typeof Feather>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Ícone decorativo: o significado vem sempre do texto ao lado ou do rótulo do botão. */
export function Icon({ name, size = 18, color = theme.colors.textSecondary }: IconProps) {
  return <Feather accessibilityElementsHidden color={color} importantForAccessibility="no" name={name} size={size} />;
}
