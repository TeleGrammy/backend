class SnowflakeID {
  constructor(workerId) {
    if (workerId < 0 || workerId > 31) {
      // Ensure workerId fits in 5 bits (0-31)
      throw new Error("Worker ID must be between 0 and 31");
    }
    this.workerId = BigInt(workerId);
    this.sequence = BigInt(0);
    this.lastTimestamp = BigInt(-1);
    this.epoch = BigInt(1577836800000); // Custom epoch (Jan 1, 2020)
  }

  // eslint-disable-next-line class-methods-use-this
  currentTimestamp() {
    return BigInt(Date.now());
  }

  waitNextMillis(lastTimestamp) {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }

  nextId() {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error(
        `Clock moved backwards. Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds`
      );
    }
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + BigInt(1)) & BigInt(0xfff); // 4095 mask

      if (this.sequence === BigInt(0)) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = BigInt(0);
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.epoch) << BigInt(22)) | // Timestamp (41 bits)
      (this.workerId << BigInt(12)) | // Worker ID (5 bits)
      this.sequence; // Sequence (12 bits)
    return id;
  }
}

// Usage
const generator = new SnowflakeID(BigInt(process.env.SERVER_WORKER_ID));

module.exports = () => generator.nextId();
