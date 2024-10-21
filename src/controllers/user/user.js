const getMainPage = (req, res, next) => {
  res.status(200).json({
    data: "Main Page",
    message: "Successful",
  });
};

module.exports = {getMainPage};
