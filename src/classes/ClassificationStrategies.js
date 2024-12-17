const InferenceStrategy = require("./InferenceStrategy");

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
  async classify(imageKey) {
    const {
      DetectModerationLabelsCommand,
      RekognitionClient,
    } = require("@aws-sdk/client-rekognition");

    const rekogClient = new RekognitionClient({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const bucket = process.env.AWS_BUCKET_NAME;

    const params = {
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: imageKey,
        },
      },
    };

    const response = await rekogClient.send(
      new DetectModerationLabelsCommand(params)
    );

    const imageLabel = response.ModerationLabels.some((label) => {
      return label.TaxonomyLevel == 1 || label.TaxonomyLevel == 2;
    });

    return imageLabel ? 1 : 0;
  }
}

module.exports = {
  TextClassificationStrategy,
  ImageClassificationStrategy,
};
