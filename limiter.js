const Bottleneck = require('bottleneck');
const humanizeDuration = require('humanize-duration')

const minute = 1000 * 60

const log = (id, comment) => {
  const date = new Date()
  console.log(`${date.toLocaleTimeString('sv-SE')} [${id}] ${comment}`)
}

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 2 * minute,
});

limiter.on('failed', async (error, info) => {
  const id = info.options.id;
  if (error.message.startsWith('RATELIMIT') && info.retryCount < 3) {
    const multiply = error.message.includes('minut') ? 1000 * 60 : 1000
    const ms = (Number(error.message.replace( /(^.+\D)(\d+)(\D.+$)/i,'$2')) + 1) * multiply
    log(id, `Rate limited, waiting for ${humanizeDuration(ms, { round: true })}.`)
    return ms
  }
});

limiter.on('executing', function (info) {
  const id = info.options.id;
  log(id, `Executing reply`)
});

limiter.on('done', function (info) {
  const id = info.options.id;
  log(id, `Done`)
});

module.exports = limiter
