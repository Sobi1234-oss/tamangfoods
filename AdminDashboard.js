import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('complaints')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const complaintsData = [];
        querySnapshot.forEach(documentSnapshot => {
          complaintsData.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });
        setComplaints(complaintsData);
      });

    return () => subscriber();
  }, []);

  const updateStatus = async (id, status) => {
    await firestore().collection('complaints').doc(id).update({
      status,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  };

  const renderItem = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <Text>Title: {item.title}</Text>
      <Text>Lab: {item.lab}</Text>
      <Text>Status: {item.status}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity onPress={() => updateStatus(item.id, 'resolved')}>
          <Icon name="check-circle" size={30} color="green" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => updateStatus(item.id, 'in-progress')}>
          <Icon name="hourglass-empty" size={30} color="orange" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => updateStatus(item.id, 'rejected')}>
          <Icon name="cancel" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={complaints}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

export default AdminDashboard;