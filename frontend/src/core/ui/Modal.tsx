import type { ReactNode } from 'react';
import { Modal as NativeModal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../messages/messages';
import { theme } from '../theme/theme';
import { absoluteFillStyle } from './overlayStyles';
import { Icon } from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Janela sobreposta: fecha pelo X, pelo fundo escurecido ou pelo botão "Cancelar" do conteúdo. */
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <NativeModal animationType="fade" onRequestClose={onClose} transparent visible>
      <View style={styles.overlay}>
        <Pressable accessible={false} onPress={onClose} style={styles.backdrop} />
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Pressable accessibilityLabel={MESSAGES.common.close} accessibilityRole="button" onPress={onClose}>
              <Icon name="x" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
        </View>
      </View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: theme.spacing.large },
  backdrop: { ...absoluteFillStyle, backgroundColor: theme.colors.overlay },
  dialog: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xlarge,
    boxShadow: theme.shadows.medium,
    maxHeight: '90%',
    maxWidth: theme.layout.modalMaxWidth,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.large,
    paddingHorizontal: theme.spacing.xlarge,
  },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.modalTitle },
  body: { padding: theme.spacing.xlarge },
});
