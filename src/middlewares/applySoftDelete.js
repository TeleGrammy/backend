const applySoftDeleteMiddleware = (schema) => {
  schema.pre(
    ["findOneAndDelete", "findByIdAndDelete", "deleteOne"],
    async function (next) {
      await this.model.updateOne(this._conditions, {
        $set: {deletedDate: new Date()},
      });

      next();
    }
  );

  schema.pre(["deleteMany"], async function (next) {
    this.updateMany({}, {$set: {deletedDate: new Date()}});
    next();
  });

  schema.pre(["find", "findOne", "findById"], function (next) {
    this.where({deletedDate: null});
    next();
  });

  schema.pre(
    ["findOneAndUpdate", "updateOne", "updateMany", "findByIdAndUpdate"],
    async function (next) {
      const update = this.getUpdate();

      if (update && update.$set && update.$set.deletedDate) {
        update.$set.deletedDate = new Date();
        update.$set.status = "inactive";
      }

      next();
    }
  );
};

module.exports = applySoftDeleteMiddleware;
