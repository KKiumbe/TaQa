import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TextInput, Button, DataTable, Text, Snackbar, FAB, Portal, Menu, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';


const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const InvoiceScreen = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [fabVisible, setFabVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('UNPAID');
  const [menuVisible, setMenuVisible] = useState(false);
  const limit = 20;


  const currentUser = useAuthStore(state => state.currentUser); // Access current user from Zustand store

  useEffect(() => {
    if (!currentUser) {
      router.push('login'); // Redirect to login if no user is found
    }
  }, [currentUser]);
 
  const fetchInvoices = async (reset = false) => {
    if (reset) {
      setOffset(0);
      setInvoices([]);
    }

    setLoading(true);
    try {
     
      //const user = await AsyncStorage.getItem('user');
     // const parsedUser = JSON.parse(user);
    


      const response = await axios.get(`${BASEURL}/invoices/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        params: {
          status: statusFilter,
          offset: reset ? 0 : offset,
          limit: limit,
        },
      });

      setInvoices((prevInvoices) => [...prevInvoices, ...response.data]);
      setOffset((prevOffset) => prevOffset + limit);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      if (error.response && error.response.status === 401) {
        setSnackbarMessage('You are not authorized. Please log in.');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Failed to fetch invoices. Please try again.');
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    if (!searchTerm.trim()) {
      fetchInvoices(true);
      setIsSearching(false);
      return;
    }

    try {
      const isPhoneNumber = /^\d+$/.test(searchTerm);
      const response = await axios.get(`${BASEURL}/invoices/search`, {
        params: {
          phone: isPhoneNumber ? searchTerm : undefined,
          name: !isPhoneNumber ? searchTerm : undefined,
        },
      });

      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching invoices:', error);
      setSnackbarMessage('Error searching invoices.');
      setSnackbarOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleScroll = async (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      if (!loadingMore && !loading) {
        setLoadingMore(true);
        await fetchInvoices();
        setLoadingMore(false);
      }
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchInvoices(true);
  };

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleFetchReports = () => {
    // Implement logic for fetching invoice reports
    setSnackbarMessage('Fetching invoice reports...');
    setSnackbarOpen(true);
    // Add your API call or logic here
  };

  const handleGenerateBills = () => {
    // Implement logic for generating bills
    setSnackbarMessage('Generating bills...');
    setSnackbarOpen(true);
    // Add your API call or logic here
  };

  const handleCancelBills = () => {
    // Implement logic for cancelling bills in bulk
    setSnackbarMessage('Cancelling selected bills...');
    setSnackbarOpen(true);
    // Add your API call or logic here
  };

  useFocusEffect(
    useCallback(() => {
      fetchInvoices(true);
      setFabVisible(true);

      return () => {
        setFabVisible(false);
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="menu"
          color="#007BFF"
          size={30}
          onPress={handleMenuToggle}
        />
        <Text style={styles.title}>Invoices</Text>
        <Menu
          visible={menuVisible}
          onDismiss={handleMenuToggle}
          anchor={<IconButton icon="dots-vertical" onPress={handleMenuToggle} 
          style={styles.menu}
          />}
        >
          <Menu.Item onPress={handleFetchReports} title="Fetch Reports" />
          <Menu.Item onPress={handleGenerateBills} title="Generate Bills" />
          <Menu.Item onPress={handleCancelBills} title="Cancel Bills" />
        </Menu>
      </View>

      {/* Status Filter Buttons */}
      <View style={styles.filterContainer}>
        <Button 
          mode="contained" 
          onPress={() => handleStatusFilter('UNPAID')} 
          style={[styles.filterButton, statusFilter === 'UNPAID' && styles.activeFilter]}
        >
          Unpaid
        </Button>
        <Button 
          mode="contained" 
          onPress={() => handleStatusFilter('PAID')} 
          style={[styles.filterButton, statusFilter === 'PAID' && styles.activeFilter]}
        >
          Paid
        </Button>
        <Button 
          mode="contained" 
          onPress={() => handleStatusFilter('CANCELLED')} 
          style={[styles.filterButton, statusFilter === 'CANCELLED' && styles.activeFilter]}
        >
          Cancelled
        </Button>
      </View>

      {/* Search Input */}
      <TextInput
        label="Search by Name or Phone Number"
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
        style={styles.searchInput}
        onSubmitEditing={handleSearch}
      />

      {/* Search Button */}
      <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
        {isSearching ? 'Searching...' : 'Search'}
      </Button>

      {/* Loading Indicator for initial load */}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Invoice Number</DataTable.Title>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Invoice Amount</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Edit</DataTable.Title>
            </DataTable.Header>

            {invoices.map((invoice) => (
              <DataTable.Row
                key={invoice.id}
                onPress={() => router.navigate(`invoices/${invoice.id}`, { id: invoice.id })}
                style={styles.row}
              >
                <DataTable.Cell>{invoice.invoiceNumber}</DataTable.Cell>
                <DataTable.Cell>{invoice.customer.firstName} {invoice.customer.lastName}</DataTable.Cell>
                <DataTable.Cell>{invoice.invoiceAmount}</DataTable.Cell>
                <DataTable.Cell>{invoice.status}</DataTable.Cell>
                <DataTable.Cell>
                  <Button onPress={() => console.log('Open Invoice:', invoice.id)}>Edit</Button>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>

          {/* Loading Indicator for more items */}
          {loadingMore && <ActivityIndicator size="small" color="#007BFF" style={styles.loader} />}
        </ScrollView>
      )}

      {/* Snackbar for error messages */}
      <Snackbar
        visible={snackbarOpen}
        onDismiss={() => setSnackbarOpen(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Floating Action Button for Creating Invoices */}
      {fabVisible && (
        <Portal>
          <FAB
            style={styles.fab}
            icon="plus"
           
            onPress={() => router.push('/invoices/create')}
          />
        </Portal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding:10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activeFilter: {
    backgroundColor: '#007BFF',
  },
  searchInput: {
    marginBottom: 8,
  },
  searchButton: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  row: {
    cursor: 'pointer',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: -20,
    bottom: 50,
   

  },
  menu:{
    padding:20
  }
});

export default InvoiceScreen;
