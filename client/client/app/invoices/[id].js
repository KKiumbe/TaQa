import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, DataTable, Snackbar, Button } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const InvoiceDetails = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Use useNavigation to get the navigation object

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Extract the invoice ID from the route parameters
  const { id } = route.params;

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('user');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${BASEURL}/invoices/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInvoice(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      setSnackbarMessage('Failed to fetch invoice details. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  // Set the page title when the component mounts
  useEffect(() => {
    if (invoice) {
      const title = `Invoice Details - ${invoice.invoiceNumber}`; // Customize this based on your logic
      navigation.setOptions({ title }); // Set the title using the navigation object
    }
  }, [invoice]);

  const handleCancelInvoice = async () => {
    const token = await AsyncStorage.getItem('user');
    try {
      const response = await axios.patch(`${BASEURL}/invoices/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbarMessage(response.data.message);
      setSnackbarOpen(true);
      fetchInvoiceDetails(); // Refetch to get the updated invoice state
    } catch (error) {
      setSnackbarMessage('Failed to cancel invoice. Please try again.');
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />;
  }

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Text>No invoice found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Invoice Details</Text>
      
      {/* Invoice Info */}
      <Text style={styles.subtitle}>Invoice Number: {invoice.invoiceNumber}</Text>
      <Text style={[styles.status, invoice.status === "CANCELLED" && styles.cancelledStatus]}>
        Status: {invoice.status}
      </Text>
      <Text>Invoice Amount: {invoice.invoiceAmount}</Text>
      <Text>Closing Balance: {invoice.closingBalance}</Text>
      <Text>Created At: {new Date(invoice.createdAt).toLocaleDateString()}</Text>
      <Text>Invoice Period: {new Date(invoice.invoicePeriod).toLocaleDateString()}</Text>
      
      {/* Indicate if the invoice is system-generated or user-generated */}
      <Text style={styles.subtitle}>
        Type: {invoice.isSystemGenerated ? 'System Generated' : 'User Generated'}
      </Text>

      {/* Customer Info */}
      <Text style={styles.subtitle}>Customer Info</Text>
      <Text>Name: {invoice.customer.firstName} {invoice.customer.lastName}</Text>
      <Text>Email: {invoice.customer.email}</Text>
      <Text>Phone Number: {invoice.customer.phoneNumber}</Text>
      <Text>Monthly Charge: {invoice.customer.monthlyCharge}</Text>
      <Text>Status: {invoice.customer.status}</Text>

      {/* Invoice Items */}
      <Text style={styles.subtitle}>Invoice Items</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Description</DataTable.Title>
          <DataTable.Title>Quantity</DataTable.Title>
          <DataTable.Title>Amount</DataTable.Title>
        </DataTable.Header>

        {invoice.items.map(item => (
          <DataTable.Row key={item.id}>
            <DataTable.Cell>{item.description}</DataTable.Cell>
            <DataTable.Cell>{item.quantity}</DataTable.Cell>
            <DataTable.Cell>{item.amount}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      {/* Snackbar for error messages */}
      <Snackbar
        visible={snackbarOpen}
        onDismiss={() => setSnackbarOpen(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Buttons for canceling the current invoice */}
      <Button 
        mode="contained" 
        onPress={handleCancelInvoice} 
        style={[styles.button, styles.cancelButton]}
        color="#f50057"
        disabled={invoice.status === "CANCELLED"}
      >
        Cancel Invoice
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#673ab7',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: 'light',
    marginVertical: 10,
  },
  status: {
    fontSize: 16,
  },
  cancelledStatus: {
    color: 'red',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    marginTop: 16,
  },
});

export default InvoiceDetails;
