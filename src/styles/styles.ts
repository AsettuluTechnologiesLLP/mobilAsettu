import { StyleSheet } from 'react-native';

const GLOBAL_STYLES = StyleSheet.create({
  // Parent container for all screens
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Scroll container with padding and alignment
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 200,
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  // Logo style (Asettu logo)
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'center',
    marginBottom: 30,
  },
  
  // Content container for aligning elements
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  // Welcome text style
  welcomeText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
  // Input container with country code and phone number input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    maxWidth: 300,
    alignSelf: 'center',
  },
  // Error message text style
  errorText: {
    color: 'red',
    fontSize: 15,
    marginTop: 0,
    marginBottom: 15,
    textAlign: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  // Button container
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    height: 45,
    maxWidth: 300,
    alignSelf: 'center',
  },
  // Button text
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // OTP Input Container
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  // Individual OTP Box
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  // OTP Message text style
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  // Timer text style for Resend OTP countdown
  timer: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  // Resend OTP text style
  resendText: {
    textAlign: 'center',
    color: '#4A90E2',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});

export default GLOBAL_STYLES;