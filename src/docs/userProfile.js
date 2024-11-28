/**
 * @swagger
 * /privacy/settings/profile-visibility:
 *   patch:
 *     summary: Set profile visibility
 *     description: Control who can see profile picture, stories, and last seen.
 *     tags:
 *       - Privacy Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 enum: [EveryOne, Contacts, Nobody]
 *               stories:
 *                 type: string
 *                 enum: [Contacts, EveryOne, Nobody]
 *               lastSeen:
 *                 type: string
 *                 enum: [Nobody, Contacts, EveryOne]
 *     responses:
 *       '200':
 *         description: Profile visibility settings are updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     profilePictureVisibility:
 *                       type: string
 *                     storiesVisibility:
 *                       type: string
 *                     lastSeenVisibility:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: Profile picture visibility option has been set
 *       '400':
 *         description: Invalid action. One or more of the passed visibility options not valid, please check them
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Invalid action. One or more of the passed visibility options not valid, please check them
 *       '500':
 *         description: An error has occurred while updating the profile picture's privacy settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: An error has occurred while updating the profile picture's privacy settings
 * */
/**
 * @swagger
 * /privacy/settings/blocking-status/:action:
 *   patch:
 *     summary: Block or unblock a user
 *     description: Block or unblock a specific user by his/her ID, and the action should be 'block' or 'unblock'
 *     tags:
 *       - Privacy Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               chatId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User blocked/unblocked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *       '400':
 *         description: Invalid action. Use 'block' or 'unblock', please check them -OR- This user needed to block is not in the blocker's contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Invalid action. Use 'block' or 'unblock', please check them
 *       '404':
 *         description: Blocker user not found while searching.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Blocker user not found while searching
 *       '500':
 *         description: An error has occurred while updating the blocking status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: An error has occurred while updating the blocking status
 * */
/**
 * @swagger
 * /privacy/settings/get-blocked-users:
 *   get:
 *     summary: Get blocked users
 *     description: Retrieve a list of all blocked users for the authenticated user.
 *     tags:
 *       - Privacy Settings
 *     responses:
 *       '200':
 *         description: List of blocked users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     blockedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "671d44667e9678b9429b2ee0"
 *                           username:
 *                             type: string
 *                             example: "john_doe"
 *       '500':
 *         description: Failed to get blocked users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: "Failed to get blocked users"
 *       '404':
 *         description: User is not found while searching
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: "User is not found while searching"
 */
/**
 * @swagger
 * /privacy/settings/read-receipts:
 *   patch:
 *     summary: Enable/Disable read receipts
 *     description: Enable or disable read receipts for the user.
 *     tags:
 *       - Privacy Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isEnabled:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Read receipts setting updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     isEnabled:
 *                       type: boolean
 *       '400':
 *         description: Invalid action. Enabling status should boolean values only, please check them
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Invalid action. Enabling status should boolean values only, please check them
 *       '404':
 *         description: User is not found while searching
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: "User is not found while searching"
 *       '500':
 *         description: An error has occurred while updating the read receipts settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: An error has occurred while updating the read receipts settings
 */
/**
 * @swagger
 * /privacy/settings/group-control:
 *   patch:
 *     summary: Control group add permissions
 *     description: Control who can add the user to groups or channels.
 *     tags:
 *       - Privacy Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPolicy:
 *                 type: string
 *                 enum: [EveryOne, Admins]
 *     responses:
 *       '200':
 *         description: Group add permissions updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     newPolicy:
 *                       type: string
 *       '400':
 *         description: Invalid action. The value of policy isn't valid, please check them
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Invalid action. The value of policy isn't valid, please check them
 */
/**
 * @swagger
 * /api/v1/user/profile/email:
 *   patch:
 *     summary: updateUserEmail
 *     description: updateUserEmail
 *     operationId: updateuseremail
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: alibahr313@gmail.com
 *           examples:
 *             updateUserEmail:
 *               value:
 *                 email: alibahr313@gmail.com
 *     responses:
 *       '202':
 *         description: updateUserEmail
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '62'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:32:20 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"3e-cr2oMZmXo6WMgn7ThlDoM4NH4ls"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: please confirm your new email
 *                 status:
 *                   type: string
 *                   example: pending
 *             examples:
 *               updateUserEmail:
 *                 value:
 *                   message: please confirm your new email
 *                   status: pending
 */

