import { getLinkPreview } from "link-preview-js";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req;

  if (method === "POST") {
    if (!body.urls) {
      return res
        .status(400)
        .json({ success: false, message: "Missing urls in the body" });
    }
    const urls = body.urls as string[];

    const metadata = await Promise.all(
      urls.map(async (url) => {
        const preview = await getLinkPreview(url, {
          imagesPropertyType: "og", // fetches only open-graph images
          timeout: 1000
        });
        return preview;
      })
    );


    // TODO: For URLs containing 'faculty' or 'faculty-details' , we need to use our own HTML parser to get the metadata
    // This is because all the faculty pages load dynamic data from the server and the metadata is not available in the HTML


    return res.status(200).json({ success: true, data: metadata });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
}
