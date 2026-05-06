import Incident from '../models/Incident.js';
import User from '../models/User.js';
import DangerZone from '../models/DangerZone.js';
import { evaluateMovementRisk } from '../utils/riskEngine.js';
import { sendEmergencySms } from '../services/twilioService.js';

export function createIncidentController(io) {
  async function notifyResponders(incident) {
    const responders = await User.find({ role: 'Responder', isActive: true }).select('_id fullName');
    const responderIds = responders.map((r) => r._id);

    incident.respondersNotified = responderIds;
    await incident.save();

    io.to('responders').emit('incident:new', incident);
    return responders;
  }

  async function triggerSOS(req, res) {
    try {
      const { touristId, coords, source = 'hardware', reason = 'Wearable SOS button pressed' } = req.body;
      const tourist = await User.findById(touristId);
      if (!tourist) return res.status(404).json({ message: 'Tourist not found' });

      const incident = await Incident.create({
        tourist: tourist._id,
        source,
        reason,
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
        metadata: { rawPayload: req.body }
      });

      await notifyResponders(incident);

      await Promise.allSettled(
        tourist.emergencyContacts.map((contact) =>
          sendEmergencySms(contact.phone, `SOS: ${tourist.fullName} requires help at ${coords.lat},${coords.lng}`)
        )
      );

      return res.status(201).json({ incident });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to trigger SOS', error: error.message });
    }
  }

  async function evaluateGeofence(req, res) {
    try {
      const { touristId, current, previous, expectedRoutePoint } = req.body;
      const zones = await DangerZone.find({ isActive: true });
      const result = evaluateMovementRisk({ previous, current, expectedRoutePoint, dangerZones: zones });

      if (result.enteredDangerZones.length) {
        const incident = await Incident.create({
          tourist: touristId,
          source: 'ai-geofence',
          reason: `Entered danger zone: ${result.enteredDangerZones.map((z) => z.name).join(', ')}`,
          riskScore: result.riskScore,
          location: { type: 'Point', coordinates: [current.lng, current.lat] },
          metadata: result
        });
        await notifyResponders(incident);
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Geofence evaluation failed', error: error.message });
    }
  }

  async function parseOfflineSms(req, res) {
    try {
      const { senderPhone, message } = req.body; // format: "SOS|touristId|lat,lng"
      const [, touristId, pair] = message.split('|');
      const [lat, lng] = pair.split(',').map(Number);

      req.body = { touristId, coords: { lat, lng }, source: 'sms-fallback', reason: `SMS fallback from ${senderPhone}` };
      return triggerSOS(req, res);
    } catch (error) {
      return res.status(400).json({ message: 'Malformed SMS payload', error: error.message });
    }
  }

  return { triggerSOS, evaluateGeofence, parseOfflineSms };
}
