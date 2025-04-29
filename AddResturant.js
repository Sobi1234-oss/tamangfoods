import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'; // Import react-native-fs

const AddRestaurant = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [location, setLocation] = useState('');
  const [imageBase64, setImageBase64] = useState(''); // Change to store Base64
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Handle image pick and convert to Base64
  const handleImagePick = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (!response.didCancel && !response.error && response.assets?.length > 0) {
        const uri = response.assets[0].uri;
        // Convert image to Base64
        const base64 = await RNFS.readFile(uri, 'base64');
        setImageBase64(base64); // Set Base64 string
      }
    });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!name || !rating || !location || !imageBase64) {
      Alert.alert('Error', 'Please fill all required fields (*)');
      return false;
    }
    if (isNaN(rating) || rating < 0 || rating > 5) {
      Alert.alert('Error', 'Please enter a valid rating between 0 and 5');
      return false;
    }
    return true;
  };

  // Save restaurant to Firestore
  const saveRestaurant = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      await firestore().collection('restaurants').add({
        name,
        rating: Number(rating),
        location,
        imageBase64, // Save Base64 string
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Reset form
      setName('');
      setRating('');
      setLocation('');
      setImageBase64(''); // Reset Base64 string
      setSuggestions([]);

      Alert.alert('Success', 'Restaurant added successfully!');
    } catch (error) {
      console.error('Save restaurant error:', error);
      Alert.alert('Error', 'Failed to save restaurant');
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch location suggestions
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Restaurant Name *"
          placeholderTextColor="black"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Rating (0-5) *"
          keyboardType="numeric"
          placeholderTextColor="black"
          value={rating}
          onChangeText={setRating}
        />

        {/* Custom Location Search */}
        <TextInput
          style={styles.input}
          placeholder="Search Location *"
          placeholderTextColor="black"
          value={location}
          onChangeText={(text) => {
            setLocation(text);
            fetchLocationSuggestions(text);
          }}
        />
        
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                setLocation(item.display_name);
                setSuggestions([]);
              }}>
                <Text style={styles.suggestionText}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handleImagePick}
          disabled={isUploading}
        >
          {imageBase64 ? (
            <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>
              {isUploading ? 'Uploading...' : 'Select Restaurant Image *'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isUploading && styles.disabledButton]}
          onPress={saveRestaurant}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>
            {isUploading ? 'Saving...' : 'Add Restaurant'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  innerContainer: {
    padding: 15,
    flexGrow: 1,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    color: 'black',
    marginBottom: 12,
  },
  suggestionsList: {
    maxHeight: 150,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
  },
  suggestionText: {
    padding: 10,
    backgroundColor: '#fff',
  },
  imagePicker: {
    height: 150,
    backgroundColor: '#dcdcdc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 10,
  },
  imageText: {
    color: '#696969',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  button: {
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ffd699',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddRestaurant;