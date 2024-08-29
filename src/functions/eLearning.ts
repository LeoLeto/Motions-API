import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type Payload = {
    title: string;
    description: string;
    target: string;
    size: number;
    outputType: string;
    language: string;
    logo: string;
    createQuizes: boolean;
};

function validatePayload(payload: any): boolean {
    const requiredKeys = [
        'title',
        'description',
        'target',
        'size',
        'outputType',
        'language',
        'logo',
        'createQuizes'
    ];

    const payloadKeys = Object.keys(payload);
    if (payloadKeys.length !== requiredKeys.length || !requiredKeys.every(key => payloadKeys.includes(key))) {
        return false;
    }

    if (
        typeof payload.title !== 'string' || payload.title.length <= 1 ||
        typeof payload.description !== 'string' || payload.description.length <= 3 ||
        typeof payload.target !== 'string' || payload.target.length <= 3 ||
        typeof payload.size !== 'number' || payload.size <= 0 ||
        typeof payload.outputType !== 'string' || payload.outputType.length <= 3 ||
        typeof payload.language !== 'string' || payload.language.length <= 3 ||
        typeof payload.logo !== 'string' || payload.logo.length < 0 ||
        typeof payload.createQuizes !== 'boolean'
    ) {
        return false;
    }

    return true;
}

export async function eLearning(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    let payload: Payload;
    try {
        const requestBody = await request.text();
        payload = JSON.parse(requestBody);
        if (!validatePayload(payload)) {
            return {
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Invalid payload structure or values." })
            };
        }
    } catch (error) {
        return {
            status: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Invalid JSON format." })
        };
    }

    
    let prompt = 
    `Create the table of contents for a course titled: ${payload.title} 
    The course description is:${payload.description}  
    The course is aimed at: ${payload.target} . 
    The table of contents should be divided into ${payload.size}  modules and should be in ${payload.language}.
    Do not say anything before or after the table of contents, no comments, just display the table of contents.
    `

    try {
        const respGpt = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a seasoned professor.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.2,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        const resp = respGpt.choices[0].message.content
            .replace(/[\r\n]/gm, "")
            .trim();

        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "resp": resp })
        };
    } catch (error: any) {
        return { 
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "error": error.message  }) 
        };
    }
}

app.http('eLearning', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: eLearning
});
