/**
 * @swagger
 *  /channels:
 *    post:
 *      summary: create new channel
 *      tags:
 *        - Channels
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: The name of the channel
 *                description:
 *                  type: string
 *                  description: The description of the channel
 *                image:
 *                  type: string
 *                  description: The image of the channel
 *              required:
 *                - name
 *            example:
 *              name: name of channel
 *              description: description of the channel
 *              image: "media/media/test.jpg"
 *      responses:
 *        '201':
 *          description: The channel is created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  data:
 *                    type: object
 *                  message:
 *                    type: string
 *              example:
 *                status: success
 *                data:
 *                  id: df64663131fds
 *                  name: channel name
 *                  description: The channel description
 *                  chatId: df646656223aks
 *                message: The channel is created Successfully
 *        '400':
 *          description: Bad request
 */
/**
 * @swagger
 *  /channels/{channelId}:
 *    patch:
 *      summary: Update the channel
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: The channel ID you want to update
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: The name of the channel
 *                description:
 *                  type: string
 *                  description: The description of the channel
 *                image:
 *                  type: string
 *                  description: The image URL of the channel
 *            example:
 *              name: Example Channel
 *              description: Example channel description
 *              image: "media/media/example.jpg"
 *      responses:
 *        '200':
 *          description: The channel is updated successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  message:
 *                    type: string
 *                    example: The channel is updated successfully
 *        '400':
 *          description: Bad request
 *    delete:
 *      summary: Delete the channel or leave the channel
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: The channel ID to delete or leave
 *      responses:
 *        '204':
 *          description: The channel is deleted or user has successfully left the channel
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  message:
 *                    type: string
 *                    example: Channel deleted successfully or You have successfully left the channel
 *        '403':
 *          description: Unauthorized operation
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: error
 *                  message:
 *                    type: string
 *                    example: You are not a member of this channel or Invalid role. Operation not allowed
 *        '404':
 *          description: Channel not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: error
 *                  message:
 *                    type: string
 *                    example: Channel not found
 *        '500':
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: error
 *                  message:
 *                    type: string
 *                    example: An error occurred while processing the request
 *    get:
 *      summary: Get channel information
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: The channel ID to retrieve information for
 *      responses:
 *        '200':
 *          description: Successfully retrieved the channel's information
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  data:
 *                    type: object
 *                    properties:
 *                      channelId:
 *                        type: string
 *                      channelName:
 *                        type: string
 *                      description:
 *                        type: string
 *                      ownerId:
 *                        type: string
 *                      createdAt:
 *                        type: string
 *                        format: date-time
 *                      subscribers:
 *                        type: array
 *                        items:
 *                          type: string
 *                  message:
 *                    type: string
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /channels/{channelId}/join:
 *    post:
 *      summary: Join a channel as a subscriber
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the channel to join
 *      responses:
 *        '200':
 *          description: Successfully joined the channel
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    type: object
 *                    properties:
 *                      channel:
 *                        type: object
 *                        description: Details of the channel
 *                        example:
 *                          id: "64b7a1e93f3cde0018e22c0e"
 *                          name: "Tech Community"
 *                          privacy: true
 *                      chat:
 *                        type: object
 *                        description: Chat details without participants
 *                        example:
 *                          id: "64b7a1e93f3cde0018e22c0e"
 *                          lastMessage: "Welcome to the channel!"
 *        '400':
 *          description: User already exists in the channel
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: error
 *                  message:
 *                    type: string
 *                    example: User already exists in Channel
 *        '401':
 *          description: Cannot join a private channel
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: error
 *                  message:
 *                    type: string
 *                    example: You can't join Private Channel
 *        '500':
 *          description: Server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: error
 *                  message:
 *                    type: string
 *                    example: An error occurred while processing your request
 */

