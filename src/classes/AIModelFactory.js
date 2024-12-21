const AppError = require("../errors/appError");

const {
  TextClassificationStrategy,
  ImageClassificationStrategy,
} = require("./ClassificationStrategies");

class AIModelFactory {
  createStrategy(type) {
    if (type === "text") {
      return new TextClassificationStrategy();
    } else if (type === "image") {
      return new ImageClassificationStrategy();
    } else {
      throw new AppError(`Unknown classification type: ${type}`);
    }
  }
}

module.exports = AIModelFactory;
