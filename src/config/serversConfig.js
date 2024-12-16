module.exports.getIceServers = async (req, res, next) => {
  return res.status(200).json({
    iceServers: [
      {urls: process.env.STUN_SERVER_URL},
      {
        urls: process.env.TURN_SERVER_URL,
        username: process.env.TURN_SERVER_USERNAME,
        credential: process.env.TURN_SERVER_CREDENTIAL,
      },
    ],
  });
};
