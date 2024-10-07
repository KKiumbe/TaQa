import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore'

const HomeScreen = () => {

  const { currentUser } = useAuthStore(); // Get the current user from the store
  const totalCustomers = 5000;
  const paidCustomers = 3000;
  const unpaidCustomers = totalCustomers - paidCustomers;

  const handleRemindCustomers = () => {
    console.log('Reminder sent to unpaid customers');
  };

  return (
    <View style={styles.container}>
      {/* Welcome Message */}
      <Text style={styles.welcomeMessage}>
        Welcome {currentUser?.firstName || 'User'}!
      </Text>

      {/* Update Profile Button */}
      <Button
        mode="outlined"
        onPress={() => router.navigate('/profile')} // Navigate to Profile Screen
        style={styles.updateProfileButton}
      >
        Update Profile
      </Button>

      {/* Total Customers Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Total Customers</Text>
          <Text style={styles.cardValue}>{totalCustomers}</Text>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Paid Customers Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Paid Customers</Text>
          <Text style={styles.cardValue}>{paidCustomers}</Text>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Unpaid Customers Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Unpaid Customers</Text>
          <Text style={styles.cardValue}>{unpaidCustomers}</Text>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Remind Button */}
      <Button
        mode="contained"
        onPress={handleRemindCustomers}
        style={styles.remindButton}
      >
        Remind Customers to Pay
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
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007BFF',
    padding:30
  },
  updateProfileButton: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    color: '#555555',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333333',
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#CCCCCC',
  },
  remindButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF5722',
  },
});

export default HomeScreen;
