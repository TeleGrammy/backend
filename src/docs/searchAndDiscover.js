/**
 * @swagger
 *  /search/groups-channels:
 *    get:
 *      summary: Search for public groups or channels by name
 *      tags:
 *        - Search and Discover
 *      parameters:
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          required: true
 *          description: The name of public group or channel
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *          description: Choose if you need to retrieve groups or channels
 *      responses:
 *        '200':
 *          description: The public group and channels are retrieved successfully
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
 *                        name:
 *                          type: string
 *                          description: The name of group
 *                        image:
 *                          type: string
 *                          format: binary
 *                          description: The group image
 *                        description:
 *                          type: string
 *                          description: The Description of the group
 *                        type:
 *                          type: string
 *                          enum:
 *                            - group
 *                            - channel
 *                          description: Define the type of the object group or channel
 *                  message:
 *                    type: string
 *        '400':
 *          description: Bad request
 *        '429':
 *          description: Too many requests
 */

/**
 * @swagger
 *  /search/users:
 *    get:
 *      summary: Search for users by (username,screen name , email , phone)
 *      tags:
 *        - Search and Discover
 *      parameters:
 *        - in: query
 *          name: username
 *          schema:
 *            type: string
 *          description: the username you are searching for
 *        - in: query
 *          name: screenName
 *          schema:
 *            type: string
 *          description: the screenName you are searching for
 *        - in: query
 *          name: email
 *          schema:
 *            type: string
 *          description: the email you are searching for
 *        - in: query
 *          name: phone
 *          schema:
 *            type: string
 *          description: the phone number you are searching for
 *      responses:
 *        '200':
 *          description: A list of users match the given data
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
 *                        username:
 *                          type: string
 *                        screenName:
 *                          type: string
 *                        email:
 *                          type: string
 *                        phone:
 *                          type: string
 *                        picture:
 *                          type: string
 *                        bio:
 *                          type: string
 *                        status:
 *                          type: string
 *                        isBanned:
 *                          type: boolean
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /search/messages:
 *    get:
 *      summary: >-
 *        Search for messages matching the given string in public groups or
 *        channels
 *      tags:
 *        - Search and Discover
 *      parameters:
 *        - in: query
 *          name: message
 *          schema:
 *            type: string
 *          description: the message you are searching for in public groups
 *      responses:
 *        '200':
 *          description: A list of messages in the public groups which match the given data
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
 *                        content:
 *                          type: string
 *                        sentBy:
 *                          type: string
 *                        timestamp:
 *                          type: string
 *                          format: date-time
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /search/message/{chatId}:
 *    get:
 *      summary: Search for messages in a certain chat
 *      tags:
 *        - Search and Discover
 *      parameters:
 *        - in: path
 *          name: chatId
 *          schema:
 *            type: string
 *          required: true
 *          description: >-
 *            the chat id that the messages which match the given string belongs
 *            to
 *        - in: query
 *          name: mediaType
 *          schema:
 *            type: string
 *            enum:
 *              - text
 *              - image
 *              - video
 *              - link
 *          description: The media type of the message you are searching for
 *      responses:
 *        '200':
 *          description: A list of messages in the public groups which match the given data
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
 *                        content:
 *                          type: string
 *                        sentBy:
 *                          type: string
 *                        timestamp:
 *                          type: string
 *                          format: date-time
 *        '400':
 *          description: Bad request
 */
