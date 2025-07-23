import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Header from '../../components/headers/Header';

interface CategoryType {
  id: string;
  name: string;
  imageUrl?: string;
}

const Menu = ({ navigation }: { navigation: any }) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292'];

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .onSnapshot(
        (querySnapshot) => {
          const categoriesData: CategoryType[] = [];
          querySnapshot.forEach((doc) => {
            categoriesData.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setCategories(categoriesData);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching categories:', err);
          setError('Failed to load categories');
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    navigation.navigate('CategorywiseProducts', { 
      categoryId,
      categoryName 
    });
  };

  const renderCategory = ({ item, index }: { item: CategoryType, index: number }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        { 
          backgroundColor: categoryColors[index % categoryColors.length],
          shadowColor: '#000',
          elevation: 8,
        }
      ]}
      onPress={() => handleCategoryPress(item.id, item.name)}
    >
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.categoryImage}
        />
      )}
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6D42" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Menu" showBack={true} onBackPress={() => navigation.navigate('MainApp', { screen: 'Homescreen' })} />
      <View style={styles.header}>
        <Text style={styles.title}>Our Menu</Text>
        <Text style={styles.subtitle}>Browse our delicious offerings</Text>
      </View>
      
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryTab: {
    flex: 0.48,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    height: 140,
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  categoryText: {
    color: 'white',
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6D42',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#666',
  },
});

export default Menu;