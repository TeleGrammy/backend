/**
 * @swagger
 *  /api/v1/user/stories:
 *    post:
 *      summary: create a story
 *      description: create a story
 *      tags:
 *        - Stories
 *      operationId: createAStory
 *      requestBody:
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                content:
 *                  type: string
 *                  example: my first story
 *                story:
 *                  type: string
 *                  format: binary
 *      responses:
 *        '201':
 *          description: create a story
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '623'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:02:59 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"26f-ZEtT965N0x3XPagMoP66XqomZg8"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  data:
 *                    type: object
 *                    properties:
 *                      __v:
 *                        type: number
 *                        example: 0
 *                      _id:
 *                        type: string
 *                        example: 672274d38f3a349c9b437fd3
 *                      content:
 *                        type: string
 *                        example: my first story
 *                      expiresAt:
 *                        type: string
 *                        example: '2024-10-31T18:02:47.394Z'
 *                      media:
 *                        type: string
 *                        example: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730311377430-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180259Z&X-Amz-Expires=900&X-Amz-Signature=0b32521501ad46c4b04d2414a1ee2cac57dd3b670150146a8e5cafa20a334b4f&X-Amz-SignedHeaders=host&x-id=GetObject
 *                      userId:
 *                        type: string
 *                        example: 672205dc2a3bb0aeed7c88fb
 *                  status:
 *                    type: string
 *                    example: success
 *              examples:
 *                create a story:
 *                  value:
 *                    data:
 *                      __v: 0
 *                      _id: 672274d38f3a349c9b437fd3
 *                      content: my first story
 *                      expiresAt: '2024-10-31T18:02:47.394Z'
 *                      media: >-
 *                        https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730311377430-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180259Z&X-Amz-Expires=900&X-Amz-Signature=0b32521501ad46c4b04d2414a1ee2cac57dd3b670150146a8e5cafa20a334b4f&X-Amz-SignedHeaders=host&x-id=GetObject
 *                      userId: 672205dc2a3bb0aeed7c88fb
 *                    status: success
 */

