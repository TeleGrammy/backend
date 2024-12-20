/**
 * @swagger
 *
 *  /search/global-search:
 *    get:
 *      summary: Search for users, groups, channels, and messages
 *      tags:
 *        - Search and Discover
 *      parameters:
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *            enum:
 *              - user
 *              - group
 *              - channel
 *              - message
 *          required: true
 *          description: Choose the type of the object you are searching for (user, group, channel, message)
 *        - in: query
 *          name: uuid
 *          schema:
 *            type: string
 *          description: The uuid of the object you are searching for (username , screenName, email, phone)
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          description: The name of group or channel you are searching for
 *        - in: query
 *          name: message
 *          schema:
 *            type: string
 *          description: The message you are searching for
 *        - in: query
 *          name: page
 *          schema:
 *            type: number
 *          description: The page number
 *        - in: query
 *          name: limit
 *          schema:
 *            type: number
 *          description: The limit of the number of objects per page
 *      responses:
 *        '200':
 *          description: A list of objects match the given data
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  page:
 *                    type: number
 *                  limit:
 *                    type: number
 *                  totalDocs:
 *                    type: number
 *                  data:
 *                    oneOf:
 *                      - type: object
 *                        properties:
 *                          user:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                _id:
 *                                  type: string
 *                                  description: The id of the user
 *                                username:
 *                                  type: string
 *                                  description: The username of the user
 *                                screenName:
 *                                  type: string
 *                                  description: The screen name of the user
 *                                email:
 *                                  type: string
 *                                  description: The email of the user
 *                                phone:
 *                                  type: string
 *                                  description: The phone of the user
 *                                picture:
 *                                  type: string
 *                                  description: The picture of the user
 *                                lastSeen:
 *                                  type: string
 *                                  description: The last seen of the user
 *                      - type: object
 *                        properties:
 *                          group:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                _id:
 *                                  type: string
 *                                  description: The id of the group
 *                                name:
 *                                  type: string
 *                                  description: The name of group
 *                                image:
 *                                  type: string
 *                                  description: The group image
 *                                description:
 *                                  type: string
 *                                  description: The Description of the group
 *                                chatId:
 *                                  type: string
 *                                  description: The chat id of the group
 *                                totalMembers:
 *                                  type: number
 *                                  description: The total members of the group
 *                      - type: object
 *                        properties:
 *                          channel:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                _id:
 *                                  type: string
 *                                  description: The id of the channel
 *                                name:
 *                                  type: string
 *                                  description: The name of channel
 *                                imageUrl:
 *                                  type: string
 *                                  description: The channel image
 *                                description:
 *                                  type: string
 *                                  description: The Description of the channel
 *                                chatId:
 *                                  type: string
 *                                  description: The chat id of the channel
 *                                membersCount:
 *                                  type: number
 *                                  description: The total members of the channel
 *                      - type: object
 *                        properties:
 *                          message:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                _id:
 *                                  type: string
 *                                  description: The id of the message
 *                                chatId:
 *                                  type: string
 *                                  description: The chat id of the message
 *                                groupId:
 *                                  type: string
 *                                  description: The group id of the message
 *                                channelId:
 *                                  type: string
 *                                  description: The channel id of the message
 *                                groupName:
 *                                  type: string
 *                                  description: The group name of the message
 *                                channelName:
 *                                  type: string
 *                                  description: The channel name of the message
 *                                groupImage:
 *                                  type: string
 *                                  description: The group image of the message
 *                                channelImage:
 *                                  type: string
 *                                  description: The channel image of the message
 *                                messageType:
 *                                  type: string
 *                                  description: The type of the message
 *                                content:
 *                                  type: string
 *                                  description: The content of the message
 *                                mediaUrl:
 *                                  type: string
 *                                  description: The media url of the message
 *                                timestamp:
 *                                  type: string
 *                                  description: The timestamp of the message
 *                  message:
 *                    type: string
 *        '400':
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                    type: string
 */
