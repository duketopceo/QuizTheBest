import { Request, Response } from 'express'
import { logger } from '../../utils/logger'
import { searchOrchestrator } from '../search/searchOrchestrator'
import { createStudySet } from '../firestore/studySets'
import { createTopic } from '../firestore/topics'
import { contentSanitizer } from '../../utils/contentSanitizer'

/**
 * Action Group Handler for Bedrock Agent
 * 
 * This service handles action group invocations from the Bedrock Agent.
 * The agent can call backend API functions through action groups configured
 * in the AWS Bedrock console.
 * 
 * Action groups should be configured with OpenAPI schemas that define
 * the available functions and their parameters.
 */

export interface ActionGroupRequest {
  actionGroupInvocationInput: {
    actionGroupName: string
    verb: string
    apiPath: string
    parameters?: Array<{
      name: string
      type: string
      value: any
    }>
    requestBody?: {
      content: {
        [key: string]: {
          body: string
        }
      }
    }
  }
  sessionId: string
  messageVersion: string
}

export interface ActionGroupResponse {
  messageVersion: string
  response: {
    actionGroup: string
    apiPath: string
    httpMethod: string
    httpStatusCode: number
    responseBody: {
      [key: string]: {
        body: string
      }
    }
  }
}

/**
 * Handle action group invocations from Bedrock Agent
 * 
 * This function processes action group requests and routes them to
 * the appropriate backend service functions.
 */
export async function handleActionGroupInvocation(
  req: ActionGroupRequest,
  userId: string
): Promise<ActionGroupResponse> {
  const { actionGroupInvocationInput, sessionId, messageVersion } = req
  const { actionGroupName, verb, apiPath, parameters, requestBody } = actionGroupInvocationInput

  logger.info('Action group invocation', {
    actionGroupName,
    verb,
    apiPath,
    sessionId,
    userId,
  })

  try {
    // Parse parameters into a map for easier access
    const paramsMap = new Map<string, any>()
    if (parameters) {
      parameters.forEach((param) => {
        paramsMap.set(param.name, param.value)
      })
    }

    // Parse request body if present
    let bodyData: any = null
    if (requestBody?.content) {
      const contentType = Object.keys(requestBody.content)[0]
      const bodyContent = requestBody.content[contentType]?.body
      if (bodyContent) {
        try {
          bodyData = JSON.parse(bodyContent)
        } catch (e) {
          bodyData = bodyContent
        }
      }
    }

    // Route to appropriate handler based on action group and API path
    let responseData: any

    switch (actionGroupName) {
      case 'StudySetGeneration':
        responseData = await handleStudySetGeneration(verb, apiPath, paramsMap, bodyData, userId)
        break

      case 'ContentSearch':
        responseData = await handleContentSearch(verb, apiPath, paramsMap, bodyData)
        break

      case 'DataStorage':
        responseData = await handleDataStorage(verb, apiPath, paramsMap, bodyData, userId)
        break

      default:
        throw new Error(`Unknown action group: ${actionGroupName}`)
    }

    // Format response according to Bedrock Agent action group response format
    return {
      messageVersion,
      response: {
        actionGroup: actionGroupName,
        apiPath,
        httpMethod: verb,
        httpStatusCode: 200,
        responseBody: {
          'application/json': {
            body: JSON.stringify(responseData),
          },
        },
      },
    }
  } catch (error: any) {
    logger.error('Action group handler error', {
      actionGroupName,
      apiPath,
      error: error.message,
      stack: error.stack,
    })

    // Return error response
    return {
      messageVersion,
      response: {
        actionGroup: actionGroupName,
        apiPath,
        httpMethod: verb,
        httpStatusCode: 500,
        responseBody: {
          'application/json': {
            body: JSON.stringify({
              error: {
                code: 'ACTION_GROUP_ERROR',
                message: error.message,
              },
            }),
          },
        },
      },
    }
  }
}

/**
 * Handle StudySetGeneration action group
 */
async function handleStudySetGeneration(
  verb: string,
  apiPath: string,
  params: Map<string, any>,
  body: any,
  userId: string
): Promise<any> {
  // Example: POST /generate/studyset
  if (verb === 'POST' && apiPath.includes('/generate/studyset')) {
    const topic = body?.topic || params.get('topic')
    if (!topic) {
      throw new Error('Topic is required')
    }

    // This would typically trigger the generation orchestrator
    // For now, return a placeholder response
    return {
      success: true,
      message: 'Study set generation initiated',
      topic,
    }
  }

  throw new Error(`Unsupported endpoint: ${verb} ${apiPath}`)
}

/**
 * Handle ContentSearch action group
 */
async function handleContentSearch(
  verb: string,
  apiPath: string,
  params: Map<string, any>,
  body: any
): Promise<any> {
  // Example: GET /search?query=...
  if (verb === 'GET' && apiPath.includes('/search')) {
    const query = params.get('query') || body?.query
    if (!query) {
      throw new Error('Search query is required')
    }

    const results = await searchOrchestrator.search(query)
    return {
      success: true,
      results: results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet || r.content?.substring(0, 200),
      })),
    }
  }

  throw new Error(`Unsupported endpoint: ${verb} ${apiPath}`)
}

/**
 * Handle DataStorage action group
 */
async function handleDataStorage(
  verb: string,
  apiPath: string,
  params: Map<string, any>,
  body: any,
  userId: string
): Promise<any> {
  // Example: POST /study-sets
  if (verb === 'POST' && apiPath.includes('/study-sets')) {
    const { topic, summary, flashcards, quiz } = body

    if (!topic || !summary || !flashcards || !quiz) {
      throw new Error('Missing required fields: topic, summary, flashcards, quiz')
    }

    // Sanitize content before storing
    const sanitizedSummary = contentSanitizer.sanitize(summary)
    if (!contentSanitizer.validate(sanitizedSummary)) {
      throw new Error('Summary validation failed')
    }

    const studySetId = await createStudySet(userId, topic, sanitizedSummary, flashcards, quiz)
    const topicId = await createTopic(userId, topic, studySetId)

    return {
      success: true,
      studySetId,
      topicId,
    }
  }

  // Example: GET /study-sets/:id
  if (verb === 'GET' && apiPath.includes('/study-sets')) {
    const studySetId = params.get('id')
    if (!studySetId) {
      throw new Error('Study set ID is required')
    }

    // This would fetch from Firestore
    // For now, return placeholder
    return {
      success: true,
      studySetId,
    }
  }

  throw new Error(`Unsupported endpoint: ${verb} ${apiPath}`)
}

/**
 * Express middleware to handle action group callbacks
 * 
 * This endpoint is called by Bedrock Agent when action groups are invoked.
 * It should be configured in the Bedrock Agent action group settings.
 */
export function actionGroupCallbackHandler() {
  return async (req: Request, res: Response) => {
    try {
      // Extract user ID from request (should be set by auth middleware)
      const userId = (req as any).user?.sub
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
        })
      }

      const actionGroupRequest = req.body as ActionGroupRequest
      const response = await handleActionGroupInvocation(actionGroupRequest, userId)

      res.json(response)
    } catch (error: any) {
      logger.error('Action group callback error', error)
      res.status(500).json({
        error: {
          code: 'CALLBACK_ERROR',
          message: error.message,
        },
      })
    }
  }
}

