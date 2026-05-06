import React, { useEffect, useState } from 'react';
import { connectSocket } from '../services/socket';

export default function ResponderDashboard({ token }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const socket = connectSocket(token);
    socket.on('incident:new', (incident) => {
      setIncidents((prev) => [incident, ...prev]);
    });
    return () => socket.disconnect();
  }, [token]);

  return (
    <section>
      <h2>Active SOS Incidents</h2>
      <ul>
        {incidents.map((incident) => (
          <li key={incident._id}>
            <strong>{incident.reason}</strong> | {incident.location.coordinates[1]}, {incident.location.coordinates[0]} | {incident.source}
          </li>
        ))}
      </ul>
      {/* Integrate @react-google-maps/api here for production interactive mapping. */}
    </section>
  );
}
