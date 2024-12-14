const InferenceStrategy = require("./InferenceStrategy");
const vision = require("@google-cloud/vision");

class TextClassificationStrategy extends InferenceStrategy {
  async classify(text) {
    await this.init();

    try {
      const textClassifier = await this.pipeline(
        "sentiment-analysis",
        "Xenova/toxic-bert"
      );

      const textResult = await textClassifier(
        "Can I eat your mother's kidney ? "
      );
      return textResult[0].score > 0.6 ? 1 : 0;
    } catch (error) {
      console.error("Error loading model:", error);
    }
  }
}

class ImageClassificationStrategy extends InferenceStrategy {
  async classify(imageUrl) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.safeSearchDetection(imageUrl);
    const imageResult = result.safeSearchAnnotation;

    return imageResult.adult === "VERY_LIKELY" ||
      imageResult.violence === "VERY_LIKELY"
      ? 1
      : 0;

    // await this.init();
    //
    // try {
    //   const imageClassifier = await pipeline(
    //     "image-classification",
    //     "Xenova/vit-base-patch16-224"
    //   );
    //   const urls = [
    //     "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/tiger.jpg",
    //     "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg",
    //   ];
    //   const output = await classifier(urls);
    //   return imageResult[0].label === "inappropriate" ? 1 : 0;
    // } catch (error) {
    //   console.error("Error loading model:", error);
    // }
  }
}

module.exports = {
  TextClassificationStrategy,
  ImageClassificationStrategy,
};
