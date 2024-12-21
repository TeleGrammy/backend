class InferenceStrategy {
  async init() {
    const transformers = await import("@xenova/transformers");
    this.pipeline = transformers.pipeline;
    this.AutoTokenizer = transformers.AutoTokenizer;
    this.AutoModelForSequenceClassification =
      transformers.AutoModelForSequenceClassification;
    this.fetch = (await import("node-fetch")).default;
  }

  async classify(content) {
    throw new Error("Method 'classify' must be implemented.");
  }
}

module.exports = InferenceStrategy;
