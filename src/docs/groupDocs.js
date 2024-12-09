/**
 * @swagger
 *  /groups:
 *    post:
 *      summary: create New Group
 *      tags:
 *        - Groups
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: The name of group
 *                image:
 *                  type: string
 *                  format: binary
 *                  description: The group image
 *                description:
 *                  type: string
 *                  description: The Description of the group
 *              required:
 *                - name
 *            example:
 *              name: test1
 *              description: This is the official group of the university
 *      responses:
 *        '201':
 *          description: The group is created successfully
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
 *                      name:
 *                        type: string
 *                        description: The name of group
 *                      image:
 *                        type: string
 *                        format: binary
 *                        description: The group image
 *                      description:
 *                        type: string
 *                        description: The Description of the group
 *                  message:
 *                    type: string
 *                    example: The group is created Successfully
 *        '400':
 *          description: Bad request
 *        '429':
 *          description: Too many requests
 */

/**
 * @swagger
 *  /groups/{groupId}:
 *    delete:
 *      summary: Delete the group
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: Group's id needed to be deleted
 *      responses:
 *        '204':
 *          description: The group is deleted successfully
 *        '400':
 *          description: Bad request
 *    get:
 *      summary: Getting group info
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: Group's id needed to get its info
 *      responses:
 *        '200':
 *          description: Retrieving the group info successfully
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
 *                      user:
 *                        type: object
 *                        properties:
 *                          name:
 *                            type: string
 *                            description: The name of group
 *                          image:
 *                            type: string
 *                            format: binary
 *                            description: The group image
 *                          description:
 *                            type: string
 *                            description: The Description of the group
 *                          createdAt:
 *                            type: string
 *                            format: date-time
 *                            description: The time which the group was created At
 *                          members:
 *                            type: array
 *                            items:
 *                              type: string
 *                              description: The id of the members participate in the group
 *                          admins:
 *                            type: array
 *                            items:
 *                              type: string
 *                              description: The id of the admins of the group
 *                          chatId:
 *                            type: string
 *                            description: The chat ID
 *                  message:
 *                    type: string
 *        '400':
 *          description: Bad request
 *        '429':
 *          description: Too many requests
 */

/**
 * @swagger
 *  /groups/{groupId}/users:
 *    delete:
 *      summary: Leave a group
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: The group's id which the user wants to leave
 *      responses:
 *        '200':
 *          description: The user left the group successfully
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
 *                message: The user left the group successfully
 *        '400':
 *          description: Bad request
 *
 *    get:
 *      summary: View a list of group members
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: Group's id whose members will be retrieved as a list
 *      responses:
 *        '200':
 *          description: A list of all the members of the group
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  users:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                      username:
 *                        type: string
 *                      screenName:
 *                        type: string
 *                      email:
 *                        type: string
 *                      phone:
 *                        type: string
 *                      bio:
 *                        type: string
 *                      pictureURL:
 *                        type: string
 *              example:
 *                status: success
 *                members:
 *                  - id: fgs554445dsf
 *                    username: test12
 *                    screenName: test test
 *                    email: example@test.com
 *                    phone: '0101010100'
 *                    bio: Lover of tech, coffee, and adventure. Always curious. 🌍
 *                    pictureURL: http://testdgffg
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /groups/{groupId}/admins/{userId}:
 *    patch:
 *      summary: add admin privileges to a regular member of the group
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: Group's id which a new admin is added to
 *          required: true
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          description: user's Id who will the new admin
 *          required: true
 *      responses:
 *        '200':
 *          description: The user become group's admin
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
 *                message: The user get admin privileges successfully
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /groups/{groupId}/users/{userId}:
 *    post:
 *      summary: The admin add user to the group
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: Group's id which the admin add user to
 *          required: true
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          description: user's Id who will the new member of the group
 *          required: true
 *      responses:
 *        '200':
 *          description: The user become a member of the group
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
 *                message: The user is a group member now
 *        '400':
 *          description: Bad request
 *    delete:
 *      summary: The admin remove user from the group
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: Group's id which the admin remove user from
 *          required: true
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          description: The id of user who will be removed from the group
 *          required: true
 *      responses:
 *        '200':
 *          description: The user removed successfully from the group
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
 *                message: The user is removed from the group
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /groups/{groupId}/users/permissions/{userId}:
 *    patch:
 *      summary: >-
 *        Set permission for posting , editing ,deleting ,download videos and
 *        download audios
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: >-
 *            The ID of the group for which the message permissions of his member
 *            are being modified
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
 *                canPost:
 *                  type: boolean
 *                  description: Enable or disable posting messages
 *                canEdit:
 *                  type: boolean
 *                  description: Enable or disable editing messages
 *                canDelete:
 *                  type: boolean
 *                  description: Enable or disable deleting messages
 *                downloadVideo:
 *                  type: boolean
 *                  description: Enable or disable downloading videos
 *                downloadAudio:
 *                  type: boolean
 *                  description: Enable or disable downloading audios
 *            example:
 *              canPost: true
 *              canEdit: false
 *              canDelete: true
 *              downloadVideo: false
 *              downloadAudio: false
 *      responses:
 *        '200':
 *          description: user's permission is updated successfully
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
 *                message: The user's permissions are updated successfully
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
 *            The user does not have permission to change user's posting messages
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
 *                  You do not have permission to change user's posting messages
 *                  permission
 */

