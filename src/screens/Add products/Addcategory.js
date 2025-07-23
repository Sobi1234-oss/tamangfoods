import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/headers/Header';
const Addcategory = ({ navigation }) => {
  const [name, setName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImagePick = () => {
    launchImageLibrary(
      { 
        mediaType: 'photo', 
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000 
      }, 
      (response) => {
        if (!response.didCancel && !response.error && response.assets?.length > 0) {
          const uri = response.assets[0].uri;
          convertImageToBase64(uri);
        }
      }
    );
  };

  const convertImageToBase64 = async (uri) => {
    try {
      setIsUploading(true);
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
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

 const addCategory = async () => {
  if (!name || !imageBase64) {
    Alert.alert('Required', 'Please enter category name and select an image');
    return;
  }

  setIsUploading(true);

  try {
    
    const snapshot = await firestore()
      .collection('categories')
      .where('name', '==', name.trim())
      .get();

    if (!snapshot.empty) {
      Alert.alert('Duplicate', 'Category already exists with this name.');
      setIsUploading(false);
      return;
    }

    
    await firestore().collection('categories').add({
      name: name.trim(),
      imageBase64,
      createdAt: firestore.FieldValue.serverTimestamp()
    });

    setName('');
    setImageBase64('');
    Alert.alert('Success', 'Category added successfully!');
  } catch (error) {
    console.error('Save error:', error);
    Alert.alert('Error', 'Failed to save category. Please try again.');
  } finally {
    setIsUploading(false);
  }
};

  return (
    <View style={styles.mainContainer}>
        <Header title="Add Category" showBack={true} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Category Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Category Name *"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.uploadLabel}>Category Image *</Text>
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
              <View style={styles.imagePlaceholder}>
                <Icon 
                  name={isUploading ? "cloud-upload" : "add-a-photo"} 
                  size={40} 
                  color="#FF6B3C" 
                />
                <Text style={styles.imageText}>
                  {isUploading ? 'Processing Image...' : 'Tap to select image'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, isUploading && styles.disabledButton]} 
            onPress={addCategory}
            disabled={isUploading}
          >
            <Text style={styles.buttonText}>
              {isUploading ? 'Adding Category...' : 'Add Category'}
            </Text>
            <Icon name="add-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B3C',
    marginBottom: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 25,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  uploadLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  imagePicker: {
    height: 180,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
});

export default Addcategory;