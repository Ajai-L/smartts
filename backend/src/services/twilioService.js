import twilio from 'twilio';
import { env } from '../config/env.js';

const client = env.twilioSid && env.twilioAuthToken ? twilio(env.twilioSid, env.twilioAuthToken) : null;

export async function sendEmergencySms(to, message) {
  if (!client || !env.twilioPhone) {
    throw new Error('Twilio is not configured');
  }

  return client.messages.create({ from: env.twilioPhone, to, body: message });
}
