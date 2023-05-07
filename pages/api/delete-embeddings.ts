import { supabaseClient } from "@/lib/embeddings-supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

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
){
  const {method,body} = req;
  if(method === "POST"){
    const { query_url } = body;
    let { data: count, error: supabase_error } = await supabaseClient
    .rpc('delete_url', {
      query_url
    })
    if (supabase_error) {
      console.error("Error in deleting the URL: "+query_url+"\n", supabase_error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    else{
      console.error("Deleted "+query_url);
    }
      return res
      .status(200)
      .json({ success: true, data: count});
  }
}
