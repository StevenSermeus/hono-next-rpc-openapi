import { Counter, Registry } from 'prom-client';

import { prometheus } from '@hono/prometheus';

const registry = new Registry();
const BlackListedTokenCounter = new Counter({
  name: 'blacklisted_tokens',
  help: 'Number of blacklisted tokens',
  registers: [registry],
});

const ConnectionAttemptsCounter = new Counter({
  name: 'connection_attempts',
  help: 'Number of connection attempts',
  registers: [registry],
});

const ConnectionAttemptsFailedCounter = new Counter({
  name: 'connection_attempts_failed',
  help: 'Number of failed connection attempts',
  registers: [registry],
});

const UnauthorizedCounter = new Counter({
  name: 'unauthorized_attempts',
  help: 'Number of unauthorized attempts',
  registers: [registry],
});

const AuthorizedCounter = new Counter({
  name: 'authorized_attempts',
  help: 'Number of authorized attempts',
  registers: [registry],
});

const { printMetrics, registerMetrics } = prometheus({
  registry,
});
export {
  printMetrics,
  registerMetrics,
  BlackListedTokenCounter,
  ConnectionAttemptsCounter,
  ConnectionAttemptsFailedCounter,
  UnauthorizedCounter,
  AuthorizedCounter,
};
