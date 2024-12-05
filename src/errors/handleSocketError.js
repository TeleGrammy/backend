const handleSocketError = (socket, err) => {
  socket.emit(
    "error",
    socket.emit("error", {
      statusCode: err.statusCode,
      status: err.status || "error",
      message: err.message,
    })
  );
};

module.exports = handleSocketError;
