class SnowflakeID {
  constructor(workerId) {
    this.workerId = BigInt(workerId);
    this.sequence = BigInt(0);
    this.lastTimestamp = BigInt(-1);
    this.epoch = BigInt(1577836800000); // Custom epoch (Jan 1, 2020)
  }

  currentTimestamp() {
    return BigInt(Date.now());
  }

  nextId() {
    let timestamp = this.currentTimestamp();

    // If we're in the same millisecond, increment the sequence
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + BigInt(1)) & BigInt(0xfff); // 4095 mask

      // If the sequence overflows, wait for the next millisecond
      if (this.sequence === BigInt(0)) {
        while (timestamp <= this.lastTimestamp) {
          timestamp = this.currentTimestamp();
        }
      }
    } else {
      // New millisecond, reset sequence
      this.sequence = BigInt(0);
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.epoch) << BigInt(17)) | // Timestamp (35 bits)
      (this.workerId << BigInt(12)) | // Worker ID (5 bits)
      this.sequence; // Sequence (12 bits)
    return id;
  }
}

// Usage
const generator = new SnowflakeID(BigInt(process.env.SERVER_WORKER_ID));

module.exports = () => generator.nextId();
