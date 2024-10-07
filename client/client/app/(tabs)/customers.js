import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { DataTable, TextInput, Modal, Button, Text, Portal, FAB, IconButton, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { FlatList } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';
import { Picker } from '@react-native-picker/picker'; // Importing Picker


const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const Customers = React.memo(() => {
  const [customers, setCustomers] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); 

  const navigation = useNavigation();
  const currentUser = useAuthStore(state => state.currentUser); // Access current user from Zustand store

  useEffect(() => {
    if (!currentUser) {
      router.push('login'); // Redirect to login if no user is found
    } else {
      fetchCustomers(); // Fetch customers only if user is authenticated
    }
  }, [currentUser]); // Run effect whenever currentUser changes

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BASEURL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setSnackbarMessage('Error fetching customers.');
      setSnackbarOpen(true);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    if (!searchQuery.trim()) {
      setSearchResults(customers); 
      setIsSearching(false); 
      return;
    }

    try {
      const isPhoneNumber = /^\d+$/.test(searchQuery);
      const response = await axios.get(`${BASEURL}/search-customers`, {
        params: {
          phone: isPhoneNumber ? searchQuery : undefined,
          name: !isPhoneNumber ? searchQuery : undefined,
        },
      });

      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
      setSnackbarMessage('Error searching customers.');
      setSnackbarOpen(true);
    } finally {
      setIsSearching(false); 
    }
  };

  const openViewModal = (customer) => {
    setSelectedCustomer(customer);
    setViewModalVisible(true);
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setEditModalVisible(true);
  };

  const handleSaveCustomer = async () => {
    setLoading(true);
    try {
      const url = selectedCustomer?.id
        ? `${BASEURL}/customers/${selectedCustomer.id}`
        : `${BASEURL}/customers`;
      const method = selectedCustomer?.id ? 'put' : 'post';

      await axios[method](url, {
        firstName: selectedCustomer.firstName,
        lastName: selectedCustomer.lastName,
        email: selectedCustomer.email || null,
        phoneNumber: selectedCustomer.phone,
        gender: selectedCustomer.gender,
        county: selectedCustomer.county || null,
        town: selectedCustomer.town || null,
        location: selectedCustomer.location
          ? `${selectedCustomer.location.latitude},${selectedCustomer.location.longitude}`
          : null,
        category: selectedCustomer.category || null,
        monthlyCharge: Number(selectedCustomer.monthlyCharge),
        status: selectedCustomer.status || 'ACTIVE',
      });

      setSnackbarMessage(`Customer ${selectedCustomer?.id ? 'updated' : 'saved'} successfully!`);
      setSnackbarOpen(true);
      setSelectedCustomer(null);
      setEditModalVisible(false);
      const updatedCustomers = await axios.get(`${BASEURL}/customers`);
      setCustomers(updatedCustomers.data);
    } catch (error) {
      console.error('Error saving customer:', error.response ? error.response.data : error.message);
      setSnackbarMessage('Error saving customer. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredCustomers = searchQuery.trim() ? searchResults : customers;

  const captureLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const formattedLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setSelectedCustomer((prev) => ({
      ...prev,
      location: formattedLocation,
    }));
  };

  const formatLocation = (latitude, longitude) => {
    return `Latitude: ${latitude}, Longitude: ${longitude}`;
  };

  const renderItem = ({ item: customer }) => (
    <DataTable.Row key={customer.id}>
      <DataTable.Cell onPress={() => openViewModal(customer)}>{customer.firstName}</DataTable.Cell>
      <DataTable.Cell onPress={() => openViewModal(customer)}>{customer.lastName}</DataTable.Cell>
      <DataTable.Cell onPress={() => openViewModal(customer)}>{customer.location || 'N/A'}</DataTable.Cell>
      <DataTable.Cell onPress={() => openViewModal(customer)}>{customer.phone}</DataTable.Cell>
      <DataTable.Cell onPress={() => openViewModal(customer)}>{customer.category}</DataTable.Cell>
      <DataTable.Cell onPress={() => openViewModal(customer)}>{customer.status}</DataTable.Cell>
      <DataTable.Cell>
        <IconButton
          icon="pencil"
          color="#3b82f6"
          size={20}
          onPress={() => openEditModal(customer)}
        />
      </DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Accounts</Text>

      <TextInput
        label="Search by Name or Phone"
        mode="outlined"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchInput}
      />
      <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
        Search
      </Button>

      <ScrollView>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>First Name</DataTable.Title>
            <DataTable.Title>Last Name</DataTable.Title>
            <DataTable.Title>Location</DataTable.Title>
            <DataTable.Title>Contact</DataTable.Title>
            <DataTable.Title>Category</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>

          {isSearching && <ActivityIndicator size="large" color="#6200EE" style={styles.indicator} />}
          <FlatList
            data={filteredCustomers}
            renderItem={renderItem}
            keyExtractor={(customer) => customer.id.toString()}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListEmptyComponent={
              !isSearching && (
                <Text style={styles.emptyText}>
                  {searchQuery} not found.
                </Text>
              )
            }
          />
        </DataTable>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: '#6200EE' }]}
        small
        icon="plus"
        onPress={() => openEditModal(null)}
        color="#fff"
      />

      {/* View Customer Modal */}
      <Portal>
        <Modal
          visible={viewModalVisible}
          onDismiss={() => setViewModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Customer Details</Text>
          <Text>First Name: {selectedCustomer?.firstName}</Text>
          <Text>Last Name: {selectedCustomer?.lastName}</Text>
          <Text>Email: {selectedCustomer?.email}</Text>
          <Text>Phone: {selectedCustomer?.phone}</Text>
          <Text>Category: {selectedCustomer?.category}</Text>
          <Text>Location: {selectedCustomer?.location ? formatLocation(selectedCustomer.location.latitude, selectedCustomer.location.longitude) : 'N/A'}</Text>
          <Text>Status: {selectedCustomer?.status}</Text>
          <Button onPress={() => setViewModalVisible(false)}>Close</Button>
        </Modal>

        {/* Edit Customer Modal */}
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Edit Customer</Text>
          <TextInput
            label="First Name"
            mode="outlined"
            value={selectedCustomer?.firstName}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, firstName: text }))}
          />
          <TextInput
            label="Last Name"
            mode="outlined"
            value={selectedCustomer?.lastName}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, lastName: text }))}
          />
          <TextInput
            label="Email"
            mode="outlined"
            value={selectedCustomer?.email}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, email: text }))}
          />
          <TextInput
            label="Phone"
            mode="outlined"
            value={selectedCustomer?.phone}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, phone: text }))}
          />
          <TextInput
            label="County"
            mode="outlined"
            value={selectedCustomer?.county}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, county: text }))}
          />
          <TextInput
            label="Town"
            mode="outlined"
            value={selectedCustomer?.town}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, town: text }))}
          />
          <TextInput
            label="Monthly Charge"
            mode="outlined"
            value={selectedCustomer?.monthlyCharge}
            keyboardType="numeric"
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, monthlyCharge: text }))}
          />

          <TextInput
            label="Gender"
            mode="outlined"
            value={selectedCustomer?.gender}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, gender: text }))}
          />
          <TextInput
            label="Status"
            mode="outlined"
            value={selectedCustomer?.status}
            onChangeText={(text) => setSelectedCustomer((prev) => ({ ...prev, status: text }))}
            placeholder="ACTIVE or DORMANT"
          />

          <Button onPress={captureLocation} mode="outlined" style={styles.captureButton}>
            Capture Location
          </Button>

          <Button onPress={handleSaveCustomer} mode="contained" loading={loading}>
            {selectedCustomer?.id ? 'Update Customer' : 'Create Customer'}
          </Button>
          <Button onPress={() => setEditModalVisible(false)}>Close</Button>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarOpen}
        onDismiss={handleSnackbarClose}
        action={{
          label: 'Close',
          onPress: () => {
            // Do something if needed
          },
        }}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingTop:50
  },
  searchInput: {
    marginBottom: 8,
  },
  searchButton: {
    marginBottom: 16,
  },
  modalContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  indicator: {
    margin: 20,
  },
  captureButton: {
    marginBottom: 16,
    
  },
});

export default Customers;
