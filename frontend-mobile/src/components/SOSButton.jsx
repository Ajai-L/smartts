import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../services/api';

export default function SOSButton({ touristId, token }) {
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    try {
      setLoading(true);
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await api.post(
        '/incidents/sos',
        { touristId, coords: { lat: coords.latitude, lng: coords.longitude }, source: 'manual' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sent', 'Emergency response has been triggered.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send SOS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable style={styles.button} disabled={loading} onPress={handleSOS}>
      <Text style={styles.text}>{loading ? 'Sending...' : 'SOS'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#D7263D', borderRadius: 16, padding: 18, alignItems: 'center' },
  text: { color: '#fff', fontWeight: '700', fontSize: 18 }
});
