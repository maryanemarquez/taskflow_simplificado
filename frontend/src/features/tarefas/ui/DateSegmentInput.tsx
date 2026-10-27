import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';

const FOCUS_DELAY_MS = 60;
const SEGMENT_HEIGHT = 40;
const SHORT_SEGMENT_WIDTH = 52;
const YEAR_SEGMENT_WIDTH = 72;

interface InputHandle {
  focus: () => void;
}

export interface DateSegments {
  day: string;
  month: string;
  year: string;
}

interface DateSegmentInputProps {
  value: DateSegments;
  invalid: boolean;
  autoFocus: boolean;
  onChange: (next: DateSegments) => void;
  onSubmit: () => void;
}

type Segment = keyof DateSegments;

const ORDER: Segment[] = ['day', 'month', 'year'];
const LENGTH: Record<Segment, number> = { day: 2, month: 2, year: 4 };
const LABEL: Record<Segment, string> = {
  day: MESSAGES.datePicker.day,
  month: MESSAGES.datePicker.month,
  year: MESSAGES.datePicker.year,
};
const PLACEHOLDER: Record<Segment, string> = { day: 'DD', month: 'MM', year: 'AAAA' };

/** Digitação `__ / __ / ____`: as barras ficam fixas e o foco avança sozinho. */
export function DateSegmentInput({ value, invalid, autoFocus, onChange, onSubmit }: DateSegmentInputProps) {
  const refs = useRef<Record<Segment, InputHandle | null>>({ day: null, month: null, year: null });

  // O foco automático nativo é perdido ao abrir a janela sobreposta; foca o dia logo depois.
  useEffect(() => {
    if (!autoFocus) {
      return undefined;
    }
    const timer = setTimeout(() => refs.current.day?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const change = (segment: Segment, text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, LENGTH[segment]);
    onChange({ ...value, [segment]: digits });
    const next = ORDER[ORDER.indexOf(segment) + 1];
    if (digits.length === LENGTH[segment] && next) {
      refs.current[next]?.focus();
    }
  };

  const backspace = (segment: Segment) => {
    const previous = ORDER[ORDER.indexOf(segment) - 1];
    if (value[segment] === '' && previous) {
      refs.current[previous]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {ORDER.map((segment, index) => (
        <View key={segment} style={styles.item}>
          {index > 0 ? <Text style={styles.slash}>/</Text> : null}
          <TextInput
            accessibilityLabel={LABEL[segment]}
            inputMode="numeric"
            maxLength={LENGTH[segment]}
            onChangeText={(text) => change(segment, text)}
            onKeyPress={(event) => {
              if (event.nativeEvent.key === 'Backspace') {
                backspace(segment);
              }
            }}
            onSubmitEditing={onSubmit}
            placeholder={PLACEHOLDER[segment]}
            placeholderTextColor={theme.colors.textSecondary}
            ref={(node) => {
              refs.current[segment] = node;
            }}
            style={[styles.input, segment === 'year' ? styles.year : styles.short, invalid && styles.invalid]}
            value={value[segment]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  item: { alignItems: 'center', flexDirection: 'row' },
  slash: { color: theme.colors.textSecondary, fontFamily: theme.typography.semibold, fontSize: theme.typography.sectionTitle, paddingHorizontal: theme.spacing.small },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.typography.semibold,
    fontSize: theme.typography.bodyLarge,
    height: SEGMENT_HEIGHT,
    textAlign: 'center',
  },
  short: { width: SHORT_SEGMENT_WIDTH },
  year: { width: YEAR_SEGMENT_WIDTH },
  invalid: { borderColor: theme.colors.destructive },
});
