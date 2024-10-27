const getMainPage = (req, res, next) => {
  console.log(req.user);
  res.status(200).json({
    data: "Main Page",
    message: "Successful",
  });
};

module.exports = {getMainPage};
