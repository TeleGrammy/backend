/**
 * @swagger
 * /messaging/upload/audio:
 *   post:
 *     summary: Upload an audio file
 *     description: Endpoint for uploading an audio file to the server.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: The audio file to be uploaded.
 *     responses:
 *       200:
 *         description: Audio uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Audio uploaded successfully"
 *                 mediakey:
 *                   type: string
 *                   example: "media/audio/test.ogg"
 *                 signedUrl:
 *                   type: string
 *                   example: "https://example.com/audio/123456"
 */

/**
 * @swagger
 * /messaging/upload/media:
 *   post:
 *     summary: Upload a media file
 *     description: Endpoint for uploading a media file (image, video, etc.) to the server.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: The media file to be uploaded.
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Media uploaded successfully"
 *                 mediakey:
 *                   type: string
 *                   example: "media/media/test.jpg"
 *                 signedUrl:
 *                   type: string
 *                   example: "https://example.com/media/123456"
 */

/**
 * @swagger
 * /messaging/upload/document:
 *   post:
 *     summary: Upload a document file
 *     description: Endpoint for uploading a document file to the server.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The document file to be uploaded.
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Document uploaded successfully"
 *                 mediakey:
 *                   type: string
 *                   example: "media/document/test.pdf"
 *                 signedUrl:
 *                   type: string
 *                   example: "https://example.com/document/123456"
 */

/**
 * @swagger
 * /messaging/upload/sticker:
 *   post:
 *     summary: Upload a sticker file
 *     description: Endpoint for uploading a sticker file to the server.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sticker:
 *                 type: string
 *                 format: binary
 *                 description: The sticker file to be uploaded.
 *     responses:
 *       200:
 *         description: Sticker uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sticker uploaded successfully"
 *                 mediakey:
 *                   type: string
 *                   example: "media/sticker/test.png"
 *                 signedUrl:
 *                   type: string
 *                   example: "https://example.com/sticker/123456"
 */
