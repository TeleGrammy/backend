/**
 * @swagger
 * /admins/groups:
 *   get:
 *     summary: Get all groups with populated owner details
 *     description: Retrieve a list of groups with owner information populated.
 *     tags:
 *       - Admin Dashboard
 *     responses:
 *       200:
 *         description: A list of groups with owner information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the group
 *                   description:
 *                     type: string
 *                     description: The description of the group
 *                   image:
 *                     type: string
 *                     description: The URL of the group's image
 *                   groupType:
 *                     type: string
 *                     description: The type of the group
 *                   groupPermissions:
 *                     type: object
 *                     properties:
 *                       sendTextMessages:
 *                         type: boolean
 *                         description: Whether text messages can be sent
 *                         default: true
 *                       sendMedia:
 *                         type: object
 *                         properties:
 *                           photos:
 *                             type: boolean
 *                             description: Whether photos can be sent
 *                             default: true
 *                           videos:
 *                             type: boolean
 *                             description: Whether videos can be sent
 *                             default: true
 *                           files:
 *                             type: boolean
 *                             description: Whether files can be sent
 *                             default: true
 *                           music:
 *                             type: boolean
 *                             description: Whether music can be sent
 *                             default: true
 *                           voiceMessages:
 *                             type: boolean
 *                             description: Whether voice messages can be sent
 *                             default: true
 *                           videoMessages:
 *                             type: boolean
 *                             description: Whether video messages can be sent
 *                             default: true
 *                           stickers:
 *                             type: boolean
 *                             description: Whether stickers can be sent
 *                             default: true
 *                           polls:
 *                             type: boolean
 *                             description: Whether polls can be sent
 *                             default: true
 *                           embedLinks:
 *                             type: boolean
 *                             description: Whether links can be embedded
 *                             default: true
 *                   addUsers:
 *                     type: boolean
 *                     description: Whether users can be added to the group
 *                   pinMessages:
 *                     type: boolean
 *                     description: Whether messages can be pinned in the group
 *                   changeChatInfo:
 *                     type: boolean
 *                     description: Whether chat info can be changed in the group
 *                   applyFilter:
 *                     type: boolean
 *                     description: Whether filters can be applied in the group
 *                   owner:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                         description: The username of the owner
 *                       screenName:
 *                         type: string
 *                         description: The screen name of the owner
 *                       phone:
 *                         type: string
 *                         description: The phone number of the owner
 *                       email:
 *                         type: string
 *                         description: The email of the owner
 *                       _id:
 *                         type: string
 *                         description: The ID of the owner
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admins/users:
 *   get:
 *     summary: Retrieve All Registered Users
 *     description: Fetch a list of all registered users within the application
 *     tags:
 *       - Admin Dashboard
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of registered users
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
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       screenName:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       bio:
 *                         type: string
 *                       status:
 *                         type: string
 *                       picture:
 *                         type: string
 *                       pictureKey:
 *                         type: string
 *       '400':
 *         description: Invalid adminId provided
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
 *                   example: Invalid adminId provided
 */

/**
 * @swagger
 * /admins/users/{userId}:
 *   patch:
 *     summary: Update User Account Status
 *     description: Update the account status of a specific user (e.g., ban, deactivate, or activate)
 *     tags:
 *       - Admin Dashboard
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user whose account status will be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [banned, active, inactive]
 *             required:
 *               - status
 *           example:
 *             status: banned
 *     responses:
 *       '200':
 *         description: User status updated successfully
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
 *                     status:
 *                       type: string
 *                     pictureKey:
 *                       type: string
 *                     picture:
 *                       type: string
 *       '400':
 *         description: Invalid input or userId provided
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
 *                   example: Invalid status. Allowed values are 'banned', 'active', or 'inactive'
 *       '500':
 *         description: Internal server error while updating the user's status
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
 *                   example: An error occurred while updating the user's status
 */

/**
 * @swagger
 * /admins/filter/{groupId}:
 *   patch:
 *     summary: Update Group Filtering Status
 *     description: Enable or disable content filtering for a specific group using AI models to detect inappropriate content
 *     tags:
 *       - Admin Dashboard
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the group whose filtering status will be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applyFilter:
 *                 type: boolean
 *             required:
 *               - applyFilter
 *           example:
 *             applyFilter: true
 *     responses:
 *       '200':
 *         description: Group filtering status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Group's filtering status has been updated
 *       '400':
 *         description: Invalid groupId provided.
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
 *                   example: Invalid groupId provided.
 *       '500':
 *         description: Internal server error while updating the group filtering status
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
 *                   example: An error occurred while updating the group filtering status
 */
