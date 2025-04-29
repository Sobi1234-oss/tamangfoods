import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Restaurants = () => {
  const navigation = useNavigation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('restaurants')
      .onSnapshot(snapshot => {
        const restaurantList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          imageBase64: doc.data().imageBase64 || '',
        }));
        setRestaurants(restaurantList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const fetchSuggestions = async () => {
        try {
          const snapshot = await firestore()
            .collection('restaurants')
            .where('name', '>=', searchQuery)
            .where('name', '<=', searchQuery + '\uf8ff')
            .get();
          
          const suggestionList = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            location: doc.data().location,
          }));
          setSuggestions(suggestionList);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const filteredRestaurants = searchQuery.trim() === '' 
    ? restaurants 
    : restaurants.filter(restaurant => {
        const nameMatch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
        const locationMatch = restaurant.location.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || locationMatch;
      });

  const renderRestaurantItem = ({ item }) => {
    const cityName = item.location.split(',')[0].trim();

    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('Resturantdetails', { restaurant: item })}
      >
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
          style={styles.restaurantImage}
          resizeMode="contain"
        />
        <View style={styles.restaurantDetails}>
          <Text style={styles.restaurantName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.iconTextContainer}>
            <Icon name="location-on" size={16} color="#4CAF50" />
            <Text style={styles.restaurantLocation}>{cityName}</Text>
          </View>
          <View style={styles.iconTextContainer}>
            <Icon name="star" size={16} color="#FFA000" />
            <Text style={styles.restaurantRating}>{item.rating || '4.5'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        setSearchQuery(item.name);
        setSuggestions([]);
      }}
    >
      <Text style={styles.suggestionText}>{item.name} - {item.location.split(',')[0]}</Text>
    </TouchableOpacity>
  );

  const getItemLayout = (data, index) => ({
    length: 250,
    offset: 250 * index,
    index,
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
   

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or city..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          clearButtonMode="while-editing"
        />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="always"
          />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.restaurantList}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',padding:10
  },
 
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    margin: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    paddingVertical: 0,
  },
  suggestionContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  restaurantList: {
    paddingBottom: 20,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'orange',
  },
  restaurantImage: {
    width: '100%',
    height: 180,
  },
  restaurantDetails: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  restaurantRating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
});

export default Restaurants;