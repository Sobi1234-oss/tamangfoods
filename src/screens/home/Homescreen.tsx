import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeHeader from '../../components/headers/HomeHeader';
import useUserStore from '../../components/store/UserStore';
const { width } = Dimensions.get('window');

type Product = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageBase64: string;
  categoryId: string;
  rating?: number;
};

const Homescreen = () => {
  const navigation = useNavigation();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Color palette for categories
  const categoryColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292'];
  const user = useUserStore(state => state.user);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  useEffect(() => {
  console.log('User info:', user);
  console.log('Is Authenticated:', isAuthenticated);
}, [user, isAuthenticated]);
  useFocusEffect(
  useCallback(() => {
    const fetchData = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        setUserName(name || 'Guest');

        const [categoriesSnapshot, productsSnapshot] = await Promise.all([
          firestore().collection('categories').get(),
          firestore().collection('items').orderBy('createdAt', 'desc').get()
        ]);

        const loadedCategories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));

        setCategories([{ id: 'all', name: 'All' }, ...loadedCategories]);

        const loadedProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          imageBase64: doc.data().imageBase64 || ''
        } as Product));

        setAllProducts(loadedProducts);
        setDisplayProducts(loadedProducts.slice(0, 10));
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])
);

  useEffect(() => {
    // Filter products based on search and category
    let filtered = allProducts;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.categoryId === selectedCategory
      );
    }

    setDisplayProducts(filtered.slice(0, 10));
  }, [searchQuery, selectedCategory, allProducts]);



  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSelectedCategory(null);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    setSearchQuery('');
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetais', { product: item })}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>

        <View style={styles.priceContainer}>

          <Text style={styles.originalPrice}>Rs {item.price.toFixed(0)}</Text>

        </View>

        {item.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFA000" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item, index }: { item: { id: string, name: string }, index: number }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor: selectedCategory === item.id
            ? '#FF6D42'
            : categoryColors[(index + 1) % categoryColors.length], // +1 to skip "All" color
          shadowColor: categoryColors[(index + 1) % categoryColors.length],
        }
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text style={styles.categoryText}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFF9F2', '#FFEBD6']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6D42" />
        <Text style={styles.loadingText}>Loading delicious options...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        navigation={navigation}
        onProfilePress={() => navigation.openDrawer()}
        onSearch={handleSearch}
      />

      <LinearGradient colors={['#FFF9F2', '#FFEBD6']} style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Greeting Section */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              {getGreeting()} <Text style={styles.greetingText1}>, {user?.fullName }
            </Text>
            </Text>
            <Text style={styles.subtitle}>What would you like to order today?</Text>
          </View>

          {/* Categories Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.titleUnderline} />
            <FlatList
              horizontal
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          </View>

          {/* Products Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'all'
                  ? 'All Products'
                  : selectedCategory
                    ? `${categories.find(c => c.id === selectedCategory)?.name || ''} Products`
                    : searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : 'Popular Products'}
              </Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Products', {
                  categoryId: selectedCategory,
                  searchQuery: searchQuery
                })}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <Icon name="chevron-right" size={18} color="#FF6D42" />
              </TouchableOpacity>
            </View>
            <View style={styles.titleUnderline} />

            {displayProducts.length > 0 ? (
              <FlatList
                data={displayProducts}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productsRow}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={50} color="#FF6D42" />
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            )}
          </View>

          {/* Special Offers Section - Only show when no category/search is selected */}
          {!selectedCategory && !searchQuery && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Special Offers</Text>
              </View>
              <View style={styles.titleUnderline} />

              <FlatList
                data={[...allProducts].filter(p => p.discountPrice).slice(0, 4)}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productsRow}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No special offers available</Text>
                }
              />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6D42',
    marginBottom: 50
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 5,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontFamily: 'Quicksand-Medium',
    color: '#FF6D42',
    fontSize: 16,
  },
  greetingContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  greetingText: {
    fontSize: 28,
    fontFamily: 'Quicksand-Bold',
    color: '#FF6D42',
    marginBottom: 5,
  },
    greetingText1: {
    fontSize: 28,
    fontFamily: 'Quicksand-Bold',
    color: '#42d3ffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand-Medium',
    color: '#666',
  },
  sectionContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Quicksand-Bold',
    color: '#333',
  },
  titleUnderline: {
    height: 2,
    width: 50,
    backgroundColor: '#c2601bff',
    borderRadius: 3,
    marginBottom: 30, top: 5
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#FF6D42',
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    marginRight: 2,
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryItem: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    marginRight: 12,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryText: {
    color: 'white',
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: width * 0.44,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    height: 300
  },
  productImage: {
    width: '100%',
    height: 220,
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  price: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#FF6D42',
  },
  discountedPrice: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#FF6D42',
    marginRight: 5,
  },
  originalPrice: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#FF6D42',

  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Quicksand-Medium',
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});

export default Homescreen;