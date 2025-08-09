import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/headers/Header';
import { globalStyles } from '../../components/Stylesheets/AddGlobalStyles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigations/Types';

type Category = {
  id: string;
  name: string;
};

type Restaurant = {
  id: string;
  name: string;
};

type AddProductProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Addproduct'>;
};

const Addproduct: React.FC<AddProductProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [imagePath, setImagePath] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [productType, setProductType] = useState<'simple' | 'topRated' | 'special'>('simple');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesSnapshot = await firestore().collection('categories').get();
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesList);

        const restaurantsSnapshot = await firestore().collection('restaurants').get();
        const restaurantsList = restaurantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Restaurant[];
        setRestaurants(restaurantsList);
      } catch (error) {
        console.error('Fetch data error:', error);
        Alert.alert('Error', 'Failed to fetch data. Please try again.');
      }
    };

    fetchData();
  }, []);
   
  const handleImagePick = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.5, maxWidth: 800, maxHeight: 800 },
      (response) => {
        if (!response.didCancel && !response.error && response.assets?.length > 0 && response.assets[0].uri) {
          setImagePath(response.assets[0].uri);
        }
      }
    );
  };

  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
      return base64String;
    } catch (error) {
      console.error('Conversion error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
      return null;
    }
  };

  const validateForm = (): boolean => {
    if (!name || !price || !categoryId || !imagePath || !description) {
      Alert.alert('Error', 'Please fill all required fields (*)');
      return false;
    }
    if (isNaN(Number(price))) {
      Alert.alert('Error', 'Please enter valid price');
      return false;
    }
    if (discountPrice && isNaN(Number(discountPrice))) {
      Alert.alert('Error', 'Please enter valid discount price');
      return false;
    }
    return true;
  };

  const saveProduct = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      const existing = await firestore()
        .collection('items')
        .where('name', '==', name.trim())
        .get();

      if (!existing.empty) {
        Alert.alert('Duplicate Product', 'A product with this name already exists.');
        setIsUploading(false);
        return;
      }

      const base64Image = await convertImageToBase64(imagePath);
      if (!base64Image) {
        Alert.alert('Error', 'Image conversion failed');
        return;
      }

      await firestore().collection('items').add({
        name: name.trim(),
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        categoryId,
        restaurantId,
        description,
        imageBase64: base64Image,
        type: productType,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Reset form
      setName('');
      setPrice('');
      setDiscountPrice('');
      setCategoryId('');
      setRestaurantId('');
      setImagePath('');
      setDescription('');
      setProductType('simple');

      Alert.alert('Success', 'Product added successfully!');
    } catch (error) {
      console.error('Save product error:', error);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={globalStyles.mainContainer}>
      <Header title="Add product" showBack={true} />

      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <View style={globalStyles.container}>
          <Text style={globalStyles.sectionTitle}>Product Information</Text>
          
          <View style={globalStyles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={(itemValue) => setCategoryId(itemValue as string)}
              style={globalStyles.picker}
              dropdownIconColor="#FF6B3C"
            >
              <Picker.Item label="Select Category *" value="" color="#888" />
              {categories.map((category) => (
                <Picker.Item 
                  key={category.id} 
                  label={category.name} 
                  value={category.id} 
                />
              ))}
            </Picker>
          </View>

          <View style={globalStyles.pickerContainer}>
            <Picker
              selectedValue={productType}
              onValueChange={(itemValue) => setProductType(itemValue as 'simple' | 'topRated' | 'special')}
              style={globalStyles.picker}
              dropdownIconColor="#FF6B3C"
            >
              <Picker.Item label="Top Rated" value="topRated" />
              <Picker.Item label="Simple" value="simple" />
              <Picker.Item label="Special" value="special" />
            </Picker>
          </View>

          <TextInput
            style={globalStyles.input}
            placeholder="Enter Product Name *"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <View style={globalStyles.priceContainer}>
            <TextInput
              style={[globalStyles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Price *"
              keyboardType="numeric"
              placeholderTextColor="#888"
              value={price}
              onChangeText={setPrice}
            />
            <TextInput
              style={[globalStyles.input, { flex: 1 }]}
              placeholder="Discounted Price"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={discountPrice}
              onChangeText={setDiscountPrice}
            />
          </View>

          <TextInput
            style={[globalStyles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Product Description *"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={globalStyles.uploadText}>Product Image *</Text>
          <TouchableOpacity 
            style={globalStyles.imagePicker} 
            onPress={handleImagePick}
            disabled={isUploading}
          >
            {imagePath ? (
              <Image source={{ uri: imagePath }} style={globalStyles.image} />
            ) : (
              <View style={globalStyles.imagePlaceholder}>
                <Icon name="photo-camera" size={40} color="#FF6B3C" />
                <Text style={globalStyles.imageText}>
                  {isUploading ? 'Uploading...' : 'Tap to select image'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.button, isUploading && globalStyles.disabledButton]} 
            onPress={saveProduct}
            disabled={isUploading}
          >
            <Text style={globalStyles.buttonText}>
              {isUploading ? 'Saving Product...' : 'Add Product'}
            </Text>
            <Icon name="add-circle-outline" size={20} color="#fff" style={globalStyles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Addproduct;