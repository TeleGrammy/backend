/**
 * @swagger
 *  /groups/{groupId}:
 *    get:
 *      summary: Get Group by ID
 *      description: Retrieves the information of a group using its unique identifier.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the group to retrieve information for.
 *      responses:
 *        '200':
 *          description: The group information was successfully retrieved.
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
 *                      group:
 *                        $ref: '#/components/schemas/group'
 *                  message:
 *                    type: string
 *                    example: The group was retrieved successfully.
 *        '400':
 *          description: Bad request. The request is malformed or missing necessary parameters.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *        '404':
 *          description: The group with the specified ID was not found.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Group not found.
 */
/**
 * @swagger
 *  /groups/{groupId}/admins/{userId}:
 *    patch:
 *      summary: Grant admin privileges to a regular member
 *      description: Promotes a regular member of the group to an admin role.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: The ID of the group to which the user will be added as an admin.
 *          required: true
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          description: The ID of the user who will be promoted to admin.
 *          required: true
 *      responses:
 *        '200':
 *          description: The user has been successfully promoted to admin.
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
 *                      group:
 *                        $ref: '#/components/schemas/group'
 *                      newAdmin:
 *                        $ref: '#/components/schemas/admin'
 *                  message:
 *                    type: string
 *                    example: The user has been successfully promoted to admin.
 *        '400':
 *          description: Bad request. The user is already an admin.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                    type: string
 *                    example: The user is already an admin
 *        '403':
 *          description: Unauthorized action. The user does not have permission to promote admins.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Unauthorized access. You do not have permission to add a new admin.
 *        '404':
 *          description: Group or user not found.
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: User not found. The user is not member of the group.
 *    delete:
 *      summary: Remove admin privileges from a user
 *      description: Removes the admin privileges from a user and returns them to a regular member role.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: The ID of the group from which the user is being removed as an admin.
 *          required: true
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          description: The ID of the user who will be removed from the admin list.
 *          required: true
 *      responses:
 *        '200':
 *          description: The user has been successfully removed from the admin list.
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
 *                      group:
 *                        $ref: '#/components/schemas/group'
 *                  message:
 *                    type: string
 *                    example: The user was successfully removed from the admin list and added back to members.
 *        '403':
 *          description: Unauthorized action. The user does not have permission to remove admins.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Unauthorized action. You do not have permission to demote an admin.
 *        '404':
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: User not found in admin list
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/size:
 *    patch:
 *      summary: Update the group size limit
 *      description: Allows updating the maximum size of the group. The new size must be greater than or equal to the current number of members in the group.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: The ID of the group whose size limit will be updated.
 *          required: true
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                groupSize:
 *                  type: integer
 *                  description: The new size limit of the group. It must be greater than or equal to the current number of members in the group.
 *                  example: 500
 *              required:
 *                - groupSize
 *      responses:
 *        '200':
 *          description: The group size has been successfully updated.
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
 *                      group:
 *                        $ref: '#/components/schemas/group'
 *                  message:
 *                    type: string
 *                    example: The group size has been updated successfully.
 *        '400':
 *          description: Invalid group size update request.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: The new size of the group is not allowed. The group contains more members than the specified size.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Insufficient permissions. Only the group owner can update the group size.
 *        '404':
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/group-type:
 *    patch:
 *      summary: Update the group type
 *      description: Allows the group owner to update the type of the group (Public or Private).
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: The ID of the group to update the type for.
 *          required: true
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                groupType:
 *                  type: string
 *                  enum:
 *                    - Private
 *                    - Public
 *                  description: The new type of the group. Must be either 'Private' or 'Public'.
 *                  example: Public
 *              required:
 *                - groupType
 *      responses:
 *        '200':
 *          description: Group type updated successfully.
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
 *                      group:
 *                        $ref: '#/components/schemas/group'
 *                  message:
 *                    type: string
 *                    example: The group type has been updated successfully
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Insufficient permissions. Only the group owner can update the group type.
 *        '404':
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/members:
 *    get:
 *      summary: Retrieve the member list
 *      description: Fetches a list of members in the specified group. Only accessible to group members or the group owner.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: The ID of the group whose members you want to retrieve.
 *          required: true
 *      responses:
 *        '200':
 *          description: The list of group members has been retrieved successfully.
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
 *                      count:
 *                        type: integer
 *                        description: The total number of participants in the group.
 *                        example: 5
 *                      members:
 *                        type: array
 *                        description: An array of group members and their details.
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: string
 *                              description: The unique identifier of the member.
 *                              example: 61234abcde56789f01234567
 *                            username:
 *                              type: string
 *                              description: The username of the member.
 *                              example: john_doe
 *                            screenName:
 *                              type: string
 *                              description: The screen name of the member.
 *                              example: John Doe
 *                            picture:
 *                              type: string
 *                              description: The profile picture URL of the member.
 *                              example: https://example.com/profiles/john_doe.png
 *                            lastSeen:
 *                              type: string
 *                              format: date-time
 *                              description: The last seen timestamp of the member.
 *                              example: '2024-11-30T12:34:56Z'
 *                            customTitle:
 *                              type: string
 *                              enum:
 *                                - Public
 *                                - Private
 *                              nullable: true
 *                              description: The custom title assigned to the member in the group.
 *                            permissions:
 *                              oneOf:
 *                                - $ref: '#/components/schemas/adminPermissions'
 *                                - $ref: '#/components/schemas/memberPermissions'
 *                  message:
 *                    type: string
 *                    example: The list of members has been retrieved successfully.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Forbidden Action. You are not member of that group
 *        '404':
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/admins:
 *    get:
 *      summary: Retrieve the admin list
 *      description: Fetches a list of admins in the specified group. This is accessible only to group members or the group owner.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: The ID of the group whose admins you want to retrieve.
 *          required: true
 *      responses:
 *        '200':
 *          description: The list of group admins is retrieved successfully.
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
 *                      count:
 *                        type: integer
 *                        description: The total number of admins in the group.
 *                        example: 5
 *                      admins:
 *                        type: array
 *                        description: An array of group admins and their details.
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: string
 *                              description: The unique identifier of the admin.
 *                              example: 61234abcde56789f01234567
 *                            username:
 *                              type: string
 *                              description: The username of the admin.
 *                              example: john_doe
 *                            screenName:
 *                              type: string
 *                              description: The screen name of the admin.
 *                              example: John Doe
 *                            picture:
 *                              type: string
 *                              description: The profile picture URL of the admin.
 *                              example: https://example.com/profiles/john_doe.png
 *                            lastSeen:
 *                              type: string
 *                              format: date-time
 *                              description: The last seen timestamp of the admin.
 *                              example: '2024-11-30T12:34:56Z'
 *                            customTitle:
 *                              type: string
 *                              description: The custom title assigned to the admin in the group.
 *                            permissions:
 *                              $ref: '#/components/schemas/adminPermissions'
 *                  message:
 *                    type: string
 *                    example: The list of admins has been retrieved successfully.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Forbidden Action. You are not member of that group
 *        '404':
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/mute-notification:
 *    patch:
 *      summary: Update mute notification settings for a group
 *      description: Allow members of a group to mute or unmute notifications for themselves
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          description: The ID of the group for which notification settings are updated.
 *          required: true
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                mute:
 *                  type: boolean
 *                  description: Set to `true` to mute notifications, `false` to unmute.
 *                muteUntil:
 *                  type: string
 *                  format: date-time
 *                  nullable: true
 *                  description: Optional. Specifies the time until which notifications should remain muted.If mute is false, set the value null
 *              required:
 *                - mute
 *                - muteUntil
 *      responses:
 *        '200':
 *          description: 'Successfully updated mute notification settings.Note: The response structure may vary based on the user role. Take a look on different structure in the schema of response.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: success
 *                      data:
 *                        type: object
 *                        properties:
 *                          user:
 *                            $ref: '#/components/schemas/member'
 *                      message:
 *                        type: string
 *                        example: The member has updated his mute notification successfully.
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: success
 *                      data:
 *                        type: object
 *                        properties:
 *                          user:
 *                            $ref: '#/components/schemas/admin'
 *                      message:
 *                        type: string
 *                        example: The member has updated his mute notification successfully.
 *        '404':
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: User not found in the group
 */

