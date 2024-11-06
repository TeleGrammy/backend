/**
 * @swagger
 *  /admins/users:
 *    get:
 *      summary: 'Get all registered users '
 *      description: List all users in the application
 *      tags:
 *        - Admin Dashboard
 *      responses:
 *        '200':
 *          description: Retrieved the registered users successfully.
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
 *          description: Bad request.
 */

/**
 * @swagger
 *  /admins/users/{userId}:
 *    patch:
 *      summary: Ban or Deactivate User
 *      description: Ban or deactivate a specific user by setting their account status.
 *      tags:
 *        - Admin Dashboard
 *      parameters:
 *        - in: path
 *          name: userId
 *          required: true
 *          schema:
 *            type: string
 *          description: The id of the user whose ban state will be updated
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                isBanned:
 *                  type: boolean
 *              required:
 *                - isBanned
 *            example:
 *              isBanned: true
 *      responses:
 *        '200':
 *          description: Email verified successfully.
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
 *                      picture:
 *                        type: string
 *                      bio:
 *                        type: string
 *                      status:
 *                        type: string
 *                      isBanned:
 *                        type: boolean
 *        '400':
 *          description: Bad request.
 */
