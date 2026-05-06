import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createIncidentController } from '../controllers/incidentController.js';

export function incidentRoutes(io) {
  const router = Router();
  const controller = createIncidentController(io);

  router.post('/sos', authenticate, controller.triggerSOS);
  router.post('/geofence/evaluate', authenticate, controller.evaluateGeofence);
  router.post('/sms-fallback', controller.parseOfflineSms);
  router.get('/active', authenticate, authorize('Responder', 'Admin'), async (_req, res) => {
    const Incident = (await import('../models/Incident.js')).default;
    const incidents = await Incident.find({ status: 'active' }).populate('tourist', 'fullName lastKnownLocation');
    res.json({ incidents });
  });

  return router;
}
