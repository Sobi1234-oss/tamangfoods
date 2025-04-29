import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_PLACES_API_KEY = 'YOUR_API_KEY'; // Replace with your API key

const LocationSearchScreen = () => {
  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search"
        minLength={2}
        autoFocus={false}
        returnKeyType={'search'}
        fetchDetails={true}
        onPress={(data, details = null) => {
          console.log('Selected Location:', data.description);
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'en',
          types: '(cities)',
        }}
        styles={{
          textInputContainer: styles.inputContainer,
          textInput: styles.input,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 12,
  },
  input: {
    height: 40,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});

export default LocationSearchScreen;