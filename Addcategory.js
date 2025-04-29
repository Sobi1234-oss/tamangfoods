import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

const Addcategory = () => {
  const [name, setName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Function to handle image selection
  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error && response.assets?.length > 0) {
        const uri = response.assets[0].uri;
        convertImageToBase64(uri);
      }
    });
  };

  // Function to convert image to base64
  const convertImageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setImageBase64(base64String);
    } catch (error) {
      console.error('Conversion error:', error);
      Alert.alert('Error', 'Failed to convert image to base64');
    }
  };

  // Function to add category with image
  const addCategory = async () => {
    if (isUploading) return;
    if (!name || !imageBase64) {
      Alert.alert('Error', 'Please enter category name and select an image');
      return;
    }

    setIsUploading(true);

    try {
      await firestore().collection('categories').add({
        name,
        imageBase64,
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      setName('');
      setImageBase64('');
      Alert.alert('Success', 'Category added successfully!');
    } catch (error) {
      Alert.alert('Error', `Save failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.Text}>Add Category:</Text>

      {/* Category Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Category Name *"
        placeholderTextColor="gray"
        value={name}
        onChangeText={setName}
      />

      {/* Image Picker */}
      <TouchableOpacity 
        style={styles.imagePicker} 
        onPress={handleImagePick}
        disabled={isUploading}
      >
        {imageBase64 ? (
          <Image 
            source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.imageText}>
            {isUploading ? 'Uploading...' : 'Select Category Image *'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Add Category Button */}
      <TouchableOpacity 
        style={[styles.button, isUploading && styles.disabledButton]} 
        onPress={addCategory}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>
          {isUploading ? 'Saving...' : 'Add Category'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    justifyContent: 'start',
  },
  input: {
    height: 40,
    borderColor: 'grey',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    top: 20,
  },
  imagePicker: {
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',top:20
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageText: {
    color: '#666',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    top: 20,
  },
  disabledButton: {
    backgroundColor: '#ffd699',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  Text: {
    color: 'black',
    fontWeight: '600',
    fontSize: 20,
    bottom: 10,
    top: 5,
  },
});

export default Addcategory;