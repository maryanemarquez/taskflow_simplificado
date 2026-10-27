import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { formStyles } from '../../../core/ui/formStyles';
import { hostRef } from '../../../core/ui/webRef';
import { Icon } from '../../../core/ui/Icon';
import { fromIso, toBr } from '../model/calendar';
import type { Anchor } from '../model/popoverLayout';
import { DatePopover } from './DatePopover';

export interface DatePickerFieldProps {
  /** Prazo atual em AAAA-MM-DD, ou null quando não há prazo. */
  value: string | null;
  /** Prazo que a tarefa já tinha ao abrir a edição; pode ser mantido mesmo que já tenha passado. */
  originalValue: string | null;
  /** Erro da API para o prazo, mostrado abaixo do campo. */
  error?: string;
  onChange: (value: string | null) => void;
}

interface Measurable {
  measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void;
}

export function DatePickerField({ value, originalValue, error, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const fieldRef = useRef<Measurable | null>(null);
  const date = fromIso(value);

  const openPicker = () => {
    setOpen(true);
    fieldRef.current?.measureInWindow?.((x, y, width, height) => setAnchor({ x, y, width, height }));
  };

  return (
    <View style={styles.field}>
      <Text style={formStyles.label}>{MESSAGES.tasks.dueDate}</Text>
      <View ref={hostRef(fieldRef)} style={styles.control}>
        <Pressable
          accessibilityLabel={`${MESSAGES.tasks.dueDate}: ${date ? toBr(date) : MESSAGES.datePicker.placeholder}`}
          accessibilityRole="button"
          onPress={openPicker}
          style={styles.button}
        >
          <Icon color={theme.colors.textSecondary} name="calendar" size={16} />
          <Text style={[styles.value, !date && styles.placeholder]}>{date ? toBr(date) : MESSAGES.datePicker.placeholder}</Text>
        </Pressable>
        {date ? (
          <Pressable accessibilityLabel={MESSAGES.datePicker.clear} accessibilityRole="button" onPress={() => onChange(null)} style={styles.clear}>
            <Icon name="x" size={16} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text> : null}
      {open ? (
        <DatePopover
          anchor={anchor}
          onChange={onChange}
          onClose={() => setOpen(false)}
          originalValue={originalValue}
          value={value}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: theme.spacing.small },
  control: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    height: theme.layout.fieldHeight,
  },
  button: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: theme.spacing.small, height: '100%', paddingHorizontal: theme.spacing.large },
  value: { color: theme.colors.text, fontFamily: theme.typography.regular, fontSize: theme.typography.body },
  placeholder: { color: theme.colors.textSecondary },
  clear: { alignItems: 'center', height: '100%', justifyContent: 'center', paddingHorizontal: theme.spacing.medium },
});
