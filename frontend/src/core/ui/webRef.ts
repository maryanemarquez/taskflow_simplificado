import type { ComponentProps } from 'react';
import type { View } from 'react-native';

type ViewRef = ComponentProps<typeof View>['ref'];

/** Ref de um `View` que, na web, guarda o elemento DOM (usado para medir e para eventos de arrastar). */
export function hostRef(ref: { current: unknown }): ViewRef {
  return ref as ViewRef;
}