/**
 * @swagger
 *  /api/v1/user/stories/:
 *    get:
 *      summary: get user stories
 *      description: get user stories
 *      tags:
 *        - Stories
 *      operationId: getUserStories
 *      responses:
 *        '200':
 *          description: get user stories
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '4018'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:03:15 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"fb2-khPE2harRy44hZju70ZMepH7K2E"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  data:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        __v:
 *                          type: number
 *                          example: 0
 *                        _id:
 *                          type: string
 *                          example: 672274d38f3a349c9b437fd3
 *                        content:
 *                          type: string
 *                          example: my first story
 *                        expiresAt:
 *                          type: string
 *                          example: '2024-10-31T18:02:47.394Z'
 *                        media:
 *                          type: string
 *                          example: >-
 *                            https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730311377430-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=6ab1136906f8af6ee8e30edba80ae95957235b5bce0645b9ca4eefa68f767dee&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId:
 *                          type: string
 *                          example: 672205dc2a3bb0aeed7c88fb
 *                        viewers:
 *                          type: object
 *                          properties:
 *                            672205dc2a3bb0aeed7c88fb:
 *                              type: string
 *                              example: '2024-10-30T17:51:52.016Z'
 *                    example:
 *                      - __v: 0
 *                        _id: 672274d38f3a349c9b437fd3
 *                        content: my first story
 *                        expiresAt: '2024-10-31T18:02:47.394Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730311377430-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=6ab1136906f8af6ee8e30edba80ae95957235b5bce0645b9ca4eefa68f767dee&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672263755f74b60a54232731
 *                        content: my first story
 *                        expiresAt: '2024-10-31T16:47:28.592Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730306931547-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=ecf5f8eaac0f309eda1a2471cd494f5ef0b1b8d41829ff75585d58c72bbe43d3&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                        viewers:
 *                          672205dc2a3bb0aeed7c88fb: '2024-10-30T17:51:52.016Z'
 *                      - __v: 0
 *                        _id: 672209b2c1960a698f8022ed
 *                        content: my i'm here story
 *                        expiresAt: '2024-10-31T10:25:34.951Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283953904-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=5407cdbd4ad88f8f2854a62cbebfaf2f9e6ddd66c678b5a439cc3bf4e3d0569d&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                        viewers:
 *                          672205dc2a3bb0aeed7c88fb: '2024-10-30T17:51:32.442Z'
 *                      - __v: 0
 *                        _id: 67220945a3857223f9dd6838
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:24:00.937Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283844436-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=7bdb4801954b5346fbb80d15134e89e45728aa4d300b042441cc8eb2930c7144&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672209357dd267ad56119980
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:23:40.239Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283827788-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=4d15a82ed0d894ad2122f2a21e655501d24a408557a1329ec8b973c0d3fa296a&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 6722089e64836531d1f11502
 *                        content: my first story
 *                        expiresAt: '2024-10-31T10:21:16.187Z'
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672208ac64836531d1f11510
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:21:16.187Z'
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672208c464836531d1f11518
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:21:16.187Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283715349-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=54a9b6ad416a4ec78070e4f7e1661bf3c2d56b2fb8f32b1f400551de597a9418&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                  status:
 *                    type: string
 *                    example: success
 *              examples:
 *                get user stories:
 *                  value:
 *                    data:
 *                      - __v: 0
 *                        _id: 672274d38f3a349c9b437fd3
 *                        content: my first story
 *                        expiresAt: '2024-10-31T18:02:47.394Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730311377430-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=6ab1136906f8af6ee8e30edba80ae95957235b5bce0645b9ca4eefa68f767dee&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672263755f74b60a54232731
 *                        content: my first story
 *                        expiresAt: '2024-10-31T16:47:28.592Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730306931547-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=ecf5f8eaac0f309eda1a2471cd494f5ef0b1b8d41829ff75585d58c72bbe43d3&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                        viewers:
 *                          672205dc2a3bb0aeed7c88fb: '2024-10-30T17:51:52.016Z'
 *                      - __v: 0
 *                        _id: 672209b2c1960a698f8022ed
 *                        content: my i'm here story
 *                        expiresAt: '2024-10-31T10:25:34.951Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283953904-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=5407cdbd4ad88f8f2854a62cbebfaf2f9e6ddd66c678b5a439cc3bf4e3d0569d&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                        viewers:
 *                          672205dc2a3bb0aeed7c88fb: '2024-10-30T17:51:32.442Z'
 *                      - __v: 0
 *                        _id: 67220945a3857223f9dd6838
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:24:00.937Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283844436-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=7bdb4801954b5346fbb80d15134e89e45728aa4d300b042441cc8eb2930c7144&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672209357dd267ad56119980
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:23:40.239Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283827788-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=4d15a82ed0d894ad2122f2a21e655501d24a408557a1329ec8b973c0d3fa296a&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 6722089e64836531d1f11502
 *                        content: my first story
 *                        expiresAt: '2024-10-31T10:21:16.187Z'
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672208ac64836531d1f11510
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:21:16.187Z'
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                      - __v: 0
 *                        _id: 672208c464836531d1f11518
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:21:16.187Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283715349-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T180315Z&X-Amz-Expires=900&X-Amz-Signature=54a9b6ad416a4ec78070e4f7e1661bf3c2d56b2fb8f32b1f400551de597a9418&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                    status: success
 */

