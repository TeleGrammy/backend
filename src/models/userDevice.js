const mongoose = require("mongoose");

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to another collection
      ref: "User", // Adjust "User" to the name of your user model
      required: true,
    },
    deviceToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const UserDevice = mongoose.model("UserDevice", userDeviceSchema);

module.exports = UserDevice;
