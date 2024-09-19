export class Timer {
  constructor() {
    this.start = Date.now();
  }
  start: number;
  end() {
    return Date.now() - this.start;
  }
}

//In CI/CD the response time is higher than in local, so we need to increase the timeout
export const RESPONSE_TIMEOUT = process.env.CI ? 250 : 150;
