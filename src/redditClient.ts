import * as Snoowrap from 'snoowrap';
require('dotenv').config();

export const config = {
  userAgent: 'petahoaxbot v0.1',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS,
};

export const client = new Snoowrap(config);
