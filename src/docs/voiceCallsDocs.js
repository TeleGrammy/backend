/**
 * @swagger
 *  /calls/history:
 *    get:
 *      summary: Retrieve past call records
 *      description: Fetches a list of past calls with details like duration and participants
 *      tags:
 *        - Voice Calls
 *      responses:
 *        '200':
 *          description: Successfully retrieved call history
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  calls:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        callId:
 *                          type: string
 *                        participants:
 *                          type: array
 *                          items:
 *                            type: string
 *                        duration:
 *                          type: string
 *                          format: time
 *                        date:
 *                          type: string
 *                          format: date-time
 *                  message:
 *                    type: string
 *        '400':
 *          description: Bad request - invalid input
 */
