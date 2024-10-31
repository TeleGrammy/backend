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
 *              required:
 *                - name
 *            example:
 *              name: name of channel
 *              description: description of the channel
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
 *                message: The channel is created Successfully
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /channels/{channelId}:
 *    patch:
 *      summary: update the channel
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to update its info
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
 *            example:
 *              name: name of channel
 *              description: description of the channel
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
 *                    example: The channel is updated Successfully
 *        '400':
 *          description: Bad request
 *    delete:
 *      summary: delete the channel
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to delete it
 *      responses:
 *        '204':
 *          description: The channel is deleted successfully
 *        '400':
 *          description: Bad request
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
 *  /channels/{channelId}/messages:
 *    post:
 *      summary: Post messages to channels
 *      description: >-
 *        This endpoint allows only admins of the channel to post messages.
 *        Regular users cannot access this endpoint
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to post a new message to
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                content:
 *                  type: string
 *                  description: the content of the message
 *                media:
 *                  type: string
 *                  enum:
 *                    - image
 *                    - video
 *                    - document
 *                  description: Type of media attached to the message
 *                url:
 *                  type: string
 *                  description: The URL of the media file
 *              required:
 *                - content
 *      responses:
 *        '201':
 *          description: The message was posted successfully
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
 *                      groupId:
 *                        type: string
 *                      messageId:
 *                        type: string
 *                      content:
 *                        type: string
 *                        description: the content of the message
 *                      media:
 *                        type: string
 *                        description: Type of media attached to the message
 *                      url:
 *                        type: string
 *                        description: The URL of the media file
 *                  message:
 *                    type: string
 *              example:
 *                status: success
 *                data:
 *                  groupId: gf1sdfs2fs
 *                  messageId: gf1s15sfs
 *                  content: The message content
 *                  media: the media used in the message
 *                  url: the url of the media
 *                message: Message posted successfully
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
 *  /channels/{channelId}/invite:
 *    post:
 *      summary: invite users to the specified channel via invite links
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to invite the users to
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: array
 *                  items:
 *                    type: string
 *                  description: list of the ids you want to send the invitation link to
 *              required:
 *                - id
 *            example:
 *              - id1
 *              - id2
 *              - id3
 *      responses:
 *        '200':
 *          description: Users were invited successfully via the invite link
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
 *                message: Users have been invited successfully via the invite link
 *        '400':
 *          description: Bad request due to invalid input
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
 *                message: Invalid request. Please check your input
 *        '403':
 *          description: The user does not have permission to invite users to the channel
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
 *                message: You do not have permission to invite users to this channel
 */

/**
 * @swagger
 *  /channels/{channelId}/comments:
 *    patch:
 *      summary: Enable or disable comments (threads) on channel posts
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: the channel id you want to change its comment settings
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                comment:
 *                  type: boolean
 *                  description: Enable or disable comments on channel posts
 *              required:
 *                - comment
 *            example:
 *              comment: true
 *      responses:
 *        '200':
 *          description: Comment settings updated successfully
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
 *                message: Comment settings updated successfully
 *        '400':
 *          description: Bad request due to invalid input
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
 *                message: Invalid request. Please check your input
 *        '403':
 *          description: The user does not have permission to change comment settings
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
 *                message: >-
 *                  You do not have permission to change comment settings for this
 *                  channel
 */

/**
 * @swagger
 *  /channels/{channelId}/permissions/{userId}:
 *    patch:
 *      summary: Change downloading permission of the user
 *      tags:
 *        - Channels
 *      parameters:
 *        - in: path
 *          name: channelId
 *          schema:
 *            type: string
 *          required: true
 *          description: >-
 *            The ID of the channel for which download permissions are being
 *            modified
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: the user id who his permission will be changed
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                downloadVideo:
 *                  type: boolean
 *                  description: Enable or disable downloading videos
 *                downloadAudio:
 *                  type: boolean
 *                  description: Enable or disable downloading audios
 *              required:
 *                - video
 *                - audio
 *            example:
 *              video: true
 *              audio: false
 *      responses:
 *        '200':
 *          description: Downloading permissions are updated successfully
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
 *                message: Downloading permissions are updated successfully
 *        '400':
 *          description: Bad request due to invalid input
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
 *                message: Invalid request. Please check your input
 *        '403':
 *          description: >-
 *            The user does not have permission to change user's downloading
 *            permission
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
 *                message: >-
 *                  You do not have permission to change user's downloading
 *                  permission
 */
