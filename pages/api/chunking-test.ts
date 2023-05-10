import { LoadWebpage } from "@/utils/LoadWebpage";
import { ChunkTheHTML } from "@/utils/chunking/chunking";
import { TestHTML } from "@/utils/chunking/test1";
import { NextApiRequest, NextApiResponse } from "next";
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // use path package to get the path to the file
  const html = await LoadWebpage("https://msrit.edu/department/cse_cs.html");
  // const html = TestHTML;
  const chunks = ChunkTheHTML(html);
  return res.json(chunks);
}
