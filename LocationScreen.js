import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const LocationScreen = ({ route }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const navigation = useNavigation();
  const { cartItems } = route.params;

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Fetch current location
  const fetchCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Error', 'Location permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => {
        Alert.alert('Error', 'Failed to fetch location');
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  useEffect(() => {
    if (currentLocation) {
      setManualLocation(`Lat: ${currentLocation.latitude}, Long: ${currentLocation.longitude}`);
    }
  }, [currentLocation]);

  const handleManualLocation = () => {
    if (manualLocation.trim() === '') {
      Alert.alert('Error', 'Please enter a valid location.');
      return;
    }
    Alert.alert('Success', `Location set to: ${manualLocation}`);
  };

  const saveOrderToFirestore = async (location) => {
    try {
      const orderData = {
        items: cartItems,
        location: location,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('orders').add(orderData);
      Alert.alert('Success', 'Order saved successfully!');
    } catch (error) {
      console.error('Error saving order: ', error);
      Alert.alert('Error', 'Failed to save order. Please try again.');
    }
  };

  const handleConfirmOrder = async () => {
    if (!currentLocation && manualLocation.trim() === '') {
      Alert.alert('Error', 'Please set a location before confirming the order.');
      return;
    }

    const location = currentLocation
      ? `Lat: ${currentLocation.latitude}, Long: ${currentLocation.longitude}`
      : manualLocation;

    // Save order to Firestore
    await saveOrderToFirestore(location);

    // Navigate to home or any other screen
    navigation.navigate('Homescreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Location</Text>

      <TouchableOpacity style={styles.locationButton} onPress={fetchCurrentLocation}>
        <Text style={styles.buttonText}>Use Current Location</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your location manually"
        value={manualLocation}
        onChangeText={setManualLocation}
      />

      <TouchableOpacity style={styles.locationButton} onPress={handleManualLocation}>
        <Text style={styles.buttonText}>Set Manual Location</Text>
      </TouchableOpacity>

      {mapRegion && (
        <MapView style={styles.map} region={mapRegion}>
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Your Location"
              description="This is your current location"
            />
          )}
        </MapView>
      )}

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
        <Text style={styles.confirmButtonText}>Confirm Order</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  locationButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  map: {
    height: 200,
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LocationScreen;