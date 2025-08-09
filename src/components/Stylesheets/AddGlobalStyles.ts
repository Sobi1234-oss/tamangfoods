import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Common Container Styles
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6B3C',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 24,
  },
  backButton: {
    padding: 5,
  },

  // Section Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B3C',
    marginBottom: 20,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  // Input Styles
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  // Picker Styles
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },

  // Image Upload Styles
  uploadText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  imagePicker: {
    height: 180,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Button Styles
  button: {
    backgroundColor: '#FF6B3C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#FF6B3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: '#ff9d7c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonIcon: {
    marginLeft: 10,
  },

  // Add Screen Specific Styles
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  addButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: '45%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
    marginTop: 10,
  },
});