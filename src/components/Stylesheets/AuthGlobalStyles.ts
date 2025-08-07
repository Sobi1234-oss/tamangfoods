import { StyleSheet } from 'react-native';

export const AuthGlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7a7a7a',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  icon: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  passwordToggle: {
    padding: 5,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  linkText: {
    color: '#7a7a7a',
    fontSize: 15,
  },
  primaryLink: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 15,
  },
  forgotPasswordText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 14,
  },
  dividerContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: -10
  },
  dividerText: {
    color: '#7a7a7a',
    fontSize: 15,
  }
});