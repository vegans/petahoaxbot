import * as Queue from 'bee-queue';

export const queue = new Queue('jobs', {
  redis: {
    host: process.env.NODE_ENV === 'production' ? 'redis' : '127.0.0.1',
    port: 6379,
    db: 0,
    options: {},
  },
});
