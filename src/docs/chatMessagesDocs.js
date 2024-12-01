/**
 * @swagger
 *  /chats/chat/{id}:
 *    get:
 *      summary: 'Get chat details and messages by chat ID'
 *      description: Fetch chat details and its messages, with pagination support.
 *      tags:
 *        - Chats
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Unique identifier for the chat.
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *            minimum: 1
 *          description: Page number for message pagination.
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            default: 30
 *            minimum: 1
 *          description: Number of messages per page.
 *      responses:
 *        '200':
 *          description: Successfully retrieved chat details and messages.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  chat:
 *                    type: object
 *                    description: Chat details.
 *                  messages:
 *                    type: object
 *                    properties:
 *                      totalMessages:
 *                        type: integer
 *                      currentPage:
 *                        type: integer
 *                      totalPages:
 *                        type: integer
 *                      data:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            content:
 *                              type: string
 *                            senderId:
 *                              type: string
 *                            messageType:
 *                              type: string
 *                            timestamp:
 *                              type: string
 *        '401':
 *          description: Unauthorized. User is not a participant in the chat.
 *        '404':
 *          description: Chat not found.
 */

/**
 * @swagger
 *  /chats/user-chat:
 *    get:
 *      summary: 'Create or retrieve one-to-one chat'
 *      description: Create or retrieve a one-to-one chat with a receiver specified by their UUID.
 *      tags:
 *        - Chats
 *      parameters:
 *        - in: query
 *          name: receiver
 *          required: true
 *          schema:
 *            type: string
 *          description: UUID of the receiver.
 *      responses:
 *        '200':
 *          description: Chat successfully retrieved or created.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  participants:
 *                    type: array
 *                    items:
 *                      type: object
 *                  createdAt:
 *                    type: string
 *                    format: date-time
 *        '400':
 *          description: Receiver UUID is required.
 *        '404':
 *          description: Receiver not found.
 */

/**
 * @swagger
 *  /chats/all-chats:
 *    get:
 *      summary: 'Get all chats for the user'
 *      description: Retrieve all chats the authenticated user is participating in, with pagination support.
 *      tags:
 *        - Chats
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *            minimum: 1
 *          description: Page number for pagination.
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            default: 50
 *            minimum: 1
 *          description: Number of chats per page.
 *      responses:
 *        '200':
 *          description: Successfully retrieved all chats.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  totalChats:
 *                    type: integer
 *                  currentPage:
 *                    type: integer
 *                  totalPages:
 *                    type: integer
 *                  chats:
 *                    type: array
 *                    items:
 *                      type: object
 *        '404':
 *          description: User not found.
 */

/**
 * @swagger
 *  /chats/fetch-contacts:
 *    post:
 *      summary: 'Fetch or create chats for a list of contacts'
 *      description: Given a list of contact UUIDs, fetch or create one-to-one chats for the user with each contact.
 *      tags:
 *        - Chats
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                contacts:
 *                  type: array
 *                  items:
 *                    type: string
 *                  description: List of contact UUIDs.
 *      responses:
 *        '200':
 *          description: Successfully fetched or created chats.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  chats:
 *                    type: array
 *                    items:
 *                      type: string
 *                  chatCount:
 *                    type: integer
 *        '400':
 *          description: Contacts are required as a non-empty array.
 */
