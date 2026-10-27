import { StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

/** Estilos comuns dos campos de formulário: rótulo, caixa de texto e mensagem de erro. */
export const formStyles = StyleSheet.create({
  label: {
    color: theme.colors.text,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.label,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.body,
    height: theme.layout.fieldHeight,
    paddingHorizontal: theme.spacing.large,
  },
  error: {
    color: theme.colors.destructive,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.label,
  },
});