/**
 * @swagger
 *  /groups/{groupId}/privacy:
 *    patch:
 *      summary: change group privacy
 *      description: >-
 *        This endpoint allows only admins of the group to change its privacy
 *        settings.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: the group id you want to change its privacy settings
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                privacy:
 *                  type: string
 *                  enum:
 *                    - Public
 *                    - Private
 *                  description: the privacy option
 *              required:
 *                - privacy
 *      responses:
 *        '200':
 *          description: The privacy was updated
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
 *                message: The privacy was updated
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /groups/{groupId}/mute:
 *    patch:
 *      summary: >-
 *        Mutes notifications for a group for the current user, either permanently
 *        or for a specific duration
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: Group's id which the user wants to mute its notifications
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                mute:
 *                  type: boolean
 *                  description: the option for muting the notification of the group or not
 *                duration:
 *                  type: integer
 *                  enum:
 *                    - 0
 *                    - 60
 *                    - 480
 *                    - 2880
 *                    - -1
 *                  description: >-
 *                    Duration in minutes for which the notifications should be
 *                    muted. Use 0 for permanent mute. Use null when you don't
 *                    want to mute the notification
 *              required:
 *                - mute
 *            example:
 *              mute: true
 *              duration: 60
 *      responses:
 *        '200':
 *          description: The user muted the notifications for the group
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
 *                message: The user muted the notifications for a certain time
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /groups/{groupId}/admins/announcements:
 *    post:
 *      summary: >-
 *        This endpoint allows group admins to send announcements. Only users
 *        listed as admins can access this.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: Group's id to which the admin wants to send an announcement
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  description: Title of the announcement
 *                message:
 *                  type: string
 *                  description: Content of the announcement
 *              required:
 *                - title
 *                - message
 *            example:
 *              title: Announcement Title
 *              message: The content of the announcement.
 *      responses:
 *        '200':
 *          description: The admin sent an announcement
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
 *                message: The admin sent an announcement
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /groups/{groupId}/members/search:
 *    get:
 *      summary: search for members in a group by their name
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: Group's id whose member you search for
 *        - in: query
 *          name: name
 *          required: true
 *          schema:
 *            type: string
 *          description: The name of the user you are searching for
 *      responses:
 *        '200':
 *          description: A list of users with the same name
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  users:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                      username:
 *                        type: string
 *                      screenName:
 *                        type: string
 *                      email:
 *                        type: string
 *                      phone:
 *                        type: string
 *                      bio:
 *                        type: string
 *                      pictureURL:
 *                        type: string
 *              example:
 *                status: success
 *                members:
 *                  - id: fgs554445dsf
 *                    username: test12
 *                    screenName: test test
 *                    email: example@test.com
 *                    phone: '0101010100'
 *                    bio: Lover of tech, coffee, and adventure. Always curious. 🌍
 *                    pictureURL: http://testdgffg
 *        '400':
 *          description: Bad request
 */

/**
 * @swagger
 *  /groups/{groupId}/messages/search:
 *    get:
 *      summary: Search for messages in a group
 *      description: Retrieves a list of messages matching the search query.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: Group's id which you search for a message in its chat
 *        - in: query
 *          name: message
 *          required: true
 *          schema:
 *            type: string
 *          description: 'the message you are searching for '
 *      responses:
 *        '200':
 *          description: A list of messages that match the given message
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  messages:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                      content:
 *                        type: string
 *                      timestamp:
 *                        type: string
 *                        format: date-time
 *              example:
 *                status: success
 *                members:
 *                  - id: fgs554445dsf
 *                    content: This is the content of the message
 *                    timestamp: '2023-10-01T12:34:56Z'
 *        '400':
 *          description: Bad request
 */
