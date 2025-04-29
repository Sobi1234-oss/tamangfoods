// screens/User/NotificationScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;
    const subscriber = firestore()
      .collection('notifications')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const notificationsData = [];
        querySnapshot.forEach(doc => {
          notificationsData.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(notificationsData);
      });

    return () => subscriber();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.body}</Text>
            <Text style={{ fontSize: 12, color: 'gray' }}>
              {new Date(item.createdAt?.toDate()).toLocaleString()}
            </Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default NotificationScreen;