import { supabaseClient } from "@/lib/embeddings-supabase";
import { IChunkItem } from "@/utils/chunking/ChunkItem";
import { ChunkTheHTML } from "@/utils/chunking/chunking";
import * as cheerio from "cheerio";
import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import puppeteer from "puppeteer";

const docSize: number = 1000;

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openAi = new OpenAIApi(configuration);

/**

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
    const documents : IChunkItem[] = await getDocuments(urls);
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

      if (embeddingResponse.status != 200) {
        console.log(`\nEmbedding failed for [Doc ${documentLoopVar + 1}]:`);
        return res
          .status(400)
          .json({ success: false, message: embeddingResponse });
      }

      console.log(
        `\nEmbedding Response [Doc ${documentLoopVar + 1} / ${documentsCount}]:`
      );
      console.log(
        `Prompt Token usage: ${embeddingResponse.data.usage.prompt_tokens}`
      );
      // console.log(embeddingResponse.data);
      overallPromptTokens += embeddingResponse.data.usage.prompt_tokens;
      overallTokens += embeddingResponse.data.usage.total_tokens;

      const [{ embedding }] = embeddingResponse.data.data;

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
 
 * 
 * @param urls - Array of URLs to load
 * @returns documents - Array of documents
 */
async function getDocuments(urls: string[]) : Promise<IChunkItem[]>{
  const chunkItems: IChunkItem[] = [];
  for (const url of urls) {
    const html = await loadWebpage(url);

    const _chunks = ChunkTheHTML(html);

    _chunks.forEach((chunk) => {
      const cleanUrl=url.trim();
      chunkItems.push({ url:cleanUrl, body: chunk });
    });
  }
  return chunkItems;
}

/**

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
