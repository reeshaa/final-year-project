import { NextPage } from "next";
import { useState, useEffect } from "react";
import axios from "axios";

const Embeddings: NextPage = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [deleteUrl, setDeleteUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [url_stats, setUrlStats] = useState([]);

  useEffect(() => {
    getDBStatistics();
  }, []);

  const getDBStatistics = () => {
    axios
      .get("/api/database-statistics")
      .then(function (response) {
        let body = response.data;
        let _data = body.data;
        sortURLStats(_data);
        if (body.success) setUrlStats(_data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const sortURLStats = (url_stats: {
    sort(
      arg0: (
        a: { url: string; embeddings_count: any },
        b: { url: string; embeddings_count: any }
      ) => any
    ): unknown;
    url: string;
    embeddings_count: any;
  }) => {
    url_stats.sort((a, b) => {
      return b["url"].localeCompare(a["url"]);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/generate-embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls })
    });

    setLoading(false);

    if (!response.ok) {
      // Handle error
      console.log("Generate embeddings did not finish completely.");
    }
    getDBStatistics();
  };

  const handleDelete = async () => {
    setUrlStats(url_stats.filter(stats => stats['url']!==deleteUrl))

    const response = await fetch("/api/delete-embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query_url: deleteUrl })
    });
    console.log(response);

    if (!response.ok) {
      // Handle error
      console.log("Generate embeddings did not finish completely.");
    }
  };

  return (
    <div className="flex flex-col items-center max-w-xxl m-auto text-center">
      <h1 className="w-full my-5 text-2xl font-bold sm:text-4xl ">
        Generate embeddings
      </h1>
      <p className="mb-4">
        Paste a list of URLs below to geneate embeddings using the OpenAI API,
        and add the embeddings to the Supabase embeddings table.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-[150px] textarea textarea-bordered"
          placeholder="Enter URLs here"
          value={urls.join("\n")}
          onChange={(e) => setUrls(e.target.value.split("\n"))}
        />
        <button
          className="my-4 btn btn-primary"
          type="submit"
          disabled={loading}
        >
          Generate Embeddings
        </button>
      </form>
      {loading && <div>Loading...</div>}
      {url_stats.length > 0 && (
        <h2 className="w-full my-8 text-xl font-bold sm:text-2xl ">
          Supabase Embeddings Table{" "}
          {url_stats.length > 0 && `(${url_stats.length} URLs)`}
        </h2>
      )}
      {url_stats.length > 0 && (
        <div className="overflow-x-auto w-5/6">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th></th>
                <th>URL</th>
                <th>Chunks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {url_stats.map((url_stat, index) => (
                <tr key={index} className="hover">
                  <th>{index + 1}</th>
                  <td>
                    <a href={url_stat["url"]} target="_blank">{url_stat["url"]}</a>
                  </td>
                  <td>
                    <center>{url_stat["embeddings_count"]}</center>
                  </td>
                  <td>
                    <button
                      className=""
                      type="submit"
                      // disabled={loading}
                      onClick={()=>(setDeleteUrl(url_stat["url"]))}
                    >
                      <label htmlFor="my-modal-4" >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                      </svg>
                     </label>
                      {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> */}
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <input type="checkbox" id="my-modal-4" className="modal-toggle" />
      <label htmlFor="my-modal-4" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="text-lg font-bold">Delete Embeddings</h3>
          <p className="py-4">Are you sure you want to delete the embeddings for <a href={deleteUrl} target="_blank">{deleteUrl}</a> ?</p>
            <label htmlFor="my-modal-4" className="btn btn-outline mr-5">Cancel</label>
            <label htmlFor="my-modal-4" className="btn btn-primary" onClick={()=>{handleDelete()}}>
          Delete
          
          {/* </button> */}
          </label>
        </label>
      </label>
    </div>
  );
};

export default Embeddings;