/**
 * @swagger
 * /api/v1/user/profile/email/new-code/:
 *   patch:
 *     summary: request new confirmation code
 *     description: request new confirmation code
 *     operationId: requestNewConfirmationCode
 *     requestBody:
 *       content:
 *         application/json:
 *           examples:
 *             request new confirmation code:
 *               value: ''
 *     responses:
 *       '200':
 *         description: ''
 */
/**
 * @swagger
 * /api/v1/user/profile/email/confirm/:
 *   post:
 *     summary: confirm email
 *     description: confirm email
 *     operationId: confirmEmail
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmationCode:
 *                 type: string
 *                 example: '122114'
 *           examples:
 *             confirm email:
 *               value:
 *                 confirmationCode: '122114'
 *     responses:
 *       '200':
 *         description: confirm email
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '641'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:33:05 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"281-m1Nt0SOT+o0WSeh/yw6behzrL/Y"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         __v:
 *                           type: number
 *                           example: 0
 *                         _id:
 *                           type: string
 *                           example: 672205dc2a3bb0aeed7c88fb
 *                         accessToken:
 *                           nullable: true
 *                           example: null
 *                         accessTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         bio:
 *                           type: string
 *                           example: ''
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 67215e999a44eb477e2a3a91
 *                           example:
 *                             - 67215e999a44eb477e2a3a91
 *                             - 671d3c3fa99c593917b9c977
 *                         deletedDate:
 *                           nullable: true
 *                           example: null
 *                         email:
 *                           type: string
 *                           example: alibahr313@gmail.com
 *                         jwtRefreshToken:
 *                           nullable: true
 *                           example: null
 *                         lastSeen:
 *                           type: string
 *                           example: '2024-10-30T10:02:53.446Z'
 *                         loggedOutFromAllDevicesAt:
 *                           nullable: true
 *                           example: null
 *                         password:
 *                           type: string
 *                           example: >-
 *                             $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                         passwordModifiedAt:
 *                           nullable: true
 *                           example: null
 *                         phone:
 *                           type: string
 *                           example: '011235'
 *                         picture:
 *                           type: string
 *                           example: default.jpg
 *                         refreshToken:
 *                           nullable: true
 *                           example: null
 *                         refreshTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         registrationDate:
 *                           type: string
 *                           example: '2024-10-30T10:09:32.160Z'
 *                         screenName:
 *                           type: string
 *                           example: User
 *                         status:
 *                           type: string
 *                           example: active
 *                         username:
 *                           type: string
 *                           example: alibahr
 *                 status:
 *                   type: string
 *                   example: success
 *             examples:
 *               confirm email:
 *                 value:
 *                   data:
 *                     user:
 *                       __v: 0
 *                       _id: 672205dc2a3bb0aeed7c88fb
 *                       accessToken: null
 *                       accessTokenExpiresAt: null
 *                       bio: ''
 *                       contacts:
 *                         - 67215e999a44eb477e2a3a91
 *                         - 671d3c3fa99c593917b9c977
 *                       deletedDate: null
 *                       email: alibahr313@gmail.com
 *                       jwtRefreshToken: null
 *                       lastSeen: '2024-10-30T10:02:53.446Z'
 *                       loggedOutFromAllDevicesAt: null
 *                       password: >-
 *                         $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                       passwordModifiedAt: null
 *                       phone: '011235'
 *                       picture: default.jpg
 *                       refreshToken: null
 *                       refreshTokenExpiresAt: null
 *                       registrationDate: '2024-10-30T10:09:32.160Z'
 *                       screenName: User
 *                       status: active
 *                       username: alibahr
 *                   status: success
 */

