// src/ui/primitives/forms.ts
import { StyleSheet } from 'react-native';

const forms = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: '#fff',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  fieldGroup: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },

  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },

  touchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  touchInputText: {
    fontSize: 16,
    color: '#111827',
  },

  helper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },

  error: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6,
  },

  row: {
    flexDirection: 'row',
    // gap: 10,
  },

  rowItem: {
    flex: 1,
  },

  actionsRow: {
    marginTop: 18,
  },

  // ✅ new: fixed-width column for country code
  rowItemFixed: {
    width: 96, // tweak 88–120 as you like
    flexGrow: 0,
    flexShrink: 0,
  },

  // ✅ new: simple spacing between the two columns
  rowSpacerRight: {
    marginRight: 10,
  },

  rowItemNarrow: {
    flexBasis: 100, // ~100px wide
    flexGrow: 0,
    flexShrink: 0,
  },

  // Simple modal list for gender
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 28,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default forms;
