const userService = require("../../services/userService");
const AppError = require("../../errors/appError");

module.exports.getMainPage = (req, res, next) => {
  res.status(200).json({
    data: "Main Page",
    message: "Successful",
  });
};

module.exports.updatePublicKey = async (req, res, next) => {
  let {publicKey} = req.body;
  publicKey =
    "-----BEGIN PUBLIC KEY-----\n" + publicKey + "\n-----END PUBLIC KEY-----";
  if (!publicKey) {
    next(new AppError("Please provide a public key", 400));
  }
  const user = await userService.findByIdAndUpdate(
    req.user.id,
    {publicKey},
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {user},
  });
};
