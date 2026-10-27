import { StyleSheet } from 'react-native';
import { theme } from '../../../core/theme/theme';

/** Larguras e espaçamentos que o cabeçalho e as linhas da tabela de membros compartilham. */
export const memberColumns = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.large,
    paddingHorizontal: theme.spacing.xlarge,
    paddingVertical: theme.spacing.row,
  },
  rowMobile: { alignItems: 'flex-start', flexDirection: 'column', gap: theme.spacing.small, paddingHorizontal: theme.spacing.large },
  colMember: { flex: 2, minWidth: 0 },
  colEmail: { flex: 3, minWidth: 0 },
  colRole: { flex: 1.2 },
  colAction: { alignItems: 'flex-end', flex: 1 },
});
