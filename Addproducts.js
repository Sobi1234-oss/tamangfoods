import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

const Addproduct = () => {
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
    if (!name || !price || !categoryId || !restaurantId || !imagePath || !description) {
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoryId}
            onValueChange={setCategoryId}
            style={styles.picker}
            dropdownIconColor="gray"
          >
            <Picker.Item label="Select Category *" value="" color="gray" />
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
            selectedValue={restaurantId}
            onValueChange={setRestaurantId}
            style={styles.picker}
            dropdownIconColor="gray"
          >
            <Picker.Item label="Select Restaurant *" value="" color="gray" />
            {restaurants.map((restaurant) => (
              <Picker.Item 
                key={restaurant.id} 
                label={restaurant.name} 
                value={restaurant.id} 
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={productType}
            onValueChange={setProductType}
            style={styles.picker}
            dropdownIconColor="gray"
          >
            <Picker.Item label="Top Rated" value="topRated" />
            <Picker.Item label="Simple" value="simple" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter Product Name *"
          placeholderTextColor="black"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Price *"
          keyboardType="numeric"
          placeholderTextColor="black"
          value={price}
          onChangeText={setPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Discounted Price"
          placeholderTextColor="black"
          keyboardType="numeric"
          value={discountPrice}
          onChangeText={setDiscountPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter product description *"
          placeholderTextColor="black"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={handleImagePick}
          disabled={isUploading}
        >
          {imagePath ? (
            <Image source={{ uri: imagePath }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>
              {isUploading ? 'Uploading...' : 'Select Product Image *'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isUploading && styles.disabledButton]} 
          onPress={saveProduct}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>
            {isUploading ? 'Saving...' : 'Add Product'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000',
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

export default Addproduct;