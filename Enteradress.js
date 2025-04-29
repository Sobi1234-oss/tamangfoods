import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Enteradress = () => {
  const navigation = useNavigation();
  const [address, setAddress] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const handleUseCurrentLocation = () => {
    // Get current location logic here
    console.log('Getting current location...');
    setAddress('Current Location'); // Set current location
    navigation.navigate('Homescreen', { selectedLocation: address });
  };

  const handleAddressChange = (text) => {
    setAddress(text);
    // Simulated location suggestions
    const suggestions = [
      '123 Main Street, City',
      '456 Park Avenue, Town',
      '789 Ocean Drive, Beach City',
      '321 Hill Road, Mountain View',
    ];
    setLocationSuggestions(text ? suggestions.filter(item => 
      item.toLowerCase().includes(text.toLowerCase())
    ) : []);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.heading}>Find restaurants near you</Text>
        <Text style={styles.orText}>Please enter your location or allow access to your location to find restaurants near you.</Text>
        
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={handleUseCurrentLocation}
        >
          <MaterialIcons name="my-location" size={20} color="orange" />
          <Text style={styles.locationButtonText}>Use current location</Text>
        </TouchableOpacity>


        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.addressInput}
            placeholder="Enter a new address"
            placeholderTextColor="#999"
            value={address}
            onChangeText={handleAddressChange}
          />
        </View>

        {locationSuggestions.length > 0 && (
          <ScrollView style={styles.suggestionsContainer}>
            {locationSuggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setAddress(item);
                  setLocationSuggestions([]);
                }}
              >
                <MaterialIcons name="location-pin" size={20} color="#666" />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('Homescreen')}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        By continuing, you agree to our <Text style={styles.link}>Terms & Conditions</Text> and {' '}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  locationButtonText: {
    color: 'orange',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  addressInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    paddingLeft: 40,
    fontSize: 16,
  },
  suggestionsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  suggestionText: {
    color: '#333',
    fontSize: 14,
  },
  orText: {
    textAlign: 'start',
    color: '#666',
    marginVertical: 0,marginBottom: 30
  },
  continueButton: {
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 'auto',
    paddingVertical: 20,
  },
  link: {
    color: 'orange',
    fontWeight: 'bold',
  },
});

export default Enteradress;