/**
 * @swagger
 * /api/v1/user/profile/:
 *   get:
 *     summary: get User Info
 *     description: get User Info
 *     operationId: getUserInfo
 *     responses:
 *       '200':
 *         description: get User Info
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '652'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:33:42 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"28c-RyCwQ5K3jXN1whsNZX+xyv0anp8"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         __v:
 *                           type: number
 *                           example: 0
 *                         _id:
 *                           type: string
 *                           example: 672205dc2a3bb0aeed7c88fb
 *                         accessToken:
 *                           nullable: true
 *                           example: null
 *                         accessTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         bio:
 *                           type: string
 *                           example: bbbioooo me
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 67215e999a44eb477e2a3a91
 *                           example:
 *                             - 67215e999a44eb477e2a3a91
 *                             - 671d3c3fa99c593917b9c977
 *                         deletedDate:
 *                           nullable: true
 *                           example: null
 *                         email:
 *                           type: string
 *                           example: alibahr313@gmail.com
 *                         jwtRefreshToken:
 *                           nullable: true
 *                           example: null
 *                         lastSeen:
 *                           type: string
 *                           example: '2024-10-30T10:02:53.446Z'
 *                         loggedOutFromAllDevicesAt:
 *                           nullable: true
 *                           example: null
 *                         password:
 *                           type: string
 *                           example: >-
 *                             $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                         passwordModifiedAt:
 *                           nullable: true
 *                           example: null
 *                         phone:
 *                           type: string
 *                           example: '011235'
 *                         picture:
 *                           type: string
 *                           example: default.jpg
 *                         refreshToken:
 *                           nullable: true
 *                           example: null
 *                         refreshTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         registrationDate:
 *                           type: string
 *                           example: '2024-10-30T10:09:32.160Z'
 *                         screenName:
 *                           type: string
 *                           example: User
 *                         status:
 *                           type: string
 *                           example: active
 *                         username:
 *                           type: string
 *                           example: alibahr
 *                 status:
 *                   type: string
 *                   example: success
 *             examples:
 *               get User Info:
 *                 value:
 *                   data:
 *                     user:
 *                       __v: 0
 *                       _id: 672205dc2a3bb0aeed7c88fb
 *                       accessToken: null
 *                       accessTokenExpiresAt: null
 *                       bio: bbbioooo me
 *                       contacts:
 *                         - 67215e999a44eb477e2a3a91
 *                         - 671d3c3fa99c593917b9c977
 *                       deletedDate: null
 *                       email: alibahr313@gmail.com
 *                       jwtRefreshToken: null
 *                       lastSeen: '2024-10-30T10:02:53.446Z'
 *                       loggedOutFromAllDevicesAt: null
 *                       password: >-
 *                         $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                       passwordModifiedAt: null
 *                       phone: '011235'
 *                       picture: default.jpg
 *                       refreshToken: null
 *                       refreshTokenExpiresAt: null
 *                       registrationDate: '2024-10-30T10:09:32.160Z'
 *                       screenName: User
 *                       status: active
 *                       username: alibahr
 *                   status: success
 *   patch:
 *     summary: update User Info
 *     description: update User Info
 *     operationId: updateUserInfo
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: bbbioooo me
 *               status:
 *                 type: string
 *                 example: active
 *           examples:
 *             update User Info:
 *               value:
 *                 bio: bbbioooo me
 *                 status: active
 *     responses:
 *       '200':
 *         description: update User Info
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '652'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:33:36 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"28c-RyCwQ5K3jXN1whsNZX+xyv0anp8"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         __v:
 *                           type: number
 *                           example: 0
 *                         _id:
 *                           type: string
 *                           example: 672205dc2a3bb0aeed7c88fb
 *                         accessToken:
 *                           nullable: true
 *                           example: null
 *                         accessTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         bio:
 *                           type: string
 *                           example: bbbioooo me
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 67215e999a44eb477e2a3a91
 *                           example:
 *                             - 67215e999a44eb477e2a3a91
 *                             - 671d3c3fa99c593917b9c977
 *                         deletedDate:
 *                           nullable: true
 *                           example: null
 *                         email:
 *                           type: string
 *                           example: alibahr313@gmail.com
 *                         jwtRefreshToken:
 *                           nullable: true
 *                           example: null
 *                         lastSeen:
 *                           type: string
 *                           example: '2024-10-30T10:02:53.446Z'
 *                         loggedOutFromAllDevicesAt:
 *                           nullable: true
 *                           example: null
 *                         password:
 *                           type: string
 *                           example: >-
 *                             $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                         passwordModifiedAt:
 *                           nullable: true
 *                           example: null
 *                         phone:
 *                           type: string
 *                           example: '011235'
 *                         picture:
 *                           type: string
 *                           example: default.jpg
 *                         refreshToken:
 *                           nullable: true
 *                           example: null
 *                         refreshTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         registrationDate:
 *                           type: string
 *                           example: '2024-10-30T10:09:32.160Z'
 *                         screenName:
 *                           type: string
 *                           example: User
 *                         status:
 *                           type: string
 *                           example: active
 *                         username:
 *                           type: string
 *                           example: alibahr
 *                 status:
 *                   type: string
 *                   example: success
 *             examples:
 *               update User Info:
 *                 value:
 *                   data:
 *                     user:
 *                       __v: 0
 *                       _id: 672205dc2a3bb0aeed7c88fb
 *                       accessToken: null
 *                       accessTokenExpiresAt: null
 *                       bio: bbbioooo me
 *                       contacts:
 *                         - 67215e999a44eb477e2a3a91
 *                         - 671d3c3fa99c593917b9c977
 *                       deletedDate: null
 *                       email: alibahr313@gmail.com
 *                       jwtRefreshToken: null
 *                       lastSeen: '2024-10-30T10:02:53.446Z'
 *                       loggedOutFromAllDevicesAt: null
 *                       password: >-
 *                         $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                       passwordModifiedAt: null
 *                       phone: '011235'
 *                       picture: default.jpg
 *                       refreshToken: null
 *                       refreshTokenExpiresAt: null
 *                       registrationDate: '2024-10-30T10:09:32.160Z'
 *                       screenName: User
 *                       status: active
 *                       username: alibahr
 *                   status: success
 */

