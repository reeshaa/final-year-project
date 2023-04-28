import { supabaseClient } from "@/lib/embeddings-supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openAi = new OpenAIApi(configuration);

/**
 * Runs an SQL query to fetch the URL statistics from the database
 *
 * Response (200) format:
 * ```typescript
 * {
 *  success: boolean,
 * data: {
 * url: string,
 * embeddings_count: number,
 * last_updated: string
 * }[]
 * }
 * ```
 * @param req
 * @param res
 * @returns
 */
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === "GET") {
    const { data: url_table, error: supabase_error } = await supabaseClient.rpc(
      "url_statistics"
    );

    if (supabase_error) {
      console.error("Error in fetching URL statistics: ", supabase_error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    return res.status(200).json({ success: true, data: url_table });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
}
