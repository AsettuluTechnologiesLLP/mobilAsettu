import { StyleSheet } from "react-native";

const ProfileTabContentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 40,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: "#4A90E2",
    marginRight: 12,
    resizeMode: "cover",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileAddress: {
    fontSize: 14,
    color: "#666",
    maxWidth: 200,
    lineHeight: 18,
  },
  profileOptionsContainer: {
    marginTop: 10,
  },
  profileOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  optionLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
});

export default ProfileTabContentStyles;
