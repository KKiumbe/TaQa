import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TextInput, Button, Snackbar, List, Text } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const CreateInvoice = () => {
  const navigation = useNavigation();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Store selected customer

  const handleSearchCustomer = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${BASEURL}/search-customers`, {
        params: { query: searchTerm },
      });
      setSearchResults(response.data); // Assume the response contains an array of customers
    } catch (error) {
      console.error('Error searching customers:', error);
      setSnackbarMessage('Error searching customers.');
      setSnackbarOpen(true);
    }
  };

  const handleCreateInvoice = async () => {
    // Validate inputs before sending to the API
    if (!description || !amount || !quantity || !selectedCustomer) {
      setSnackbarMessage('Please fill in all fields and select a customer.');
      setSnackbarOpen(true);
      return;
    }

    const invoiceData = {
      customerId: selectedCustomer.id, // Use selected customer ID
      invoiceItemsData: [
        {
          description,
          amount: parseFloat(amount),
          quantity: parseInt(quantity),
        },
      ],
    };

    const token = await AsyncStorage.getItem('user');
    try {
      const response = await axios.post(`${BASEURL}/invoices/`, invoiceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSnackbarMessage('Invoice created successfully!');
      setSnackbarOpen(true);

      // Navigate to the invoice details page using the created invoice ID
      const createdInvoiceId = response.data.newInvoice.id;
      console.log(response.data); // Ensure this captures the created invoice ID
      console.log(createdInvoiceId);
      router.navigate(`/invoices/${createdInvoiceId}/`); // Ensure 'InvoiceDetails' matches your route name

    } catch (error) {
      console.error('Error creating invoice:', error);
      setSnackbarMessage('Failed to create invoice. Please try again.');
      setSnackbarOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Customer Search Input */}
      <TextInput
        label="Search Customer"
        value={searchTerm}
        onChangeText={(text) => {
          setSearchTerm(text);
          handleSearchCustomer();
        }}
        style={styles.input}
      />

      {/* Search Results List */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={`${item.firstName} ${item.lastName}`}
              onPress={() => {
                setSelectedCustomer(item); // Set selected customer
                setSearchTerm(''); // Clear search input
                setSearchResults([]); // Clear search results
              }}
            />
          )}
        />
      )}

      {/* Display Selected Customer Details */}
      {selectedCustomer && (
        <View style={styles.customerDetails}>
          <Text>Name: {`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</Text>
          <Text>Phone: {selectedCustomer.phoneNumber}</Text>
          <Text>Category: {selectedCustomer.category}</Text>
          <Text>Monthly Charge: {selectedCustomer.monthlyCharge}</Text>
        </View>
      )}

      {/* Invoice Item Inputs */}
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleCreateInvoice}>
        Create Invoice
      </Button>

      <Snackbar
        visible={snackbarOpen}
        onDismiss={() => setSnackbarOpen(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 10,
  },
  customerDetails: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
});

export default CreateInvoice;
