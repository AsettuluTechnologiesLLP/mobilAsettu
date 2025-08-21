import { StyleSheet } from 'react-native';

import { COLORS, SIZES } from './theme';

const profileTabStyles = StyleSheet.create({
  // ✅ Main Container for Profile Screen
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ✅ Header Section with Profile Picture, Name, and Edit Icon
  profileHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.paddingSmall,
    paddingTop: SIZES.paddingLarge,
    backgroundColor: COLORS.background,
  },

  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SIZES.marginSmall,
  },

  userInfoContainer: {
    flex: 1,
  },

  userName: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  userPhone: {
    fontSize: SIZES.fontSmall,
    color: COLORS.iconUnSelected,
    marginTop: 4,
  },

  // ✅ Divider between Profile Header and List of Options
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.marginSmall,
    width: '90%',
    alignSelf: 'center',
  },

  // ✅ List Container (Padding Only)
  listContainer: {
    paddingHorizontal: SIZES.paddingSmall,
    paddingTop: SIZES.paddingMedium,
  },

  // ✅ Option Row Container (No Borders Anymore)
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingSmall,
  },

  optionInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionLabel: {
    marginLeft: SIZES.marginSmall,
    fontSize: SIZES.fontLarge,
    color: COLORS.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  changePhotoText: {
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    color: "red",
  },
  saveButton: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  
});

export default profileTabStyles;
