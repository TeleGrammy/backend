/**
 * @swagger
 *  /user/profile:
    get:
      summary: Get user profile information
      description: Retrieve the profile information of the user.
      tags:
        - User Profile
      responses:
        '200':
          description: User profile information retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: object
                    properties:
                      _id:
                        type: string
                      username:
                        type: string
                      screenName:
                        type: string
                      email:
                        type: string
                      phone:
                        type: string
                      bio:
                        type: string
                      pictureURL:
                        type: string
              example:
                status: success
                data:
                  - _id: fgs554445dsf
                    username: test12
                    screenName: test test
                    email: example@test.com
                    phone: '0101010100'
                    bio: Lover of tech, coffee, and adventure. Always curious. 🌍
                    pictureURL: http://testdgffg
        '404':
          description: User not found.
    patch:
      summary: Update user profile information
      description: Update the profile information (username, screen name, phone, bio, and status) of the authenticated user.
      tags:
        - User Profile
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                phone:
                  type: string
                bio:
                  type: string
                screenName:
                  type: string
                status:
                  type: string
      responses:
        '200':
          description: User profile information updated successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: object
                    properties:
                      _id:
                        type: string
                      username:
                        type: string
                      screenName:
                        type: string
                      email:
                        type: string
                      phone:
                        type: string
                      bio:
                        type: string
                      pictureURL:
                        type: string
              example:
                status: success
                data:
                  - id: fgs554445dsf
                    username: test12
                    screenName: test test
                    email: example@test.com
                    phone: '0101010100'
                    bio: Lover of tech, coffee, and adventure. Always curious. 🌍
                    pictureURL: http://testdgffg
        '400':
          description: Duplicate field value.
        '404':
          description: User not found.
  /user/profile/status:
    get:
      summary: Get user activity status
      description: Retrieve the activity status of the authenticated user.
      tags:
        - User Profile
      responses:
        '200':
          description: User activity status retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: object
                    properties:
                      status:
                        type: string
                      lastSeen:
                        type: object
              example:
                status: success
                data:
                  status: active
                  lastSeen: '2022-01-01T12:00:00.000Z'
        '404':
          description: User not found.
    patch:
      summary: Update user activity status
      description: Update the activity status of the authenticated user.
      tags:
        - User Profile
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  default: active
                  enum:
                    - active
                    - inactive
      responses:
        '200':
          description: User activity status updated successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: object
                    properties:
                      status:
                        type: string
                      lastSeen:
                        type: object
              example:
                status: success
                data:
                  status: active
                  lastSeen: '2022-01-01T12:00:00.000Z'
        '404':
          description: User not found.
  /user/profile/picture:
    patch:
      summary: Update user profile picture
      description: Update the profile picture of the authenticated user.
      tags:
        - User Profile
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                picture:
                  type: string
                  format: binary
      responses:
        '200':
          description: User profile picture updated successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: object
                    properties:
                      _id:
                        type: string
                      username:
                        type: string
                      screenName:
                        type: string
                      email:
                        type: string
                      phone:
                        type: string
                      bio:
                        type: string
                      pictureURL:
                        type: string
              example:
                status: success
                data:
                  - _id: fgs554445dsf
                    username: test12
                    screenName: test test
                    email: example@test.com
                    phone: '0101010100'
                    bio: Lover of tech, coffee, and adventure. Always curious. 🌍
                    pictureURL: http://testdgffg
        '400':
          description: picture not uploaded.
        '404':
          description: User not found.
    delete:
      summary: Delete user profile picture
      description: Delete the profile picture of the authenticated user.
      tags:
        - User Profile
      responses:
        '200':
          description: User profile picture deleted successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: object
                    properties:
                      _id:
                        type: string
                      username:
                        type: string
                      screenName:
                        type: string
                      email:
                        type: string
                      phone:
                        type: string
                      bio:
                        type: string
                      pictureURL:
                        type: string
              example:
                status: success
                data:
                  _id: fgs554445dsf
                  username: test12
                  screenName: test test
                  email: example@test.com
                  phone: '0101010100'
                  bio: Lover of tech, coffee, and adventure. Always curious. 🌍
                  pictureURL: http://testdgffg
        '404':
          description: User not found.
  /user/profile/email:
    patch:
      summary: Request updating user email
      description: Update the email address of the authenticated user.
      tags:
        - User Profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
      responses:
        '202':
          description: Email update request accepted. Please confirm your new email.
        '400':
          description: Invalid new email.
        '404':
          description: User not found.
  /user/profile/email/new-code:
    patch:
      summary: Request new email confirmation code
      description: Request a new confirmation code for updating the email address.
      tags:
        - User Profile
      responses:
        '202':
          description: New confirmation code sent. Please confirm your new email.
        '404':
          description: User or New email not found.
  /user/profile/email/confirm:
    post:
      summary: Confirm new email
      description: Confirm the new email address with the provided confirmation code.
      tags:
        - User Profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                confirmationCode:
                  type: string
      responses:
        '200':
          description: New email confirmed successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: object
                    properties:
                      _id:
                        type: string
                      username:
                        type: string
                      screenName:
                        type: string
                      email:
                        type: string
                      phone:
                        type: string
                      bio:
                        type: string
                      pictureURL:
                        type: string
              example:
                status: success
                data:
                  _id: fgs554445dsf
                  username: test12
                  screenName: test test
                  email: example@test.com
                  phone: '0101010100'
                  bio: Lover of tech, coffee, and adventure. Always curious. 🌍
                  pictureURL: http://testdgffg
        '400':
          description: Duplicate field value.
        '401':
          description: Invalid confirmation code.
        '404':
          description: User Or New email not found .
  /user/profile/bio:
    delete:
      summary: Delete user bio
      description: Delete the bio of the authenticated user.
      tags:
        - User Profile
      responses:
        '200':
          description: User bio deleted successfully.
        '404':
          description: User not found.
  /user/profile/story:
    post:
      summary: Create a new story
      description: Create a new story for the authenticated user.
      tags:
        - User Story
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                content:
                  type: string
                media:
                  type: string
                  format: binary
      responses:
        '201':
          description: Story created successfully.
        '400':
          description: No content or media provided.
        '404':
          description: User not found.
    get:
      summary: Get user's stories
      description: Retrieve all stories of the authenticated user.
      tags:
        - User Story
      responses:
        '200':
          description: User's stories retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  user:
                    type: string
                  content:
                    type: string
                  media:
                    type: string
              
    delete:
      summary: Delete a story
      description: Delete a story of the authenticated user by its ID.
      tags:
        - User Story
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
      responses:
        '200':
          description: Story deleted successfully.
        '404':
          description: Story not found.
  /user/profile/story/{id}:
    get:
      summary: Get stories of a specific user
      description: Retrieve stories of a specific user by their ID.
      tags:
        - User Story
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User's stories retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  user:
                    type: string
                  content:
                    type: string
                  media:
                    type: string
        '403':
          description: Not authorized to view this user's stories.
  /user/profile/story//{id}:
    get:
      summary: Get a specific story
      description: Retrieve a specific story by its ID.
      tags:
        - User Story
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Story retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  user:
                    type: string
                  content:
                    type: string
                  media:
                    type: string
             
        '404':
          description: Story not found.

 */
