// const {expect} = require("chai");
// const sinon = require("sinon");
// const manageSessionForUser = require("../utils/sessionManagement");
// const userService = require("../services/userService");
// const sessionService = require("../services/sessionService");
// const generateToken = require("../utils/generateToken");
// const addAuthCookie = require("../utils/addAuthCookie");

// describe("manageSessionForUser Function", () => {
//   let req, res, user;

//   beforeEach(() => {
//     req = {
//       headers: {
//         "user-agent": "Mozilla/5.0",
//         "x-forwarded-for": "127.0.0.1",
//       },
//       connection: {
//         remoteAddress: "127.0.0.1",
//       },
//     };
//     res = {
//       cookie: sinon.spy(), // Spy on the cookie function to check if it gets called
//     };
//     user = {
//       _id: "userId",
//       username: "testUser",
//       email: "test@example.com",
//       phone: "1234567890",
//       loggedOutFromAllDevicesAt: null,
//     };

//     // Correctly stub the generateToken function
//     sinon.stub(generateToken).returns("token"); // Use this for default exports

//     // Stub the session and user services
//     sinon.stub(sessionService, "findSessionByUserIdAndUpdate").returns(null);
//     sinon.stub(sessionService, "createSession").resolves();
//     sinon.stub(userService, "findOneAndUpdate").resolves(user);
//     sinon.stub(addAuthCookie, "addAuthCookie");
//   });

//   afterEach(() => {
//     sinon.restore(); // Restore all the stubs
//   });

//   it("should manage user session and return updated user and access token", async () => {
//     const result = await manageSessionForUser(req, res, user);

//     expect(result).to.deep.equal({updatedUser: user, accessToken: "token"});
//     expect(sessionService.findSessionByUserIdAndUpdate.calledOnce).to.be.true;
//     expect(sessionService.createSession.calledOnce).to.be.true;
//     expect(userService.findOneAndUpdate.calledOnce).to.be.true;
//     expect(addAuthCookie.calledOnce).to.be.true;
//   });

//   it("should create a session if one does not exist", async () => {
//     // Ensure that the find session function returns null to trigger session creation
//     sessionService.findSessionByUserIdAndUpdate.returns(null);

//     await manageSessionForUser(req, res, user);

//     expect(sessionService.createSession.calledOnce).to.be.true;
//   });
// });
