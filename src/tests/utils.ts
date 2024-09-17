export class Timer {
  constructor() {
    this.start = Date.now();
  }
  start: number;
  end() {
    return Date.now() - this.start;
  }
}

export const RESPONSE_TIMEOUT = 100;
