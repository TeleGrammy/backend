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
