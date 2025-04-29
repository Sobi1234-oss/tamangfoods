import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ComplaintForm = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lab, setLab] = useState('');

  const submitComplaint = async () => {
    try {
      const user = auth().currentUser;
      await firestore().collection('complaints').add({
        title,
        description,
        lab,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: user.uid,
        userName: user.email,
      });
      Alert.alert('Success', 'Complaint submitted successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Complaint Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Lab Name/Number"
        value={lab}
        onChangeText={setLab}
      />
      <TextInput
        placeholder="Detailed Description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Submit Complaint" onPress={submitComplaint} />
    </View>
  );
};

export default ComplaintForm;