import { supabaseClient } from "@/lib/embeddings-supabase";
import * as cheerio from "cheerio";
import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import puppeteer from 'puppeteer';


// Size of the chunks of text to be embedded
const docSize: number = 1000;

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openAi = new OpenAIApi(configuration);

/**
 *  Handles the POST request to generate embeddings for a given URL
 *  and stores them in the database
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req;

  if (method === "POST") {
    const { urls } = body;
    const documents = await getDocuments(urls);
    console.log("\nNumber of Documents chunked: \n", documents.length);
    
    let overallPromptTokens = 0;
    let overallTokens = 0;
    let documentLoopVar = 0;
    const documentsCount = documents.length;

    for (const { url, body } of documents) {
      const input = body.replace(/\n/g, " ");
      input.replace(/\t+/g, " ");
      

      const embeddingResponse = await openAi.createEmbedding({
        model: "text-embedding-ada-002",
        input
      });
      
      // Abort when creating an embedding fails
      // Later we should handle this more gracefully
      if(embeddingResponse.status != 200){
        console.log(`\nEmbedding failed for [Doc ${documentLoopVar+1}]:`);
        return res.status(400).json({ success: false, message: embeddingResponse });
      }

      console.log(`\nEmbedding Response [Doc ${documentLoopVar+1} / ${documentsCount}]:`);
      console.log(`Prompt Token usage: ${embeddingResponse.data.usage.prompt_tokens}`);
      // console.log(embeddingResponse.data);
      overallPromptTokens += embeddingResponse.data.usage.prompt_tokens;
      overallTokens += embeddingResponse.data.usage.total_tokens;
      
      
      const [{ embedding }] = embeddingResponse.data.data;

      // In production we should handle possible errors
      await supabaseClient.from("documents").insert({
        content: input,
        embedding,
        url
      });
      
      documentLoopVar++;
    }

    console.log(`Overall Prompt Token usage: ${overallPromptTokens}`);
    console.log(`Overall Token usage: ${overallTokens}`);


    return res.status(200).json({ success: true });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
}

/**
 *  Loads the webpage and splits the text into chunks of a given size
 *  and returns an array of documents
 * 
 * @param urls - Array of URLs to load
 * @returns documents - Array of documents
 */
async function getDocuments(urls: string[]) {
  const documents = [];
  for (const url of urls) {
    const html = await loadWebpage(url);
    const $ = cheerio.load(html);

    let articleText: string = $("body").text();

    // Clean up the text
    articleText = articleText.replace(/\n+/g, " ");
    articleText = articleText.replace(/\t+/g, " ");
    articleText = articleText.replace(/\s+/g, " ");
    

    let start = 0;
    while (start < articleText.length) {
      const end = start + docSize;
      const chunk = articleText.slice(start, end);
      documents.push({ url, body: chunk });
      start = end;
    }
  }
  return documents;
}

/**
 * Opens the webpage in a headless browser and returns the HTML content
 * Note: An advantage of using a headless browser is that we can load
 *      the webpage as it would be rendered in a browser. This means
 *     that we can use the same selectors as we would in a browser.
 *     This is not possible when using the fetch API.
 * 
 * @param url - URL of the webpage to load
 * @returns html - HTML content of the webpage
 */
async function loadWebpage(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();
  await browser.close();
  return html;
}