/**
 * @swagger
 *  /groups/{groupId}/members/{memberId}/permissions:
 *    patch:
 *      summary: Update member permissions
 *      description: Allows an admin to update a member's permissions within a group.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group in which the member's permissions are being updated.
 *        - in: path
 *          name: memberId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the member whose permissions will be updated.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/memberPermissions'
 *      responses:
 *        '200':
 *          description: Member's permissions updated successfully.
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
 *                      member:
 *                        $ref: '#/components/schemas/member'
 *                  message:
 *                    type: string
 *                    example: The user's permissions have been updated successfully.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Forbidden access. You do not have admin permissions to update member permissions.
 *        '404':
 *          description: 'Not Found: the group or user could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: User not found in the group
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/admins/{adminId}/permissions:
 *    patch:
 *      summary: Update admin permissions
 *      description: Allows a superAdmin or owner to update an admin's permissions within a group.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group in which the admin's permissions are being updated.
 *        - in: path
 *          name: adminId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the admin whose permissions will be updated.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/adminPermissions'
 *      responses:
 *        '200':
 *          description: Admin's permissions updated successfully.
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
 *                      admin:
 *                        $ref: '#/components/schemas/admin'
 *                  message:
 *                    type: string
 *                    example: The admin's permissions have been updated successfully.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Forbidden access. You don't have the permission to change the admin's permissions.
 *        '404':
 *          description: 'Not Found: the group or admin could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: admin not found in the group
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 */

