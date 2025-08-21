// src/ui/primitives/avatar.ts
import { StyleSheet } from 'react-native';

const avatar = StyleSheet.create({
  // Grid (kept in case you reuse it elsewhere)
  grid: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  itemWrap: {
    width: '25%', // 4 columns
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  item: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  itemSelected: {
    borderColor: '#2563EB',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
    marginBottom: 6,
  },

  // Horizontal chooser (new)
  bar: {
    paddingVertical: 6,
  },
  barItemWrap: {
    marginRight: 10,
  },
  barItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barEmpty: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  barImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
  },
});

export default avatar;
