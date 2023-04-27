import { supabaseClient } from "@/lib/embeddings-supabase";
import { OpenAIStream, OpenAIStreamPayload } from "@/utils/OpenAIStream";
import { SystemContent, UserContent, AssistantContent } from "@/utils/Prompts";
import { oneLine, stripIndent } from "common-tags";
import GPT3Tokenizer from "gpt3-tokenizer";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    console.log("req.method ", req.method);
    return new Response("ok", { headers: corsHeaders });
  }

  const { question } = (await req.json()) as {
    question?: string;
  };

  if (!question) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const query = question;

  // OpenAI recommends replacing newlines with spaces for best results
  const input = query.replace(/\n/g, " ");
  // console.log("input: ", input);

  const apiKey = process.env.OPENAI_API_KEY;

  console.log("Requesting embedding for: ", input);

  const embeddingResponse = await fetch(
    "https://api.openai.com/v1/embeddings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input,
        model: "text-embedding-ada-002"
      })
    }
  );

  const embeddingResponseJSON = await embeddingResponse.json();

  if (embeddingResponseJSON.error) {
    console.error(
      "Error in Embeddings API response: ",
      embeddingResponseJSON.error
    );
    return new Response(
      "Error in Embeddings API response: " +
        embeddingResponseJSON.error?.message,
      { status: 400 }
    );
  }

  const [{ embedding }] = embeddingResponseJSON.data;
  console.log("Embedding constructed for the input.");
  // console.log("embedding: ", embedding);

  const { data: documents, error: supabase_error } = await supabaseClient.rpc(
    "match_documents",
    {
      query_embedding: embedding,
      similarity_threshold: 0.1, // Choose an appropriate threshold for your data
      match_count: 10 // Choose the number of matches
    }
  );

  if (supabase_error) {
    console.error(supabase_error);
    return new Response(
      "Error in retrieving documents:" + supabase_error.message,
      {
        status: 400
      }
    );
  }

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = "";

  console.log("No. of documents retrieved from Supabase: ", documents?.length);

  console.log("Constructing context.....");

  // Concat matched documents
  if (documents) {
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      const content = document.content;
      const url = document.url;
      // console.log(document.url)
      const encoded = tokenizer.encode(content);
      tokenCount += encoded.text.length;

      // Limit context to max 3500 tokens (configurable)
      if (tokenCount > 3500) {
        break;
      }

      contextText += `${content.trim()}\nSOURCE: ${url}\n---\n`;
      console.log("url:" + url);
    }
  }

  // console.log("contextText before trimming: ", contextText); // uncomment this if you want to see the context in the terminal
  console.log("contextText Length: ", contextText.length);
  // remove continuous spaces and replace with single space
  contextText = contextText.replace(/\s+/g, " ");
  console.log("contextTextTrimmed Length: ", contextText.length);
  console.log("Token Count: ", tokenCount);
  // console.log("contextTextTrimmed: ", contextText); // uncomment this if you want to see the context in the terminal

  const userMessage = `
  USER QUESTION: 
  ${query}

  CONTEXT:"""
  ${contextText}
  """  
  `;

  let _userContentTokenCount = tokenizer.encode(userMessage).text.length;
  console.log("userContentTokenCount: ", _userContentTokenCount);
  let _systemContentTokenCount = tokenizer.encode(SystemContent).text.length;
  console.log("systemContentTokenCount: ", _systemContentTokenCount);
  let _assistantContentTokenCount = tokenizer.encode(AssistantContent).text.length;
  console.log("assistantContentTokenCount: ", _assistantContentTokenCount);


  const messages = [
    {
      role: "system",
      content: SystemContent
    },
    {
      role: "user",
      content: UserContent
    },
    {
      role: "assistant",
      content: AssistantContent
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  // console.log("messages: ", messages);
  const OPENAI_MODEL = "gpt-3.5-turbo"; // THIS ONE WORKS, because it is a "Chat Completion" Model
  // const OPENAI_MODEL = "text-davinci-003"; // CANT USE THIS BECUASE DAVINCI IS A "completion" Model

  console.log("OPENAI_MODEL: ", OPENAI_MODEL);

  // https://platform.openai.com/docs/api-reference/chat/create - Refer this for more details on the payload
  const payload: OpenAIStreamPayload = {
    model: OPENAI_MODEL,
    messages: messages,
    temperature: 0.25,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.2,
    max_tokens: 500, // number of tokens retrieved in the answer
    stream: true,
    n: 1
  };

  console.log("Sending context and query as payload to OPEN AI...");

  const openAIInferenceResponse = await OpenAIStream(payload);

  if (!openAIInferenceResponse.ok) {
    let _errorMsg =
      openAIInferenceResponse.status + " " + openAIInferenceResponse.statusText;
    console.error(
      "Error in Open AI Inference API response: " + openAIInferenceResponse.body
    );
    return new Response(openAIInferenceResponse.body, { status: 400 });
  }

  const stream = openAIInferenceResponse.body;

  console.log("Sending streamed response to frontend.");
  return new Response(stream);
};

export default handler;
