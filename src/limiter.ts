import Bottleneck from 'bottleneck';
import humanizeDuration from 'humanize-duration';
import { log, isProduction, minute, second } from './helpers';

export const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: isProduction ? 2 * minute : 5000,
});

limiter.on('failed', async (error, info) => {
  const id = info.options.id;
  if (error.message.startsWith('RATELIMIT') && info.retryCount < 3) {
    const multiply = error.message.includes('minut') ? minute : second;
    const ms =
      (Number(error.message.replace(/(^.+\D)(\d+)(\D.+$)/i, '$2')) + 1) *
      multiply;
    log(
      id,
      `Rate limited, waiting for ${humanizeDuration(ms, { round: true })}.`,
    );
    return ms;
  }
});

limiter.on('executing', function (info) {
  const id = info.options.id;
  log(id, `Executing reply`);
});

limiter.on('done', function (info) {
  const id = info.options.id;
  log(id, `Done`);
});
