/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile information
 *     description: Retrieve the profile information of the user.
 *     tags:
 *       - User Profile
 *     responses:
 *       '200':
 *         description: User profile information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     screenName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     pictureURL:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 - _id: fgs554445dsf
 *                   username: test12
 *                   screenName: test test
 *                   email: example@test.com
 *                   phone: '0101010100'
 *                   bio: Lover of tech, coffee, and adventure. Always curious. 🌍
 *                   pictureURL: http://testdgffg
 *       '404':
 *         description: User not found.
 *   patch:
 *     summary: Update user profile information
 *     description: Update the profile information (username, screen name, phone, bio, and status) of the authenticated user.
 *     tags:
 *       - User Profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               bio:
 *                 type: string
 *               screenName:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User profile information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     screenName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     pictureURL:
 *                       type: string
 *             example:
 *               status: success
 *               data:
 *                 - id: fgs554445dsf
 *                   username: test12
 *                   screenName: test test
 *                   email: example@test.com
 *                   phone: '0101010100'
 *                   bio: Lover of tech, coffee, and adventure. Always curious. 🌍
 *                   pictureURL: http://testdgffg
 *       '400':
 *         description: Duplicate field value.
 *       '404':
 *         description: User not found.
 * /user/profile/status:
 *   get:
 *     summary: Get user activity status
 *     description: Retrieve the activity status of the authenticated user.
 *     tags:
 *       - User Profile
 *     responses:
 *       '200':
 *         description: User activity status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     lastSeen:
 *                       type: string
 *                       format: date-time
 *             example:
 *               status: success
 *               data:
 *                 status: active
 *                 lastSeen: '2022-01-01T12:00:00.000Z'
 *       '404':
 *         description: User not found.
 *   patch:
 *     summary: Update user activity status
 *     description: Update the activity status of the authenticated user.
 *     tags:
 *       - User Profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 default: active
 *                 enum:
 *                   - active
 *                   - inactive
 *     responses:
 *       '200':
 *         description: User activity status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     lastSeen:
 *                       type: string
 *                       format: date-time
 *             example:
 *               status: success
 *               data:
 *                 status: active
 *                 lastSeen: '2022-01-01T12:00:00.000Z'
 *       '404':
 *         description: User not found.
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
 *                 enum: [Everyone, Contacts, Nobody]
 *               stories:
 *                 type: string
 *                 enum: [Everyone, Contacts, Nobody]
 *               lastSeen:
 *                 type: string
 *                 enum: [Everyone, Contacts, Nobody]
 *     responses:
 *       '200':
 *         description: Profile visibility settings updated successfully.
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
 *                     profilePicture:
 *                       type: string
 *                     stories:
 *                       type: string
 *                     lastSeen:
 *                       type: string
 *       '400':
 *         description: Invalid request data.
 * /privacy/settings/blocked-users:
 *   post:
 *     summary: Block a user
 *     description: Block a specific user by ID.
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
 *     responses:
 *       '200':
 *         description: User blocked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *       '404':
 *         description: User not found.
 *   delete:
 *     summary: Unblock a user
 *     description: Unblock a specific user by ID.
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
 *     responses:
 *       '200':
 *         description: User unblocked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *       '404':
 *         description: User not found.
 *   get:
 *     summary: Get blocked users
 *     description: Retrieve a list of all blocked users.
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       username:
 *                         type: string
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
 *               enabled:
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
 *                     enabled:
 *                       type: boolean
 *       '400':
 *         description: Invalid request data.
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
 *               addToGroups:
 *                 type: string
 *                 enum: [Everyone, Admins]
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
 *                     addToGroups:
 *                       type: string
 *       '400':
 *         description: Invalid request data.
 */
