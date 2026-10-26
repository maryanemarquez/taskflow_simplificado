import { useRef, useState } from 'react';
import { Modal as NativeModal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';
import { Icon } from '../../../core/ui/Icon';
import {
  addMonths,
  fromIso,
  isPast,
  isSegmentsComplete,
  parseSegments,
  toBr,
  todayYmd,
  toIso,
  type YearMonth,
  type Ymd,
} from '../model/calendar';
import { CalendarGrid } from './CalendarGrid';
import { DateSegmentInput, type DateSegments } from './DateSegmentInput';

interface DatePickerFieldProps {
  /** Prazo atual em AAAA-MM-DD, ou null quando não há prazo. */
  value: string | null;
  /** Prazo que a tarefa já tinha ao abrir a edição; pode ser mantido mesmo que já tenha passado. */
  originalValue: string | null;
  onChange: (value: string | null) => void;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Measurable {
  measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void;
}

const POPOVER_WIDTH = 296;
const POPOVER_HEIGHT = 372;
const GAP = 6;
const MARGIN = 8;

function segmentsOf(date: Ymd | null): DateSegments {
  if (!date) {
    return { day: '', month: '', year: '' };
  }
  const [day, month, year] = toBr(date).split('/');
  return { day, month, year };
}

export function DatePickerField({ value, originalValue, onChange }: DatePickerFieldProps) {
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
      <Text style={styles.label}>{MESSAGES.tasks.dueDate}</Text>
      <View ref={fieldRef as never} style={styles.control}>
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

interface DatePopoverProps extends DatePickerFieldProps {
  anchor: Anchor | null;
  onClose: () => void;
}

function DatePopover({ anchor, value, originalValue, onChange, onClose }: DatePopoverProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isMobile } = useViewport();
  const today = todayYmd();
  const selected = fromIso(value);
  const [segments, setSegments] = useState<DateSegments>(segmentsOf(selected));
  const [view, setView] = useState<YearMonth>({ year: (selected ?? today).year, month: (selected ?? today).month });
  const [error, setError] = useState<string | null>(null);

  const width = Math.min(POPOVER_WIDTH, windowWidth - MARGIN * 2);
  const left = Math.max(MARGIN, Math.min(anchor?.x ?? MARGIN, windowWidth - width - MARGIN));
  const below = (anchor?.y ?? 0) + (anchor?.height ?? 0) + GAP;
  const fitsBelow = below + POPOVER_HEIGHT <= windowHeight - MARGIN;
  const top = anchor ? Math.max(MARGIN, fitsBelow ? below : anchor.y - POPOVER_HEIGHT - GAP) : MARGIN * 6;

  const pick = (date: Ymd) => {
    onChange(toIso(date));
    onClose();
  };

  const type = (next: DateSegments) => {
    setSegments(next);
    if (!isSegmentsComplete(next.day, next.month, next.year)) {
      setError(null);
      return;
    }
    const date = parseSegments(next.day, next.month, next.year);
    if (!date) {
      setError(MESSAGES.datePicker.invalid);
    } else if (isPast(date, today) && toIso(date) !== originalValue) {
      setError(MESSAGES.datePicker.past);
    } else {
      setError(null);
      setView({ year: date.year, month: date.month });
      onChange(toIso(date));
    }
  };

  const confirm = () => {
    if (isSegmentsComplete(segments.day, segments.month, segments.year) && !error) {
      onClose();
    }
  };

  return (
    <NativeModal animationType="none" onRequestClose={onClose} transparent visible>
      <View style={styles.layer}>
        <Pressable accessible={false} onPress={onClose} style={styles.backdrop} />
        <View accessibilityViewIsModal style={[styles.popover, { left, top, width }]}>
          <DateSegmentInput
            autoFocus={!isMobile}
            invalid={error !== null}
            onChange={type}
            onSubmit={confirm}
            value={segments}
          />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <CalendarGrid
            cellSize={Math.floor((width - theme.spacing.large * 2) / 7)}
            onSelect={pick}
            onViewChange={(next) => setView(addMonths(next, 0))}
            selected={selected}
            today={today}
            view={view}
          />
        </View>
      </View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  field: { gap: theme.spacing.small },
  label: { color: theme.colors.text, fontFamily: theme.typography.semibold, fontSize: theme.typography.label },
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
  layer: { flex: 1 },
  backdrop: { ...(StyleSheet.absoluteFill as object) },
  popover: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.medium,
    gap: theme.spacing.medium,
    padding: theme.spacing.large,
    position: 'absolute',
  },
  error: { color: theme.colors.destructive, fontFamily: theme.typography.regular, fontSize: theme.typography.label, textAlign: 'center' },
});
