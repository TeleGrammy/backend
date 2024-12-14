# TeleGrammy API Documentation

Welcome to our API documentation, your guide to broadening and building your fancy chatting application.

> ⚠️ **Take Care:** To test our APIs, use the base URL for any request: **http://localhost:8080/api/v1/**

---

## Authentication and Registration Module

> The next endpoints have to be extended just after: **Base URL + /auth**

### User Registration

---

> **®️ Registration to the application:** A novel user registers to the application.
> _EndPoint:_ **/register** > _Request_Body_Example_:
> **{** > **"username":** test1
> **"email:** test@example.com,
> **"password":** password1234
> **"passwordConfirm":** password1234
> **"phone":** 01010101010101
> **}**

> **🔐 Verifying the pending status:** Verifying the user by clicking on the verifying link sent to his e-mail.
> _EndPoint:_ **/verify** > _Request_Body_Example_:
> **{** > **"email:** test@example.com,
> **"verificationCode":** a1b457e#686@fd
> **}**

> **📩 Resend the verification link:** Resend the verification link to the user's email.
> _EndPoint:_ **/resend-verification** > _Request_Body_Example_:
> **{** > **"email:** test@example.com,
> **}**

---

### Login - Logout

> **☄️ User Login:** Logging the user in the system.
> _EndPoint:_ **/login** > _Request_Example:_ > **{** > **"UUID":** test@example.com OR userName OR 01010101,
> **"password":** test123456
> **}**
> ⚠️**N.B:** **_UUID_** is the user's email, phone, or userName.

> **📤 User Logout:** Logging the user out of the system.
> _EndPoint:_ **/logout**

> **📤 Logout From All Devices:** Logging the user out of the system.
> _EndPoint:_ **/logout-from-all-devices**

> **🪪 Sign in with Google Account:** Register to the system with the user's google account.
> _EndPoint:_ **/google**

> **🪪 Sign in with GitHub Account:** Register to the system with the user's GitHub account.
> _EndPoint:_ **/github**

> **🪪 Sign in with FaceBook Account:** Register to the system with the user's FaceBook account.
> _EndPoint:_ **/facebook**

---

### Account Recovery

> **🔙 Forget Password:** The user forgets his password, and request for setting a new password.
> _EndPoint:_ **/forget-password** > _Request_Body_Example_:
> **{** > **"email":** test@example.com > **}**

> **➡️ Resend the Reset Token:** Resend a new reset token for resetting the user's password to his e-mail.
> _EndPoint:_ **/reset-password/resend** > _Request_Body_Example_:
> **{** > **"email":** test@example.com > **}**

> **⬅️ Reset Password:** Reset the user's password with the reset token sent to his e-mail.
> _EndPoint:_ **/reset-password/{token}** > _Request_Body_Example_:
>
> > ⚠️**N.B:** The placeholder **_token_** has to be sent as a route param.
>
> ```json
> {
> "password": test1234,
> "passwordConfirm": test1234
> }
> ```

---

## User Profile Management Module

> The next endpoints have to be extended just after: **Base URL + /user**

### Profile Settings

> **📷 Update Profile Picture** - Update the user's profile picture.
> _EndPoint:_ **/profile-picture?operation={value}** > _HTTP_Method:_ **PATCH** > **File Upload:**
>
> - The image file must be sent as part of the request body using `multipart/form-data`.
> - The file should be uploaded with the field name `file`.
>   > ⚠️**N.B:** The placeholder **_value_** has to be one of the following options:
>   >
>   > - "add"
>   > - "delete"
>   > - "update"

> **👤 Update Profile Bio** - Update the user's bio appeared in his profile information.
> _Endpoint:_ **/profile-bio** > _HTTP_Method:_ **PATCH** > _Request_Body_Example:_
>
> > ⚠️ **N.B:** The new bio has to be maximum 70 words.
>
> ```json
> {
>   "description": "It is a test description for updating the user's profile bio"
> }
> ```

