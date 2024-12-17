class AIInferenceContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async executeInference(content) {
    return await this.strategy.classify(content);
  }
}

module.exports = AIInferenceContext;
