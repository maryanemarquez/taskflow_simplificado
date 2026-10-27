import { StyleSheet, type ViewStyle } from 'react-native';

/** Cobre o elemento pai inteiro. O cast fica aqui porque o tipo de `absoluteFill` não aceita espalhamento direto. */
export const absoluteFillStyle = { ...(StyleSheet.absoluteFill as object) } as ViewStyle;