/**
 * @swagger
 *   /groups/{groupId}/info:
 *    patch:
 *      summary: Update the group information
 *      description: Allows member who have permission to update the group information.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group whose information will be updated.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: The group name
 *                image:
 *                  type: string
 *                  description: The group image URL
 *                description:
 *                  type: string
 *                  description: The group description
 *      responses:
 *        '200':
 *          description: Group's information has been updated successfully.
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
 *                      group:
 *                        $ref: '#/components/schemas/group'
 *                  message:
 *                    type: string
 *                    example: The group information has been updated successfully.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Forbidden access. You do not have permission to change the group's information.
 *        '404':
 *          description: 'Not Found: the group or admin could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: User not found in the group
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/pin-message/{messageId}:
 *    patch:
 *      summary: Pin a message
 *      description: Allows an admin to pin a message in a group chat.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group in which the message will be pinned.
 *        - in: path
 *          name: messageId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the message to be pinned.
 *      responses:
 *        '200':
 *          description: Message pinned successfully.
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
 *                      pinnedMessages:
 *                        type: array
 *                        items:
 *                          type: string
 *                  message:
 *                    type: string
 *                    example: The message has been pinned successfully.
 *        '400':
 *          description: 'Bad Request: the message is already pinned  OR the limit of pinned messages is reached.'
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    oneOf:
 *                      - type: string
 *                        example: The limit of pinned messages is reached
 *                      - type: string
 *                        example: The message is already pinned
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: You don't have permission to pin a message
 *        '404':
 *          description: 'Not Found: the group or message could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Message not found
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/unpin-message/{messageId}:
 *    patch:
 *      summary: Unpin a message
 *      description: Allows an admin to unpin a message in a group chat.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group in which the message will be unpinned.
 *        - in: path
 *          name: messageId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the message to be unpinned.
 *      responses:
 *        '200':
 *          description: Message unpinned successfully.
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
 *                      pinnedMessages:
 *                        type: array
 *                        items:
 *                          type: string
 *                  message:
 *                    type: string
 *                    example: The message has been unpinned successfully.
 *        '400':
 *          description: 'Bad Request: the message is not pinned.'
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Message is not pinned
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: You don't have permission to unpin a message
 *        '404':
 *          description: 'Not Found: the group or message could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Message not found
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/download-media/{messageId}:
 *    get:
 *      summary: Download media
 *      description: check if the user has permission to download the media and then download the media
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group in which the media is located.
 *        - in: path
 *          name: messageId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the message containing the media to be downloaded.
 *      responses:
 *        '200':
 *          description: The user has a permission to download the media.
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
 *                      mediaUrl:
 *                        type: string
 *                  message:
 *                    type: string
 *                    example: You can download video media.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: You don't have permission to download video media
 *        '404':
 *          description: 'Not Found: the group or message or user could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Message not found
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: User not found in the group
 */
