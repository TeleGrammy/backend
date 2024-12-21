/**
 * @swagger
 *  /notification/mute:
 *    patch:
 *      summary: 'Mute notifications for a specific chat'
 *      description: Unsubscribe the user from Firebase topic notifications for the specified chat.
 *      tags:
 *        - Notification
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                chatId:
 *                  type: string
 *                  description: The ID of the chat to mute.
 *              required:
 *                - chatId
 *      responses:
 *        '200':
 *          description: Successfully muted notifications for the chat.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Chat 12345 has been muted
 *        '404':
 *          description: Chat not found.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: This Chat is not found
 */

/**
 * @swagger
 *  /notification/unmute:
 *    patch:
 *      summary: 'Unmute notifications for a specific chat'
 *      description: Subscribe the user to Firebase topic notifications for the specified chat.
 *      tags:
 *        - Notification
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                chatId:
 *                  type: string
 *                  description: The ID of the chat to unmute.
 *              required:
 *                - chatId
 *      responses:
 *        '200':
 *          description: Successfully unmuted notifications for the chat.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Chat 12345 has been unmuted
 *        '404':
 *          description: Chat not found.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: This Chat is not found
 */
