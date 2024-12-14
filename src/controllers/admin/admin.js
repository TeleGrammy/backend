const catchAsync = require("../../utils/catchAsync");

const AppError = require("../../errors/appError");

const adminService = require("../../services/adminService");

const AIModelFactory = require("../../classes/AIModelFactory");
const AIInferenceContext = require("../../classes/AIINterfernceContext");

const validStatuses = ["banned", "active", "inactive"];

const getRegisteredUsers = catchAsync(async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const registeredUsers = await adminService.getUsers(adminId);

    return res.status(200).json({
      status: "success",
      data: registeredUsers,
    });
  } catch (error) {
    return next(error);
  }
});

const changeUserStatus = catchAsync(async (req, res, next) => {
  try {
    const {userId} = req.params;
    const {status} = req.body;

    if (!validStatuses.includes(status)) {
      throw new AppError(
        "Invalid status. Allowed values are 'banned', 'active', or 'inactive'",
        400
      );
    }

    const restrictedUser = await adminService.restrictUser(
      userId,
      {status},
      {new: true}
    );

    if (!restrictedUser) {
      throw new AppError("An error ocuured while updating the user's status");
    }

    return res.status(200).json({
      status: "success",
      data: restrictedUser,
    });
  } catch (error) {
    return next(error);
  }
});

const filterContents = catchAsync(async (req, res, next) => {
  const factory = new AIModelFactory();

  // Create strategies
  const textStrategy = factory.createStrategy("text");
  const imageStrategy = factory.createStrategy("image");

  // Create context and classify content
  const context = new AIInferenceContext(textStrategy);
  const textLabel = await context.executeInference("Hi I am Johnny");
  context.setStrategy(imageStrategy);
  const imageLabel = await context.executeInference(
    "https://www.shutterstock.com/image-photo/very-beautiful-photo-blue-sky-few-2452470957"
  );
  console.log(imageLabel);

  return res.status(200).json({
    status: "success",
    data: textLabel === 1 || imageLabel === 1 ? 1 : 0,
  });
});

module.exports = {
  getRegisteredUsers,
  changeUserStatus,
  filterContents,
};