/**
 * @swagger
 *   /api/v1/user/profile/status/:
 *   get:
 *     summary: get User status
 *     description: get User status
 *     operationId: getUserStatus
 *     responses:
 *       '200':
 *         description: get User status
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '85'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:33:47 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"55-AbpvNQbNTr11pRfdaKz8+YyP8qQ"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     lastSeen:
 *                       type: string
 *                       example: '2024-10-30T10:02:53.446Z'
 *                     status:
 *                       type: string
 *                       example: active
 *                 status:
 *                   type: string
 *                   example: success
 *             examples:
 *               get User status:
 *                 value:
 *                   data:
 *                     lastSeen: '2024-10-30T10:02:53.446Z'
 *                     status: active
 *                   status: success
 */

/**
 * @swagger
 *   /api/v1/user/profile/picture/:
 *   delete:
 *     summary: delete User pic
 *     description: delete User pic
 *     operationId: deleteUserPic
 *
 *     responses:
 *       '200':
 *         description: delete User pic
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '652'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:34:30 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"28c-RyCwQ5K3jXN1whsNZX+xyv0anp8"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         __v:
 *                           type: number
 *                           example: 0
 *                         _id:
 *                           type: string
 *                           example: 672205dc2a3bb0aeed7c88fb
 *                         accessToken:
 *                           nullable: true
 *                           example: null
 *                         accessTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         bio:
 *                           type: string
 *                           example: bbbioooo me
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 67215e999a44eb477e2a3a91
 *                           example:
 *                             - 67215e999a44eb477e2a3a91
 *                             - 671d3c3fa99c593917b9c977
 *                         deletedDate:
 *                           nullable: true
 *                           example: null
 *                         email:
 *                           type: string
 *                           example: alibahr313@gmail.com
 *                         jwtRefreshToken:
 *                           nullable: true
 *                           example: null
 *                         lastSeen:
 *                           type: string
 *                           example: '2024-10-30T10:02:53.446Z'
 *                         loggedOutFromAllDevicesAt:
 *                           nullable: true
 *                           example: null
 *                         password:
 *                           type: string
 *                           example: >-
 *                             $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                         passwordModifiedAt:
 *                           nullable: true
 *                           example: null
 *                         phone:
 *                           type: string
 *                           example: '011235'
 *                         picture:
 *                           type: string
 *                           example: default.jpg
 *                         refreshToken:
 *                           nullable: true
 *                           example: null
 *                         refreshTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         registrationDate:
 *                           type: string
 *                           example: '2024-10-30T10:09:32.160Z'
 *                         screenName:
 *                           type: string
 *                           example: User
 *                         status:
 *                           type: string
 *                           example: active
 *                         username:
 *                           type: string
 *                           example: alibahr
 *                 status:
 *                   type: string
 *                   example: success
 *             examples:
 *               delete User pic:
 *                 value:
 *                   data:
 *                     user:
 *                       __v: 0
 *                       _id: 672205dc2a3bb0aeed7c88fb
 *                       accessToken: null
 *                       accessTokenExpiresAt: null
 *                       bio: bbbioooo me
 *                       contacts:
 *                         - 67215e999a44eb477e2a3a91
 *                         - 671d3c3fa99c593917b9c977
 *                       deletedDate: null
 *                       email: alibahr313@gmail.com
 *                       jwtRefreshToken: null
 *                       lastSeen: '2024-10-30T10:02:53.446Z'
 *                       loggedOutFromAllDevicesAt: null
 *                       password: >-
 *                         $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                       passwordModifiedAt: null
 *                       phone: '011235'
 *                       picture: default.jpg
 *                       refreshToken: null
 *                       refreshTokenExpiresAt: null
 *                       registrationDate: '2024-10-30T10:09:32.160Z'
 *                       screenName: User
 *                       status: active
 *                       username: alibahr
 *                   status: success
 *   patch:
 *     summary: update User pic
 *     description: update User pic
 *     operationId: updateUserPic
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: update User pic
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '1082'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:34:19 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"43a-M4xMwomiFcpWtU6BezgjXskV6bU"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         __v:
 *                           type: number
 *                           example: 0
 *                         _id:
 *                           type: string
 *                           example: 672205dc2a3bb0aeed7c88fb
 *                         accessToken:
 *                           nullable: true
 *                           example: null
 *                         accessTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         bio:
 *                           type: string
 *                           example: bbbioooo me
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 67215e999a44eb477e2a3a91
 *                           example:
 *                             - 67215e999a44eb477e2a3a91
 *                             - 671d3c3fa99c593917b9c977
 *                         deletedDate:
 *                           nullable: true
 *                           example: null
 *                         email:
 *                           type: string
 *                           example: alibahr313@gmail.com
 *                         jwtRefreshToken:
 *                           nullable: true
 *                           example: null
 *                         lastSeen:
 *                           type: string
 *                           example: '2024-10-30T10:02:53.446Z'
 *                         loggedOutFromAllDevicesAt:
 *                           nullable: true
 *                           example: null
 *                         password:
 *                           type: string
 *                           example: >-
 *                             $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                         passwordModifiedAt:
 *                           nullable: true
 *                           example: null
 *                         phone:
 *                           type: string
 *                           example: '011235'
 *                         picture:
 *                           type: string
 *                           example: >-
 *                             https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/userProfilesPictures/1730313255063-Screenshot%20%281%29.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T183419Z&X-Amz-Expires=900&X-Amz-Signature=1e91c157be3002344ba5f52c0e0a647c558302e5fc92e8b5c2f2e22fee20d1c9&X-Amz-SignedHeaders=host&x-id=GetObject
 *                         refreshToken:
 *                           nullable: true
 *                           example: null
 *                         refreshTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         registrationDate:
 *                           type: string
 *                           example: '2024-10-30T10:09:32.160Z'
 *                         screenName:
 *                           type: string
 *                           example: User
 *                         status:
 *                           type: string
 *                           example: active
 *                         username:
 *                           type: string
 *                           example: alibahr
 *                 status:
 *                   type: string
 *                   example: success
 *             examples:
 *               update User pic:
 *                 value:
 *                   data:
 *                     user:
 *                       __v: 0
 *                       _id: 672205dc2a3bb0aeed7c88fb
 *                       accessToken: null
 *                       accessTokenExpiresAt: null
 *                       bio: bbbioooo me
 *                       contacts:
 *                         - 67215e999a44eb477e2a3a91
 *                         - 671d3c3fa99c593917b9c977
 *                       deletedDate: null
 *                       email: alibahr313@gmail.com
 *                       jwtRefreshToken: null
 *                       lastSeen: '2024-10-30T10:02:53.446Z'
 *                       loggedOutFromAllDevicesAt: null
 *                       password: >-
 *                         $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                       passwordModifiedAt: null
 *                       phone: '011235'
 *                       picture: >-
 *                         https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/userProfilesPictures/1730313255063-Screenshot%20%281%29.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T183419Z&X-Amz-Expires=900&X-Amz-Signature=1e91c157be3002344ba5f52c0e0a647c558302e5fc92e8b5c2f2e22fee20d1c9&X-Amz-SignedHeaders=host&x-id=GetObject
 *                       refreshToken: null
 *                       refreshTokenExpiresAt: null
 *                       registrationDate: '2024-10-30T10:09:32.160Z'
 *                       screenName: User
 *                       status: active
 *                       username: alibahr
 *                   status: success
 *       '400':
 *         description: update User pic
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '47'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:34:00 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"2f-3rPVO36Hvkh2g0vpbSZLWeDIMdk"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No photo uploaded
 *                 status:
 *                   type: string
 *                   example: fail
 *             examples:
 *               update User pic:
 *                 value:
 *                   message: No photo uploaded
 *                   status: fail
 */
