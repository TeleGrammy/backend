
const logout = async (req, res, next) => {
  try {
    res.clearCookie(process.env.COOKIE_ACCESS_NAME, {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie(process.env.COOKIE_REFRESH_NAME, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully logged out",
    });
  } catch (err) {
    next(new AppError("Logout failed, please try again later", 500));
  }
};

module.exports = logout;
