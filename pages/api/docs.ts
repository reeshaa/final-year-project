import { supabaseClient } from "@/lib/embeddings-supabase";
import { OpenAIStream, OpenAIStreamPayload } from "@/utils/OpenAIStream";
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

  const embeddingData = await embeddingResponse.json();
  const [{ embedding }] = embeddingData.data;
  // console.log("embedding: ", embedding);

  const { data: documents, error } = await supabaseClient.rpc(
    "match_documents",
    {
      query_embedding: embedding,
      similarity_threshold: 0.1, // Choose an appropriate threshold for your data
      match_count: 10 // Choose the number of matches
    }
  );

  if (error) console.error(error);

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = "";

  console.log("No. of documents retrieved: ", documents?.length);

  // Concat matched documents
  if (documents) {
    for (let i =0 ; i < documents.length; i++) {
      const document = documents[i];
      const content = document.content;
      const url = document.url;
      console.log(document.url)
      const encoded = tokenizer.encode(content);
      tokenCount += encoded.text.length;

      // Limit context to max 1500 tokens (configurable)
      if (tokenCount > 1500) {
        break;
      }

      contextText += `${content.trim()}\nSOURCE: ${url}\n---\n`;
      console.log("url:");
      console.log(url);
    }
  }

  console.log("contextText: ", contextText);

  const systemContent = `You are a helpful question answering bot. You are given the CONTEXT of Ramaiah Institute of Technology and information about this instituiton from its website.
  When given CONTEXT you answer questions using only that information. You may correlate multiple contexts to derive a more helpful or relevant answer.
  If you are unsure and the answer is not explicitly present in the CONTEXT provided, you say
  "Sorry, I could not find an answer to that"  
  If the CONTEXT includes source URLs include them under a SOURCES heading at the end of your response. Always include all of the relevant source urls 
  from the CONTEXT, but never list a URL more than once (ignore trailing forward slashes when comparing for uniqueness). Never include URLs that are not in the CONTEXT sections.
  Never make up URLs.`;

  const userContent = `QUESTION: What is MSRIT?

    CONTEXT: """
    Ramaiah Institute of Technology (RIT), formerly known as M.S. Ramaiah Institute of Technology (MSRIT), is an autonomous private engineering college located in Bangalore in the Indian state of Karnataka.
    Established in 1962, the college is affiliated to Visvesvaraya Technological University.

    RIT has 25 departments, namely Architecture, Biotechnology, Chemical Engineering, Chemistry, Civil Engineering, Computer Science and Engineering, Artificial intelligence and machine learning,
    Artificial intelligence and data science, Electronics and Communication Engineering,
    Electronics and Instrumentation Engineering, Electrical and Electronics Engineering, Electronics and Telecommunication Engineering,
    Humanities, Industrial Engineering and Management, Information Science and Engineering, Mathematics, Master of Computer Applications,
    Management Studies (MBA), Mechanical Engineering, Medical Electronics, Physics.
    """
  `;

  const assistantContent = `
  MSRIT stands for M.S. Ramaiah Institute of Technology, which is an engineering college located in Bangalore, India. It was established in 1962 by the late philanthropist and industrialist, Dr. M.S. Ramaiah.
  MSRIT is affiliated with the Visvesvaraya Technological University and offers undergraduate, postgraduate, and research programs in various fields of engineering, including computer science,
  electronics and communication, mechanical, civil, chemical, and electrical engineering.
  The institute is known for its strong academic curriculum, state-of-the-art facilities, and excellent placement opportunities for its students.
  
  SOURCES:
  https://msrit.edu/about-us.html
  `;

  const userMessage = `
  USER QUESTION: 
  ${query}

  CONTEXT:"""
  ${contextText}
  """  
  `;

  const messages = [
    {
      role: "system",
      content: systemContent
    },
    {
      role: "user",
      content: userContent
    },
    {
      role: "assistant",
      content: assistantContent
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  // console.log("messages: ", messages);

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo-0301",
    // model :"text-davinci-003",
    messages: messages,
    temperature: 0.25,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.2,
    max_tokens: 2000,
    stream: true,
    n: 1
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