/**
 * @swagger
 *  /api/v1/user/stories/story/{storyId}:
 *    get:
 *      summary: get story by id
 *      description: get user story by it's id
 *      tags:
 *        - Stories
 *      operationId: getUserStoryById
 *      parameters:
 *        - in: path
 *          name: storyId
 *          required: true
 *          schema:
 *            type: string
 *          description: Id of the requested story
 *      responses:
 *        '200':
 *          description: get user story by id
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '623'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:13:56 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"26f-7P26MSPKZIei6qDqxRyiHSn79WI"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  data:
 *                    type: object
 *                    properties:
 *                      __v:
 *                        type: number
 *                        example: 0
 *                      _id:
 *                        type: string
 *                        example: 67227562459605c4acca9f25
 *                      content:
 *                        type: string
 *                        example: my first story
 *                      expiresAt:
 *                        type: string
 *                        example: '2024-10-31T18:04:39.804Z'
 *                      media:
 *                        type: string
 *                        example: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730311520921-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T181356Z&X-Amz-Expires=900&X-Amz-Signature=deda09bac1e4d0afe2000e9c58ca2bce148ed995db5155d241313ba049345cc5&X-Amz-SignedHeaders=host&x-id=GetObject
 *                      userId:
 *                        type: string
 *                        example: 672205dc2a3bb0aeed7c88fb
 *                  status:
 *                    type: string
 *                    example: success
 *              examples:
 *                get user story by id:
 *                  value:
 *                    data:
 *                      __v: 0
 *                      _id: 67227562459605c4acca9f25
 *                      content: my first story
 *                      expiresAt: '2024-10-31T18:04:39.804Z'
 *                      media: >-
 *                        https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730311520921-Screenshot%202024-08-04%20171151.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T181356Z&X-Amz-Expires=900&X-Amz-Signature=deda09bac1e4d0afe2000e9c58ca2bce148ed995db5155d241313ba049345cc5&X-Amz-SignedHeaders=host&x-id=GetObject
 *                      userId: 672205dc2a3bb0aeed7c88fb
 *                    status: success
 */

/**
 * @swagger
 *  /api/v1/user/stories/{storyId}/view:
 *    patch:
 *      summary: update story viewers
 *      description: update story viewers
 *      tags:
 *        - Stories
 *      operationId: updateStoryViewers
 *      parameters:
 *        - in: path
 *          name: storyId
 *          required: true
 *          schema:
 *            type: string
 *          description: Id of the story required to update it's viewers
 *      requestBody:
 *        content:
 *          application/json:
 *            examples:
 *              update story viewers:
 *                value: ''
 *      responses:
 *        '200':
 *          description: update story viewers
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '702'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:17:11 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"2be-8e5Kw5v2Y+zNgU8Y4dg76vYTIWM"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  data:
 *                    type: object
 *                    properties:
 *                      story:
 *                        type: object
 *                        properties:
 *                          __v:
 *                            type: number
 *                            example: 0
 *                          _id:
 *                            type: string
 *                            example: 672209b2c1960a698f8022ed
 *                          content:
 *                            type: string
 *                            example: my i'm here story
 *                          expiresAt:
 *                            type: string
 *                            example: '2024-10-31T10:25:34.951Z'
 *                          media:
 *                            type: string
 *                            example: >-
 *                              https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283953904-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T181711Z&X-Amz-Expires=900&X-Amz-Signature=21ba920bb328f128e9d6a470287c862d801eff74a2822798eae7d27a8ff82ca9&X-Amz-SignedHeaders=host&x-id=GetObject
 *                          userId:
 *                            type: string
 *                            example: 672205dc2a3bb0aeed7c88fb
 *                          viewers:
 *                            type: object
 *                            properties:
 *                              672205dc2a3bb0aeed7c88fb:
 *                                type: string
 *                                example: '2024-10-30T18:17:11.344Z'
 *                  status:
 *                    type: string
 *                    example: success
 *              examples:
 *                update story viewers:
 *                  value:
 *                    data:
 *                      story:
 *                        __v: 0
 *                        _id: 672209b2c1960a698f8022ed
 *                        content: my i'm here story
 *                        expiresAt: '2024-10-31T10:25:34.951Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283953904-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T181711Z&X-Amz-Expires=900&X-Amz-Signature=21ba920bb328f128e9d6a470287c862d801eff74a2822798eae7d27a8ff82ca9&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 672205dc2a3bb0aeed7c88fb
 *                        viewers:
 *                          672205dc2a3bb0aeed7c88fb: '2024-10-30T18:17:11.344Z'
 *                    status: success
 */

