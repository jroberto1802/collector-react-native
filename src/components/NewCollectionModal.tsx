import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

type NewCollectionModalProps = {
  errorMessage: string;
  isSubmitting: boolean;
  name: string;
  onChangeName: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  visible: boolean;
};

export function NewCollectionModal({
  errorMessage,
  isSubmitting,
  name,
  onChangeName,
  onClose,
  onSubmit,
  visible,
}: NewCollectionModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova Coleta</Text>
            <Pressable
              disabled={isSubmitting}
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color="#8A8A8A" name="close" size={22} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <TextInput
            autoFocus
            editable={!isSubmitting}
            onChangeText={onChangeName}
            placeholder="Nome da Coleta"
            placeholderTextColor="#B0B0B0"
            returnKeyType="done"
            selectionColor={colors.orange}
            style={styles.input}
            value={name}
            onSubmitEditing={() => {
              if (!isSubmitting) {
                onSubmit();
              }
            }}
          />

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <Pressable
            disabled={isSubmitting}
            onPress={onSubmit}
            style={[styles.submitButton, isSubmitting ? styles.submitDisabled : null]}
          >
            <Text style={styles.submitLabel}>
              {isSubmitting ? 'Criando...' : 'Criar Coleta'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    maxWidth: 390,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  divider: {
    backgroundColor: '#E8E8E8',
    height: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  input: {
    borderColor: '#D8D8D8',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    height: 46,
    marginTop: 18,
    paddingHorizontal: 12,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 8,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    marginTop: 16,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
