require('dotenv').config()

const Snoowrap = require('snoowrap')

const config = {
  userAgent: 'petahoaxbot v0.1',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
}
const client = new Snoowrap(config)

module.exports = {client, config}