/**
 * @swagger
 *  /api/v1/user/stories/{userId}:
 *    get:
 *      summary: get stories of user by userid
 *      description: get stories of user by userid
 *      tags:
 *        - Stories
 *      operationId: getStoriesOfUserByUserid
 *      parameters:
 *        - in: path
 *          name: userId
 *          required: true
 *          schema:
 *            type: string
 *          description: Id of the user requiered to get it's stories
 *      responses:
 *        '200':
 *          description: get stories of user by userid
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '1221'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:23:16 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"4c5-m+sA/LDonzd6m104bRfd+jJSkNM"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  data:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        __v:
 *                          type: number
 *                          example: 0
 *                        _id:
 *                          type: string
 *                          example: 67220c715ec009be73d60a31
 *                        content:
 *                          type: string
 *                          example: my i'm here story
 *                        expiresAt:
 *                          type: string
 *                          example: '2024-10-31T10:37:26.505Z'
 *                        media:
 *                          type: string
 *                          example: >-
 *                            https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730284656147-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182316Z&X-Amz-Expires=900&X-Amz-Signature=cef8d6a308636c06e103e2f882c7b2fa6956b150b5c4f411446645e5d42b8c41&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId:
 *                          type: string
 *                          example: 671d3c3fa99c593917b9c977
 *                    example:
 *                      - __v: 0
 *                        _id: 67220c715ec009be73d60a31
 *                        content: my i'm here story
 *                        expiresAt: '2024-10-31T10:37:26.505Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730284656147-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182316Z&X-Amz-Expires=900&X-Amz-Signature=cef8d6a308636c06e103e2f882c7b2fa6956b150b5c4f411446645e5d42b8c41&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 671d3c3fa99c593917b9c977
 *                      - __v: 0
 *                        _id: 672209a2c1960a698f8022e4
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:25:34.951Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283937299-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182316Z&X-Amz-Expires=900&X-Amz-Signature=af01c41e91e8ae3c593b1132fddfbf6c6eb99c622e070d2c85fb51abc211f37a&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 671d3c3fa99c593917b9c977
 *                  status:
 *                    type: string
 *                    example: success
 *              examples:
 *                get stories of user by userid:
 *                  value:
 *                    data:
 *                      - __v: 0
 *                        _id: 67220c715ec009be73d60a31
 *                        content: my i'm here story
 *                        expiresAt: '2024-10-31T10:37:26.505Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730284656147-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182316Z&X-Amz-Expires=900&X-Amz-Signature=cef8d6a308636c06e103e2f882c7b2fa6956b150b5c4f411446645e5d42b8c41&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 671d3c3fa99c593917b9c977
 *                      - __v: 0
 *                        _id: 672209a2c1960a698f8022e4
 *                        content: my 15 story
 *                        expiresAt: '2024-10-31T10:25:34.951Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730283937299-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182316Z&X-Amz-Expires=900&X-Amz-Signature=af01c41e91e8ae3c593b1132fddfbf6c6eb99c622e070d2c85fb51abc211f37a&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 671d3c3fa99c593917b9c977
 *                    status: success
 */

