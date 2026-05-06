import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import User from './models/User.js';
import { incidentRoutes } from './routes/incidentRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new Error('Unauthorized socket'));
  }
});

io.on('connection', (socket) => {
  if (socket.user.role === 'Responder') socket.join('responders');

  socket.on('location:update', async (payload) => {
    // payload = { lat, lng, speed, heading }
    await User.findByIdAndUpdate(socket.user.sub, {
      lastKnownLocation: { type: 'Point', coordinates: [payload.lng, payload.lat] }
    });
    io.emit('tourist:location', { userId: socket.user.sub, ...payload, at: new Date().toISOString() });
  });
});

app.use('/api/incidents', incidentRoutes(io));
app.get('/health', (_req, res) => res.json({ ok: true }));

async function bootstrap() {
  await connectDb();
  server.listen(env.port, () => console.log(`API listening on :${env.port}`));
}

bootstrap();
