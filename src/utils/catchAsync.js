const catchAsync = (asyncFunction) => {
  return async (req, res, next) => {
    asyncFunction(req, res, next).catch(next);
  };
};
module.exports = catchAsync;