/**
 * @swagger
 *  /channels/{channelId}/admins/{userId}:
 *    patch:
 *      summary: add new admin to the channel
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to add a new admin to
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          description: the id of the user who will be the new admin in the channel
 *          required: true
 *      responses:
 *        '200':
 *          description: The user become an admin of the channel
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  message:
 *                    type: string
 *                    example: The channel is updated Successfully
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /channels/{channelId}/subscribers/{userId}:
 *    post:
 *      summary: add subscriber to the channel
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to add a new subscriber to
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          description: the id of the user who will subscribe the channel
 *          required: true
 *      responses:
 *        '201':
 *          description: Subscription Done
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  data:
 *                    type: object
 *                    properties:
 *                      channelId:
 *                        type: string
 *                      userId:
 *                        type: string
 *                  message:
 *                    type: string
 *              example:
 *                status: success
 *                data:
 *                  channelId: gf45621sd
 *                  userId: 4212sd2gf
 *                message: The user subscribe the channel successfully
 *        '400':
 *          description: Bad request
 */
/**
 * @swagger
 *  /channels/{channelId}/privacy:
 *    patch:
 *      summary: update channel privacy
 *      description: >-
 *        This endpoint allows only admins of the channel to change its privacy
 *        settings.
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to change its privacy settings
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                privacy:
 *                  type: string
 *                  enum:
 *                    - public
 *                    - private
 *                  description: the privacy option
 *              required:
 *                - privacy
 *            example:
 *              privacy: public
 *      responses:
 *        '200':
 *          description: The channel privacy was updated
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                    type: string
 *              example:
 *                status: success
 *                message: The channel privacy was updated
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 * /channels/{channelId}/invite:
 *   get:
 *     summary: Generate invite link for a channel
 *     tags:
 *       - Channels
 *     parameters:
 *       - in: path
 *         name: channelId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the channel
 *     responses:
 *       '200':
 *         description: Invite link generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: string
 *             example:
 *               message: Channel Links generated successfully
 *               data: "http://localhost:3000/api/v1/channels/123/invite/abcdef12345"
 *       '404':
 *         description: Channel not found
 *       '500':
 *         description: Server error
 */
/**
 * @swagger
 * /channels/{channelId}/invite/{inviteToken}:
 *   get:
 *     summary: Redirect to frontend with channel details based on invite link
 *     tags:
 *       - Channels
 *     parameters:
 *       - in: path
 *         name: channelId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the channel
 *       - in: path
 *         name: inviteToken
 *         schema:
 *           type: string
 *         required: true
 *         description: The invite token of the channel
 *     responses:
 *       '300':
 *         description: Redirected successfully
 *       '401':
 *         description: Invalid invite token
 *       '404':
 *         description: Channel not found
 */
/**
 * @swagger
 * /channels/{channelId}/show/{inviteToken}:
 *   get:
 *     summary: Show channel details based on invite token
 *     tags:
 *       - Channels
 *     parameters:
 *       - in: path
 *         name: channelId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the channel
 *       - in: path
 *         name: inviteToken
 *         schema:
 *           type: string
 *         required: true
 *         description: The invite token of the channel
 *     responses:
 *       '200':
 *         description: Channel details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               id: "123"
 *               name: "Channel Name"
 *               description: "Description of the channel"
 *               inviteToken: "abcdef12345"
 *       '401':
 *         description: Invalid invite token
 *       '404':
 *         description: Channel not found
 */
/**
 * @swagger
 * /channels/{channelId}/invite/{inviteToken}:
 *   post:
 *     summary: Join a channel using an invite link
 *     tags:
 *       - Channels
 *     parameters:
 *       - in: path
 *         name: channelId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the channel
 *       - in: path
 *         name: inviteToken
 *         schema:
 *           type: string
 *         required: true
 *         description: The invite token of the channel
 *     responses:
 *       '200':
 *         description: Successfully joined the channel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *             example:
 *               status: success
 *               data:
 *                 channel:
 *                   id: "123"
 *                   name: "Channel Name"
 *                 chat:
 *                   id: "456"
 *       '401':
 *         description: Invalid invite token
 *       '404':
 *         description: Channel not found
 *       '400':
 *         description: User already exists in the channel
 *       '500':
 *         description: Server error
 */

