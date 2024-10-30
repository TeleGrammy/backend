/**
 * @swagger
 *  /auth/register:
 *    post:
 *      summary: Register a new user
 *      description: A novel user registers to the application.
 *      tags:
 *        - Authentication
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  description: the username used in tha app
 *                email:
 *                  type: string
 *                  format: email
 *                password:
 *                  type: string
 *                passwordConfirm:
 *                  type: string
 *                phone:
 *                  type: string
 *              required:
 *                - username
 *                - email
 *                - password
 *                - passwordConfirm
 *                - phone
 *            example:
 *              username: test1
 *              email: ' test@example.com'
 *              password: password1234
 *              passwordConfirm: password1234
 *              phone: '010101010101'
 *      responses:
 *        '201':
 *          description: User registered successfully.
 *        '400':
 *          description: Bad request.
 */

/**
 * @swagger
 *  /auth/verify:
 *    post:
 *      summary: Verify user email
 *      description: >-
 *        Verifying the user by clicking on the verification link sent to their
 *        email.
 *      tags:
 *        - Authentication
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                verificationCode:
 *                  type: string
 *              required:
 *                - email
 *                - verificationCode
 *            example:
 *              email: ' test@example.com'
 *              verificationCode: a1b457e#686@fd
 *      responses:
 *        '200':
 *          description: Email verified successfully.
 *        '400':
 *          description: Bad request.
 */

/**
 * @swagger
 *  /auth/resend-verification:
 *    post:
 *      summary: Resend verification link
 *      description: Resend the verification link to the user's email.
 *      tags:
 *        - Authentication
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: test@example.com
 *              required:
 *                - email
 *      responses:
 *        '200':
 *          description: Verification link resent successfully.
 *        '400':
 *          description: Bad request.
 */

/**
 * @swagger
 *  /auth/login:
 *    post:
 *      summary: User login
 *      description: Logging the user into the system.
 *      tags:
 *        - Authentication
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                UUID:
 *                  type: string
 *                  description: UUID is the email or username or phone number of the user
 *                password:
 *                  type: string
 *                  description: The password of the user
 *              required:
 *                - UUID
 *                - password
 *      responses:
 *        '200':
 *          description: User logged in successfully.
 *        '401':
 *          description: Unauthorized.
 */

/**
 * @swagger
 *  /auth/logout:
 *    post:
 *      summary: User logout
 *      description: Logging the user out of the system.
 *      tags:
 *        - Authentication
 *      responses:
 *        '200':
 *          description: User logged out successfully.
 * */

/**
 * @swagger
 *  /auth/logout-from-all-devices:
 *    post:
 *      summary: Logout from all devices
 *      description: Logging the user out from all devices.
 *      tags:
 *        - Authentication
 *      responses:
 *        '200':
 *          description: User logged out from all devices successfully.
 */

/**
 * @swagger
 *  /google:
 *    post:
 *      summary: Sign in with Google
 *      description: Register or log in with the user's Google account.
 *      tags:
 *        - Authentication
 *      responses:
 *        '200':
 *          description: User authenticated with Google.
 */

/**
 *  /github:
 *    post:
 *      summary: Sign in with GitHub
 *      description: Register or log in with the user's GitHub account.
 *      tags:
 *        - Authentication
 *      responses:
 *        '200':
 *          description: User authenticated with GitHub.
 */

/**
 * @swagger
 *  /facebook:
 *    post:
 *      summary: Sign in with Facebook
 *      description: Register or log in with the user's Facebook account.
 *      tags:
 *        - Authentication
 *      responses:
 *        '200':
 *          description: User authenticated with Facebook.
 */

/**
 * @swagger
 *  /forget-password:
 *    post:
 *      summary: Forget password
 *      description: Request to set a new password.
 *      tags:
 *        - Authentication
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: test@example.com
 *      responses:
 *        '200':
 *          description: Password reset link sent successfully.
 *        '400':
 *          description: Bad request.
 */

/**
 *  /reset-password/resend:
 *    post:
 *      summary: Resend reset token
 *      description: Resend a new reset token for resetting the user's password.
 *      tags:
 *        - Authentication
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: test@example.com
 *      responses:
 *        '200':
 *          description: Reset token resent successfully.
 *        '400':
 *          description: Bad request.
 */

/**
 * @swagger
 *  /reset-password/{token}:
 *    post:
 *      summary: Reset password
 *      description: Reset the user's password with the reset token sent to their email.
 *      tags:
 *        - Authentication
 *      parameters:
 *        - name: token
 *          in: path
 *          required: true
 *          description: The reset token
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                password:
 *                  type: string
 *                  example: test1234
 *                passwordConfirm:
 *                  type: string
 *                  example: test1234
 *      responses:
 *        '200':
 *          description: Password reset successfully.
 *        '400':
 *          description: Bad request.
 */
