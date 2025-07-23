import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/headers/Header';

const Addproduct = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [imagePath, setImagePath] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('simple');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesSnapshot = await firestore().collection('categories').get();
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);

        const restaurantsSnapshot = await firestore().collection('restaurants').get();
        const restaurantsList = restaurantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
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
        if (!response.didCancel && !response.error && response.assets?.length > 0) {
          setImagePath(response.assets[0].uri);
        }
      }
    );
  };

  const convertImageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
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

  const validateForm = () => {
    if (!name || !price || !categoryId  || !imagePath || !description) {
      Alert.alert('Error', 'Please fill all required fields (*)');
      return false;
    }
    if (isNaN(price) || (discountPrice && isNaN(discountPrice))) {
      Alert.alert('Error', 'Please enter valid prices');
      return false;
    }
    return true;
  };

  const saveProduct = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true);

      const base64Image = await convertImageToBase64(imagePath);
      if (!base64Image) {
        Alert.alert('Error', 'Image conversion failed');
        return;
      }

      await firestore().collection('items').add({
        name,
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
    <View style={styles.mainContainer}>
      {/* Header */}
      <Header title="Add product" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={setCategoryId}
              style={styles.picker}
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

         

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productType}
              onValueChange={setProductType}
              style={styles.picker}
              dropdownIconColor="#FF6B3C"
            >
              <Picker.Item label="Top Rated" value="topRated" />
              <Picker.Item label="Simple" value="simple" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter Product Name *"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.priceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Price *"
              keyboardType="numeric"
              placeholderTextColor="#888"
              value={price}
              onChangeText={setPrice}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Discounted Price"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={discountPrice}
              onChangeText={setDiscountPrice}
            />
          </View>

          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Product Description *"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.uploadText}>Product Image *</Text>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={handleImagePick}
            disabled={isUploading}
          >
            {imagePath ? (
              <Image source={{ uri: imagePath }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="photo-camera" size={40} color="#FF6B3C" />
                <Text style={styles.imageText}>
                  {isUploading ? 'Uploading...' : 'Tap to select image'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, isUploading && styles.disabledButton]} 
            onPress={saveProduct}
            disabled={isUploading}
          >
            <Text style={styles.buttonText}>
              {isUploading ? 'Saving Product...' : 'Add Product'}
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
    marginBottom: 20,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
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

export default Addproduct;