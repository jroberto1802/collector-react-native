import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { CollectionItem } from '../models/collections/CollectionItem';
import { formatCurrencyBrl } from '../models/collections/CollectionItem';
import { colors } from '../theme/colors';

type EditCollectionItemModalProps = {
  errorMessage: string;
  expirationDate: string;
  isGrade?: boolean;
  isLotSerial: boolean;
  isSubmitting: boolean;
  item: CollectionItem | null;
  lot: string;
  manufacturingDate: string;
  onClose: () => void;
  onExpirationDateChange: (value: string) => void;
  onLotChange: (value: string) => void;
  onManufacturingDateChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onSubmit: () => void;
  quantity: string;
  visible: boolean;
};

export function EditCollectionItemModal({
  errorMessage,
  expirationDate,
  isGrade = false,
  isLotSerial,
  isSubmitting,
  item,
  lot,
  manufacturingDate,
  onClose,
  onExpirationDateChange,
  onLotChange,
  onManufacturingDateChange,
  onQuantityChange,
  onSubmit,
  quantity,
  visible,
}: EditCollectionItemModalProps) {
  if (!item) {
    return null;
  }

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
            <Text style={styles.title}>Editar item</Text>
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

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.value}>{item.name}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <Text style={styles.label}>Código de Barras</Text>
                <Text style={styles.value}>{item.barcode || '-'}</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.label}>Referência</Text>
                <Text style={styles.value}>{item.reference || '-'}</Text>
              </View>
            </View>

            {isGrade ? (
              <View style={styles.gradeRow}>
                <View style={styles.gradeColumn}>
                  <Text style={styles.label}>Tamanho</Text>
                  <Text style={styles.value}>{item.size || '-'}</Text>
                </View>
                <View style={styles.gradeColumn}>
                  <Text style={styles.label}>Cor</Text>
                  <Text style={styles.value}>{item.color || '-'}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <Text style={styles.label}>Preço de Compra</Text>
                <Text style={styles.value}>
                  {formatCurrencyBrl(item.purchasePrice)}
                </Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.label}>Preço de Venda</Text>
                <Text style={styles.value}>
                  {formatCurrencyBrl(item.salePrice)}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              editable={!isSubmitting}
              keyboardType="decimal-pad"
              onChangeText={onQuantityChange}
              selectionColor={colors.orange}
              style={styles.quantityInput}
              value={quantity}
            />

            {isLotSerial ? (
              <>
                <Text style={styles.label}>Lote/Serial</Text>
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  onChangeText={onLotChange}
                  placeholder="Lote/Serial"
                  placeholderTextColor="#A8A8A8"
                  selectionColor={colors.orange}
                  style={styles.fieldInput}
                  value={lot}
                />

                <View style={styles.dateRow}>
                  <View style={styles.dateColumn}>
                    <Text style={styles.label}>Fabricação</Text>
                    <TextInput
                      editable={!isSubmitting}
                      keyboardType="number-pad"
                      maxLength={10}
                      onChangeText={onManufacturingDateChange}
                      placeholder="DD/MM/AAAA"
                      placeholderTextColor="#A8A8A8"
                      selectionColor={colors.orange}
                      style={styles.fieldInput}
                      value={manufacturingDate}
                    />
                  </View>
                  <View style={styles.dateColumn}>
                    <Text style={styles.label}>Validade</Text>
                    <TextInput
                      editable={!isSubmitting}
                      keyboardType="number-pad"
                      maxLength={10}
                      onChangeText={onExpirationDateChange}
                      placeholder="DD/MM/AAAA"
                      placeholderTextColor="#A8A8A8"
                      selectionColor={colors.orange}
                      style={styles.fieldInput}
                      value={expirationDate}
                    />
                  </View>
                </View>
              </>
            ) : null}

            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <Pressable
              disabled={isSubmitting}
              onPress={onSubmit}
              style={[
                styles.saveButton,
                isSubmitting ? styles.saveDisabled : null,
              ]}
            >
              <Text style={styles.saveLabel}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Text>
            </Pressable>
          </ScrollView>
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
    maxHeight: '88%',
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
    marginBottom: 14,
    marginTop: 14,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 10,
  },
  value: {
    color: colors.text,
    fontSize: 14,
  },
  quantityInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    height: 46,
    marginTop: 6,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  fieldInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    color: colors.text,
    fontSize: 14,
    height: 46,
    marginTop: 6,
    paddingHorizontal: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoColumn: {
    flex: 1,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeColumn: {
    flex: 1,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 8,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    marginTop: 18,
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