/**
 * @swagger
 *  /groups/{groupId}/group-permissions:
 *     patch:
 *      summary: Update group permissions
 *      description: Allows an admin to update the group permissions.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group in which the permissions will be updated.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/groupPermissions'
 *      responses:
 *        '200':
 *          description: Group permissions updated successfully.
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
 *                      groupPermissions:
 *                        $ref: '#/components/schemas/groupPermissions'
 *                  message:
 *                    type: string
 *                    example: The group permissions have been updated successfully.
 *        '403':
 *          description: Unauthorized action.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Forbidden access. You do not have permission to change the group's permissions.
 *        '404':
 *          description: 'Not Found: the group could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Group not found
 *     get:
 *      summary: Retrieve group permissions
 *      description: Fetches the group permissions.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group whose permissions will be retrieved.
 *      responses:
 *        '200':
 *          description: Group permissions retrieved successfully.
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
 *                      groupPermissions:
 *                        $ref: '#/components/schemas/groupPermissions'
 *                  message:
 *                    type: string
 *                    example: The group permissions have been retrieved successfully.
 *        '404':
 *          description: 'Not Found: the group could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: Group not found
 */

/**
 * @swagger
 *  /groups/{groupId}/user-info:
 *    get:
 *      summary: Retrieve user information
 *      description: Fetches the user information based on their role in the group (member or admin).
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group whose user information will be retrieved.
 *      responses:
 *        '200':
 *          description: User information retrieved successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  data:
 *                    oneOf:
 *                      - type: object
 *                        properties:
 *                          user:
 *                            type: object
 *                            properties:
 *                              memberId:
 *                                type: string
 *                                description: The member ID
 *                              permissions:
 *                                $ref: '#/components/schemas/memberPermissions'
 *                              mute:
 *                                type: boolean
 *                                description: Flag indicating if notifications are muted
 *                              muteUntil:
 *                                type: string
 *                                format: date-time
 *                                description: The time at which notifications will be unmuted
 *                              role:
 *                                type: string
 *                                enum:
 *                                  - member
 *                                description: The role of the user in the group
 *                      - type: object
 *                        properties:
 *                          user:
 *                            type: object
 *                            properties:
 *                              adminId:
 *                                type: string
 *                                description: The admin ID
 *                              permissions:
 *                                $ref: '#/components/schemas/adminPermissions'
 *                              mute:
 *                                type: boolean
 *                                description: Flag indicating if notifications are muted
 *                              muteUntil:
 *                                type: string
 *                                format: date-time
 *                                description: The time at which notifications will be unmuted
 *                              role:
 *                                type: string
 *                                enum:
 *                                  - admin
 *                                description: The role of the user in the group
 *                              customTitle:
 *                                type: string
 *                                description: The custom title assigned to the admin in the group.
 *                  message:
 *                    type: string
 *                    example: The user information has been retrieved successfully.
 *        '404':
 *          description: 'Not Found: The user could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: fail
 *                  message:
 *                    type: string
 *                    example: User not found
 */

/**
 * @swagger
 *  /groups/{groupId}/member-permissions/{memberId}:
 *    get:
 *      summary: Retrieve member permissions
 *      description: Fetches the member permissions.
 *      tags:
 *        - Groups
 *      parameters:
 *        - in: path
 *          name: groupId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the group in which the member permissions will be retrieved.
 *        - in: path
 *          name: memberId
 *          schema:
 *            type: string
 *          required: true
 *          description: The ID of the member whose permissions will be retrieved.
 *      responses:
 *        '200':
 *          description: Member permissions retrieved successfully.
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
 *                      permissions:
 *                        oneOf:
 *                          - $ref: '#/components/schemas/memberPermissions'
 *                          - $ref: '#/components/schemas/adminPermissions'
 *                  message:
 *                    type: string
 *                    example: The member permissions have been retrieved successfully.
 *        '404':
 *          description: 'Not Found: the group or member could not be found.'
 *          content:
 *            application/json:
 *              schema:
 *                oneOf:
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Member not found in the group
 *                  - type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: fail
 *                      message:
 *                        type: string
 *                        example: Group not found
 */