/**
 * @swagger
 *  /api/v1/user/stories/contacts:
 *    get:
 *      summary: get stories of contacts of the user
 *      description: get stories of contacts of the user
 *      tags:
 *        - Stories
 *      operationId: getStoriesOfContactsOfTheUser
 *      parameters:
 *        - name: page
 *          in: query
 *          schema:
 *            type: string
 *            example: '1'
 *        - name: limit
 *          in: query
 *          schema:
 *            type: string
 *            example: '1'
 *      responses:
 *        '200':
 *          description: get stories of contacts of the user
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '628'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:22:44 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"274-hTg86n6Bh2a2l3pFD3zuGqjAJQs"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  data:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        __v:
 *                          type: number
 *                          example: 0
 *                        _id:
 *                          type: string
 *                          example: 67220c715ec009be73d60a31
 *                        content:
 *                          type: string
 *                          example: my i'm here story
 *                        expiresAt:
 *                          type: string
 *                          example: '2024-10-31T10:37:26.505Z'
 *                        media:
 *                          type: string
 *                          example: >-
 *                            https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730284656147-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182244Z&X-Amz-Expires=900&X-Amz-Signature=3428461bcfdacc0dbc870c188acc0b05378f35afd7542de454f166ea96d1715d&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId:
 *                          type: string
 *                          example: 671d3c3fa99c593917b9c977
 *                    example:
 *                      - __v: 0
 *                        _id: 67220c715ec009be73d60a31
 *                        content: my i'm here story
 *                        expiresAt: '2024-10-31T10:37:26.505Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730284656147-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182244Z&X-Amz-Expires=900&X-Amz-Signature=3428461bcfdacc0dbc870c188acc0b05378f35afd7542de454f166ea96d1715d&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 671d3c3fa99c593917b9c977
 *                  status:
 *                    type: string
 *                    example: success
 *              examples:
 *                get stories of contacts of the user:
 *                  value:
 *                    data:
 *                      - __v: 0
 *                        _id: 67220c715ec009be73d60a31
 *                        content: my i'm here story
 *                        expiresAt: '2024-10-31T10:37:26.505Z'
 *                        media: >-
 *                          https://telegrammy-general-s3.s3.us-east-1.amazonaws.com/media/stories/1730284656147-Screenshot%202024-08-11%20172834.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGPCLLYXOSNNPZ%2F20241030%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241030T182244Z&X-Amz-Expires=900&X-Amz-Signature=3428461bcfdacc0dbc870c188acc0b05378f35afd7542de454f166ea96d1715d&X-Amz-SignedHeaders=host&x-id=GetObject
 *                        userId: 671d3c3fa99c593917b9c977
 *                    status: success
 */

/**
 * @swagger
 *  /api/v1/user/stories/{storyId}:
 *    delete:
 *      summary: delete user story
 *      description: delete user story
 *      tags:
 *        - Stories
 *      operationId: deleteUserStory
 *      parameters:
 *        - in: path
 *          name: storyId
 *          required: true
 *          schema:
 *            type: string
 *          description: Id of the story requested to be deleted
 *      responses:
 *        '200':
 *          description: delete user story
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '59'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:30:04 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"3b-SXbTL6OObjKS40PZlOcDK9jkfMI"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Story deleted successfully
 *                  status:
 *                    type: string
 *                    example: success
 *              examples:
 *                delete user story:
 *                  value:
 *                    message: Story deleted successfully
 *                    status: success
 *        '403':
 *          description: delete user story
 *          headers:
 *            Access-Control-Allow-Credentials:
 *              schema:
 *                type: string
 *                example: 'true'
 *            Access-Control-Allow-Origin:
 *              schema:
 *                type: string
 *                example: '*'
 *            Connection:
 *              schema:
 *                type: string
 *                example: keep-alive
 *            Content-Length:
 *              schema:
 *                type: string
 *                example: '68'
 *            Date:
 *              schema:
 *                type: string
 *                example: Wed, 30 Oct 2024 18:29:49 GMT
 *            ETag:
 *              schema:
 *                type: string
 *                example: W/"44-xQh9tLgNej4u7NkpdvaIa1B1GUA"
 *            Keep-Alive:
 *              schema:
 *                type: string
 *                example: timeout=5
 *            X-Powered-By:
 *              schema:
 *                type: string
 *                example: Express
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User not authorized to view this story
 *                  status:
 *                    type: string
 *                    example: fail
 *              examples:
 *                delete user story:
 *                  value:
 *                    message: User not authorized to view this story
 *                    status: fail
 */
