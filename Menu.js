import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - (CARD_MARGIN * 5)) / 2; // Adjusted for 2 items per row

const Menu = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeCategories = firestore()
      .collection('categories')
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          imageBase64: doc.data().imageBase64 || '', // Assuming categories have images
        }));
        setCategories(categoriesList);
        setLoading(false);
      });

    return () => {
      unsubscribeCategories();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Categories Heading */}
      <Text style={styles.heading}>Categories</Text>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2} // Display 2 items per row
        contentContainerStyle={styles.categoriesGrid}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryCard} 
            onPress={() => navigation.navigate('CategoryDetails', { category: item })}
          >
            <Image 
              source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }} 
              style={styles.categoryImage}
              resizeMode="contain"
            />
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No categories found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 10,
    color: '#333',
  },
  categoriesGrid: {
    paddingBottom: 20,
  },
  categoryCard: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    overflow: 'hidden', // Ensure the image doesn't overflow
  },
  categoryImage: {
    width: '100%',
    height: 120, // Fixed height for the image
    backgroundColor: '#f0f0f0', // Placeholder color
  },
  categoryDetails: {
    padding: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  }
});

export default Menu;