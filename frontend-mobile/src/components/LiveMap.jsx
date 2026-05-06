import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';

export default function LiveMap({ token }) {
  const socketRef = useRef();
  const [touristMarkers, setTouristMarkers] = useState({});

  useEffect(() => {
    socketRef.current = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:4000', { auth: { token } });
    socketRef.current.on('tourist:location', (payload) => {
      setTouristMarkers((prev) => ({ ...prev, [payload.userId]: payload }));
    });
    return () => socketRef.current?.disconnect();
  }, [token]);

  return (
    <MapView style={{ flex: 1 }} initialRegion={{ latitude: 40.7128, longitude: -74.006, latitudeDelta: 0.2, longitudeDelta: 0.2 }}>
      {Object.values(touristMarkers).map((t) => (
        <Marker key={t.userId} coordinate={{ latitude: t.lat, longitude: t.lng }} title={`Tourist ${t.userId}`} />
      ))}
    </MapView>
  );
}
