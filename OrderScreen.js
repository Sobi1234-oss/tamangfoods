import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator ,Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {PermissionsAndroid} from 'react-native';

const OrderScreen = ({ navigation }) => {

  useEffect(() => {
      requestpermissionandroid();
  }, []);


  const requestpermissionandroid = async() => {
  const granted=await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  if(granted===PermissionsAndroid.RESULTS.GRANTED){
    Alert.alert('permission granted');
  }
  else
  Alert.alert('permission denied');
  };


  return (
    <View style={styles.container}>
      <Text>app</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  completedOrder: {
    backgroundColor: '#f0fff0',
    borderColor: '#90EE90',
  },
  rejectedOrder: {
    backgroundColor: '#fff0f0',
    borderColor: '#FFCCCB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderStatus: {
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusAccepted: {
    backgroundColor: '#CCE5FF',
    color: '#004085',
  },
  statusCompleted: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  statusRejected: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  customerName: {
    fontSize: 14,
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  orderTotal: {
    fontSize: 16,
    color: 'green',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemsPreview: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  itemPreviewText: {
    fontSize: 14,
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
});

export default OrderScreen;