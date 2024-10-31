/**
 * @swagger
 *  /conversations/:
 *    get:
 *      summary: 'Get all conversations'
 *      description: List all conversations for the logged in user
 *      tags:
 *        - Conversations
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *            minimum: 1
 *          description: Pagination for conversations.
 *      responses:
 *        '200':
 *          description: Retrieved the conversations successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  data:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: string
 *                        name:
 *                          type: string
 *                        lastMessage:
 *                          type: object
 *                          properties:
 *                            sender:
 *                              type: string
 *                            content:
 *                              type: string
 *                            messageType:
 *                              type: string
 *                            timeStamp:
 *                              type: string
 *                            status:
 *                              type: string
 *                        picture:
 *                          type: string
 *                        isMuted:
 *                          type: boolean
 *        '400':
 *          description: Bad request.
 */
/**
 * @swagger
 *  /conversations/{id}:
 *    get:
 *      summary: 'Get conversation messages and metadata'
 *      description: List messages of the current conversation
 *      tags:
 *        - Conversations
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Conversation identifier.
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *            minimum: 1
 *          description: Pagination for messages.
 *      responses:
 *        '200':
 *          description: Retrieved the conversations successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  participants:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        username:
 *                          type: string
 *                        id:
 *                          type: string
 *                  chatName:
 *                    type: string
 *                    example: "SWE-Project F2024"
 *                  picture:
 *                    type: string
 *                    example: "https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/1729268699315-cropped-pexels-photo-6424615-3.jpeg"
 *                  conversationType:
 *                    type: string
 *                    example: "channel"
 *                  permissions:
 *                    type: object
 *                    properties:
 *                      canChat:
 *                        type: boolean
 *                      canSendMedia:
 *                        type: boolean
 *                      canEditMsg:
 *                        type: boolean
 *                      canDeleteMsg:
 *                        type: boolean
 *                      canDownload:
 *                        type: boolean
 *                  isChatAdmin:
 *                    type: boolean
 *                  messages:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: string
 *                        messageType:
 *                          type: string
 *                        sender:
 *                          type: object
 *                          properties:
 *                            username:
 *                              type: string
 *                            picture:
 *                              type: string
 *                            id:
 *                              type: string
 *                        content:
 *                          type: string
 *                        timestamp:
 *                          type: string
 *                        sentList:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              userId:
 *                                type: string
 *                              username:
 *                                type: string
 *                              timestamp:
 *                                type: string
 *                        deliveredList:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              userId:
 *                                type: string
 *                              username:
 *                                type: string
 *                              timestamp:
 *                                type: string
 *                        seenList:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              userId:
 *                                type: string
 *                              username:
 *                                type: string
 *                              timestamp:
 *                                type: string
 *                        mentionList:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              userId:
 *                                type: string
 *                              username:
 *                                type: string
 *                        isForwarded:
 *                          type: boolean
 *                        repliedTo:
 *                          type: object
 *                          properties:
 *                            sender:
 *                              type: string
 *                            messageId:
 *                              type: string
 *                            content:
 *                              type: string
 *                        media:
 *                          type: object
 *                          properties:
 *                            type:
 *                              type: string
 *                            filesize:
 *                              type: integer
 *                              description: file size in MegaBytes
 *                            url:
 *                              type: string
 *                            thumbnail:
 *                              type: string
 *        '400':
 *          description: Bad request.
 */
/**
 * @swagger
 *  /conversations/messages:
 *    post:
 *      summary: Send a new message to a conversation
 *      description: Send a message over a conversation with an optional media. Should be done with formBody();
 *      tags:
 *        - Conversations
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: message content or caption for media
 *                  example: "Hey guys this is my first message here!"
 *                media:
 *                  type: string
 *                  format: binary
 *                  description: An optional media file to upload
 *                conversationId:
 *                  type: string
 *                  description: ID of the conversation you send the message to
 *                replyingTo:
 *                  type: string
 *                  description: ID of the message you are replying to (optional)
 *                mentionList:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      userId:
 *                        type: string
 *                      username:
 *                        type: string
 *      responses:
 *        '200':
 *          description: Message sent successfully.
 *        '401':
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "You are not authorized to send messages over this conversation"
 *        '400':
 *          description: Bad request.
 */
/**
 * @swagger
 *  /conversations/messages/{messageId}:
 *    patch:
 *      summary: Edit a message
 *      description: Edits a message sent by the current authenticated user.
 *      tags:
 *        - Conversations
 *      parameters:
 *        - in: path
 *          name: messageId
 *          required: true
 *          schema:
 *            type: string
 *          description: message identifier to be edited.
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: message content or caption for media
 *                  example: "Hey guys this is my first message here!"
 *                media:
 *                  type: string
 *                  format: binary
 *                  description: An optional media file to upload
 *                conversationId:
 *                  type: string
 *                  description: ID of the conversation you send the message to
 *                replyingTo:
 *                  type: string
 *                  description: ID of the message you are replying to (optional)
 *                mentionList:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      userId:
 *                        type: string
 *                      username:
 *                        type: string
 *      responses:
 *        '200':
 *          description: Message edited successfully.
 *        '401':
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "You are not authorized to send messages over this conversation"
 *        '400':
 *          description: Bad request.
 */
/**
 * @swagger
 *  /conversations/messages/{messageId}:
 *    delete:
 *      summary: deletes a message
 *      description: deletes a message sent by the current authenticated user.
 *      tags:
 *        - Conversations
 *      parameters:
 *        - in: path
 *          name: messageId
 *          required: true
 *          schema:
 *            type: string
 *          description: message identifier to be edited.
 *      responses:
 *        '200':
 *          description: deleted successfully.
 *        '401':
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "You are not authorized to delete messages over this conversation"
 *        '400':
 *          description: Bad request.
 */
/**
 * @swagger
 *  /conversations/{conversationId}:
 *    patch:
 *      summary: mutes notifications for a conversation
 *      description: mutes notifications of a conversation for the currently authenticated user.
 *      tags:
 *        - Conversations
 *      parameters:
 *        - in: path
 *          name: conversationId
 *          required: true
 *          schema:
 *            type: string
 *          description: message identifier to be edited.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                mute:
 *                  type: boolean
 *                duration:
 *                  type: string
 *      responses:
 *        '200':
 *          description: notification subscribed/unsubscribe operation success!
 *        '400':
 *          description: Bad request.
 */
