import { Context, APIGatewayProxyEvent } from "aws-lambda";

export default function handler(lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<string>) {
    return async function (event: APIGatewayProxyEvent, context: Context) {
        let body, statusCode;

        try {
            // Run the lambda
            statusCode = 200
            body = await lambda(event, context)
        } catch (error) {
            statusCode = 500
            body = JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
        }

        // Return the HTTP response
        return { body, statusCode }
    }
}