/**
 * @swagger
 *components:
 *  schemas:
 *    group:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: The group name
 *        image:
 *          type: string
 *          description: The URL of the group image
 *        description:
 *          type: string
 *          description: The group description
 *        groupType:
 *          type: string
 *          enum:
 *            - Private
 *            - Public
 *          description: The type of group
 *        ownerId:
 *          type: string
 *          description: The id of the group's owner
 *        groupSizeLimit:
 *          type: integer
 *          description: The maximum capacity of the group
 *        chatId:
 *          type: string
 *          description: The ID of chat used by the group
 *        groupPermissions:
 *          $ref: '#/components/schemas/groupPermissions'
 *        admins:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/admin'
 *        members:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/member'
 *    admin:
 *      type: object
 *      properties:
 *        adminId:
 *          type: string
 *          description: The admin id
 *        joinedAt:
 *          type: string
 *          format: date-time
 *          description: The time which he joined the group at
 *        leftAt:
 *          type: string
 *          format: date-time
 *          description: The time which he left the group at if any. If he was a member of the group and left it. that time is saved here.
 *        adminAt:
 *          type: string
 *          format: date-time
 *          description: The time which he became an admin at
 *        superAdminId:
 *          type: string
 *          format: date-time
 *          description: The admin id who promote that user as admin
 *        mute:
 *          type: boolean
 *          description: flag if the user activate mute notification
 *        muteUntil:
 *          type: string
 *          format: date-time
 *          description: The time at which the mute notification will be deactivated
 *        customTitle:
 *          type: string
 *          description: The custom title of each admin
 *        permissions:
 *          $ref: '#/components/schemas/adminPermissions'
 *    member:
 *      type: object
 *      properties:
 *        memberId:
 *          type: string
 *          description: The member id
 *        joinedAt:
 *          type: string
 *          format: date-time
 *          description: The time which he joined the group at
 *        leftAt:
 *          type: string
 *          format: date-time
 *          description: The time which he left the group at if any. If he was a member of the group and left it. that time is saved here.
 *        mute:
 *          type: boolean
 *          description: flag if the user activate mute notification
 *        muteUntil:
 *          type: string
 *          format: date-time
 *          description: The time at which the mute notification will be deactivated
 *        permissions:
 *            $ref: '#/components/schemas/memberPermissions'
 *    groupPermissions:
 *      type: object
 *      properties:
 *        sendTextMessages:
 *          type: boolean
 *        sendMedia:
 *          type: object
 *          properties:
 *            photos:
 *              type: boolean
 *            videos:
 *              type: boolean
 *            files:
 *              type: boolean
 *            music:
 *              type: boolean
 *            voiceMessages:
 *              type: boolean
 *            videoMessages:
 *              type: boolean
 *            stickers:
 *              type: boolean
 *            polls:
 *              type: boolean
 *            embedLinks:
 *              type: boolean
 *        addUsers:
 *          type: boolean
 *        pinMessages:
 *          type: boolean
 *        changeChatInfo:
 *          type: boolean
 *        downloadVideos:
 *          type: boolean
 *        downloadVoiceMessages:
 *          type: boolean
 *    adminPermissions:
 *      type: object
 *      properties:
 *        changeGroupInfo:
 *          type: boolean
 *        deleteMessages:
 *          type: boolean
 *        banUsers:
 *          type: boolean
 *        addUsers:
 *          type: boolean
 *        inviteUsersViaLink:
 *          type: boolean
 *        pinMessages:
 *          type: boolean
 *        manageStories:
 *          type: object
 *          properties:
 *            postStories:
 *              type: boolean
 *            editStories:
 *              type: boolean
 *            deleteStories:
 *              type: boolean
 *        manageLiveStreams:
 *          type: boolean
 *        addNewAdmins:
 *          type: boolean
 *        remainAnonymous:
 *          type: boolean
 *    memberPermissions:
 *      type: object
 *      properties:
 *        sendMessages:
 *          type: boolean
 *        sendMedia:
 *          type: object
 *          properties:
 *            photos:
 *              type: boolean
 *            videos:
 *              type: boolean
 *            files:
 *              type: boolean
 *            music:
 *              type: boolean
 *            voiceMessages:
 *              type: boolean
 *            videoMessages:
 *              type: boolean
 *            stickers:
 *              type: boolean
 *            polls:
 *              type: boolean
 *            embedLinks:
 *              type: boolean
 *        addUsers:
 *          type: boolean
 *        pinMessages:
 *          type: boolean
 *        changeChatInfo:
 *          type: boolean
 *        downloadVideos:
 *          type: boolean
 *        downloadVoiceMessages:
 *          type: boolean
 */