/**
 * @swagger
 * /channels/{channelId}/chat:
 *   get:
 *     summary: Get Channel Messages
 *     description: Retrieve Channl details including messages and pagination.
 *     tags:
 *        - Channels
 *     parameters:
 *       - name: channelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the channel to retrieve chat details for.
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: The limit number for pagination.
 *     responses:
 *       '200':
 *         description: Chat details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 channelId:
 *                   type: string
 *                   description: The ID of the channel.
 *                 channelName:
 *                   type: string
 *                   description: The name of the channel.
 *                 channelDescription:
 *                   type: string
 *                   description: The description of the channel.
 *                 chatId:
 *                   type: string
 *                   description: The ID of the chat.
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Details of a single message.
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalMessages:
 *                       type: integer
 *                       description: Total number of messages.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number.
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Indicates if there is a next page.
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Indicates if there is a previous page.
 * /channels/thread/{postId}/messages:
 *   get:
 *     summary: Get messages for a thread
 *     tags:
 *        - Channels
 *     description: Retrieve messages and pagination details for a specific thread post.
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the thread post to retrieve messages for.
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: The limit number for pagination.
 *     responses:
 *       '200':
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Details of a single message.
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalMessages:
 *                       type: integer
 *                       description: Total number of messages.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number.
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Indicates if there is a next page.
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Indicates if there is a previous page.
 * /channels/{channelId}/privacy:
 *   patch:
 *     summary: Update channel privacy settings
 *     description: Update the privacy, comments, and download settings for a specific channel.
 *     parameters:
 *       - name: channelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the channel to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privacy:
 *                 type: boolean
 *                 description: Privacy setting of the channel. False for private and True for public.
 *               comments:
 *                 type: boolean
 *                 description: Enable or disable comments on the channel. False for disable and True for enable.
 *               download:
 *                 type: boolean
 *                 description: Enable or disable download functionality for the channel. False for disable and True for enable.
 *           example:
 *             privacy: true
 *             comments: true
 *             download: false
 *     responses:
 *       '200':
 *         description: Channel updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   description: The updated channel document.
 *       '404':
 *         description: Channel not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the channel was not found.
 */
/**
 * @swagger
 *  /channels/{channelId}/participants:
 *    get:
 *      summary: Fetch participants of a channel
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the channel to fetch participants from
 *      responses:
 *        '200':
 *          description: Successfully fetched channel participants
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  participants:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        userData:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: string
 *                              description: The unique ID of the user
 *                            name:
 *                              type: string
 *                              description: The name of the user
 *                            profilePicture:
 *                              type: string
 *                              description: URL of the user's profile picture
 *                            phone:
 *                              type: string
 *                              description: Phone number of the user
 *                        role:
 *                          type: string
 *                          description: Role of the user in the channel
 *              example:
 *                participants:
 *                  - userData:
 *                      id: "60c72b2f5f1b2c001c8e4d4a"
 *                      name: "John Doe"
 *                      profilePicture: "https://example.com/profile.jpg"
 *                      phone: "123-456-7890"
 *                    role: "admin"
 *                  - userData:
 *                      id: "60c72b2f5f1b2c001c8e4d4b"
 *                      name: "Jane Smith"
 *                      profilePicture: ""
 *                      phone: "N/A"
 *                    role: "member"
 *        '400':
 *          description: Invalid channel ID
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                    type: string
 *              example:
 *                status: fail
 *                message: Invalid channel ID
 *        '403':
 *          description: Unauthorized access
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                    type: string
 *              example:
 *                status: fail
 *                message: You do not have permission to view this channel's participants
 *        '500':
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                    type: string
 *              example:
 *                status: error
 *                message: An unexpected error occurred
 */
