import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_PLACES_API_KEY = 'AIzaSyCL71KSTPnq2YGYm2NJjy69jk7n1lX3Llo'; // Apni API Key yahan paste karo

const LocationSearchScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState('');

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search for a location..."
        minLength={2}
        fetchDetails={true}
        onPress={(data, details = null) => {
          setSelectedLocation(data.description);
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'en',
          types: 'geocode', // Cities aur address results ke liye
        }}
        styles={{
          textInputContainer: styles.inputContainer,
          textInput: styles.input,
          listView: styles.suggestionsList,
        }}
      />

      {selectedLocation ? (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.selectedLocationText}>Selected: {selectedLocation}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={() => alert('Location Saved: ' + selectedLocation)}>
        <Text style={styles.buttonText}>Save Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  input: {
    height: 45,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    color: 'black',
  },
  suggestionsList: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedLocationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedLocationText: {
    color: 'black',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LocationSearchScreen;
