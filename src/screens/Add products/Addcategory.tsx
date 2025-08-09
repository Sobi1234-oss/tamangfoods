import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/headers/Header';
import { globalStyles } from '../../components/Stylesheets/AddGlobalStyles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigations/Types';

type AddCategoryProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Addcategory'>;
};

const Addcategory: React.FC<AddCategoryProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

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
          if (uri) convertImageToBase64(uri);
        }
      }
    );
  };

  const convertImageToBase64 = async (uri: string) => {
    try {
      setIsUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
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
    <View style={globalStyles.mainContainer}>
      <Header title="Add Category" showBack={true} />
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <View style={globalStyles.container}>
          <Text style={globalStyles.sectionTitle}>Category Details</Text>

          <TextInput
            style={globalStyles.input}
            placeholder="Category Name *"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <Text style={globalStyles.uploadText}>Category Image *</Text>
          <TouchableOpacity 
            style={globalStyles.imagePicker} 
            onPress={handleImagePick}
            disabled={isUploading}
          >
            {imageBase64 ? (
              <Image 
                source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} 
                style={globalStyles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={globalStyles.imagePlaceholder}>
                <Icon 
                  name={isUploading ? "cloud-upload" : "add-a-photo"} 
                  size={40} 
                  color="#FF6B3C" 
                />
                <Text style={globalStyles.imageText}>
                  {isUploading ? 'Processing Image...' : 'Tap to select image'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.button, isUploading && globalStyles.disabledButton]} 
            onPress={addCategory}
            disabled={isUploading}
          >
            <Text style={globalStyles.buttonText}>
              {isUploading ? 'Adding Category...' : 'Add Category'}
            </Text>
            <Icon name="add-circle-outline" size={20} color="#fff" style={globalStyles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Addcategory;