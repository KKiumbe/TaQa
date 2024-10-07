import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import useAuthStore from '../store/authStore';
import { router } from 'expo-router';


const ProfilePage = () => {

  const { currentUser, updateCurrentUser, loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser(); // Load user data when the component mounts
  }, []);

  const handleLogout = () => {
    updateCurrentUser(null); // This will log the user out by setting currentUser to null
    router.replace('/login'); // Navigate to the login screen after logout
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>No user data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text>Name: {`${currentUser.firstName} ${currentUser.lastName}`}</Text>
      <Text>Email: {currentUser.email}</Text>
      <Text>Phone: {currentUser.phoneNumber}</Text>
      <Text>County: {currentUser.county}</Text>
      <Text>Town: {currentUser.town}</Text>
      <Text>Gender: {currentUser.gender}</Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('ChangePassword')}
        style={styles.button}
      >
        Change Password
      </Button>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={[styles.button, styles.logoutButton]}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336', // Red color for logout
  },
});

export default ProfilePage;