/**
 * @swagger
 *   /api/v1/user/profile/bio:
 *   delete:
 *     summary: delete user bio
 *     description: delete user bio
 *     operationId: deleteUserBio
 *     responses:
 *       '200':
 *         description: delete user bio
 *         headers:
 *           Access-Control-Allow-Credentials:
 *             schema:
 *               type: string
 *               example: 'true'
 *           Access-Control-Allow-Origin:
 *             schema:
 *               type: string
 *               example: '*'
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: '641'
 *           Date:
 *             schema:
 *               type: string
 *               example: Wed, 30 Oct 2024 18:34:40 GMT
 *           ETag:
 *             schema:
 *               type: string
 *               example: W/"281-m1Nt0SOT+o0WSeh/yw6behzrL/Y"
 *           Keep-Alive:
 *             schema:
 *               type: string
 *               example: timeout=5
 *           X-Powered-By:
 *             schema:
 *               type: string
 *               example: Express
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         __v:
 *                           type: number
 *                           example: 0
 *                         _id:
 *                           type: string
 *                           example: 672205dc2a3bb0aeed7c88fb
 *                         accessToken:
 *                           nullable: true
 *                           example: null
 *                         accessTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         bio:
 *                           type: string
 *                           example: ''
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 67215e999a44eb477e2a3a91
 *                           example:
 *                             - 67215e999a44eb477e2a3a91
 *                             - 671d3c3fa99c593917b9c977
 *                         deletedDate:
 *                           nullable: true
 *                           example: null
 *                         email:
 *                           type: string
 *                           example: alibahr313@gmail.com
 *                         jwtRefreshToken:
 *                           nullable: true
 *                           example: null
 *                         lastSeen:
 *                           type: string
 *                           example: '2024-10-30T10:02:53.446Z'
 *                         loggedOutFromAllDevicesAt:
 *                           nullable: true
 *                           example: null
 *                         password:
 *                           type: string
 *                           example: >-
 *                             $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                         passwordModifiedAt:
 *                           nullable: true
 *                           example: null
 *                         phone:
 *                           type: string
 *                           example: '011235'
 *                         picture:
 *                           type: string
 *                           example: default.jpg
 *                         refreshToken:
 *                           nullable: true
 *                           example: null
 *                         refreshTokenExpiresAt:
 *                           nullable: true
 *                           example: null
 *                         registrationDate:
 *                           type: string
 *                           example: '2024-10-30T10:09:32.160Z'
 *                         screenName:
 *                           type: string
 *                           example: User
 *                         status:
 *                           type: string
 *                           example: active
 *                         username:
 *                           type: string
 *                           example: alibahr
 *                 status:
 *                   type: string
 *                   example: success
 *             examples:
 *               delete user bio:
 *                 value:
 *                   data:
 *                     user:
 *                       __v: 0
 *                       _id: 672205dc2a3bb0aeed7c88fb
 *                       accessToken: null
 *                       accessTokenExpiresAt: null
 *                       bio: ''
 *                       contacts:
 *                         - 67215e999a44eb477e2a3a91
 *                         - 671d3c3fa99c593917b9c977
 *                       deletedDate: null
 *                       email: alibahr313@gmail.com
 *                       jwtRefreshToken: null
 *                       lastSeen: '2024-10-30T10:02:53.446Z'
 *                       loggedOutFromAllDevicesAt: null
 *                       password: >-
 *                         $2b$12$OONLO8B4whp3pqPFYCcsxOaTKwVrX3pnLL0LK08jjiw7w4zSIhoc.
 *                       passwordModifiedAt: null
 *                       phone: '011235'
 *                       picture: default.jpg
 *                       refreshToken: null
 *                       refreshTokenExpiresAt: null
 *                       registrationDate: '2024-10-30T10:09:32.160Z'
 *                       screenName: User
 *                       status: active
 *                       username: alibahr
 *                   status: success
 */