> **👤 Update Profile UUID** - Update the user's username, email, or phone.
> _Endpoint:_ **/profile-UUID** > _HTTP_Method:_ **PUT** > _Request_Body_Example:_
>
> > ⚠️ **N.B:** All fields should not be empty.
>
> ```json
> {
> "username": "test",
> "email": "test@example.com",
> "phone": test1234
> }
> ```

> **📛 Update Profile Screen Name** - Update the user's scrren name appears to other Telegram users.
> _Endpoint:_ **/profile-screen-name** > _HTTP_Method:_ **PATCH** > _Request_Body_Example:_
>
> > ⚠️ **N.B:** Fields may be empty.
>
> ```json
> {
>   "screen-name": "test user"
> }
> ```

> **📛 Update Profile User Name** - Update the user's username appears to other Telegram users.
> _Endpoint:_ **/profile-user-name** > _HTTP_Method:_ **PATCH** > _Request_Body_Example:_
>
> > ⚠️ **N.B:** Fields may be empty.
>
> ```json
> {
>   "user-name": "test user"
> }
> ```

> **ℹ️ Retrieve Profile Info** - Get user's profile information as last seen, status, etc.
> _Endpoint:_ **/profile-info** > _HTTP_Method:_ **GET**

> **➡️ Upload Story** - Upload, and set a story for the user.
> _Endpoint:_ **/story/:storyId** > _HTTP_Method:_ **POST** > _Request_Body_Example:_
>
> > ⚠️**N.B:** The placeholder **_storyId_** has to be sent as a route. param.
>
> ```json
> 1- For text stories:
> {
>   "contentType": "text",
>   "content": "This a sample test"
> }
> 2- For video stories:
> {
>  "contentType": "video",
>  "description": "This is a sample video story.",
>  "file": "file"
> }
> 3- For image stories:
> {
>  "contentType": "image",
>  "description": "This is a sample video story.",
>  "file": "file"
> }
> ```

> **⬅️ Delete Story** - Delete, and remove a story for the user.
> _Endpoint:_ **/story/:storyId** > _HTTP_Method:_ **DELETE**

---

### Privacy Settings

> **🔏 Update Profile Privacy** - Update the user's privacy for fields that appears to other Telegram users.
> _Endpoint:_ **/profile-privacy?picture={first_value}&stories={second_value}&last-seen={third_value}** > _HTTP_Method:_ **PATCH** > _Request_Body_Example:_
>
> > ⚠️ **N.B:** The placeholders may take any value from these:
> >
> > - "everyone"
> > - "contacts"
> > - "nobody"

> **🚫 Block/Unblock** - Block or unblock other telegram users.
> _Endpoint:_ **/edit-blocking/:userId?make-block={value}** > _HTTP_Request:_ **PATCH**
>
> > ⚠️ **N.B:** The placeholder **_value_** may take any value from these:
> >
> > - "true"
> > - "false"

> **🚫 Retrieve blocked users** - Retrieve the list of blocked users.
> _Endpoint:_ **/get-blocked** > _HTTP_Request:_ **GET**

> **🔏 Control Groups and Channels Privacy** - Control the permissions for who can add users to groups, or channels.
> _Endpoint:_ **/rooms-privacy/:roomId?roomType={first_value}&permission={second_value}** > _HTTP_Method:_ **POST** > _Request_Body_Example:_
>
> > ⚠️**N.B:**
> >
> > - The placeholder **_roomId_** has to be sent as a param route.
> > - The placeholder **_first_value_** has to one of the following:
> >   - "group"
> >   - "channel"
> > - The placeholder **_second_value_** has to one of the following:
> >   - "everyone"
> >   - "admin"

---

## Admin Dashboard Module

> The next endpoints have to be extended just after: **Base URL + /admin**

### User Management

> **⚡ Retrieve Registered Users** - Retrieve all registered users.
> _Endpoint:_ **/get-users** > _HTTP_Method:_ **GET**

> **⛔ Ban/Deactivate Users** - Ban, or deactivate one of the registered users.
> _Endpoint:_ **/edit-access?permission={value}** > _HTTP_Method:_ **PUT**
>
> > ⚠️ **N.B:** The placeholder **_value_** may take any value from these:
> >
> > - "ban"
> > - "deactivate"
