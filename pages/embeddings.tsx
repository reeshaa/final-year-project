import { NextPage } from "next";
import { useState, useEffect } from "react";
import axios from "axios";

const Embeddings: NextPage = () => {
  const [urls, setUrls] = useState<string[]>([]);
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
              </tr>
            </thead>
            <tbody>
              {url_stats.map((url_stat, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <td>
                    <a href={url_stat["url"]}>{url_stat["url"]}</a>
                  </td>
                  <td>
                    <center>{url_stat["embeddings_count"]}</center>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Embeddings;
