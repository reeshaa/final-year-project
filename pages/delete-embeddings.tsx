import { NextPage } from "next";
import { useState, useEffect } from "react";
import axios from "axios";

const Embeddings: NextPage = () => {
  const [url, setUrl] = useState<string>('');
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
    console.log("here")
    setLoading(true);
    const response = await fetch("/api/delete-embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query_url: url.trim() })
    });
    console.log(response);
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
        Delete embeddings
      </h1>
      <p className="mb-4">
        Bros gimme the url to delete
      </p>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full textarea textarea-bordered"
          placeholder="Enter URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="my-4 btn btn-primary"
          type="submit"
          disabled={loading}
        >
          Delete Embeddings
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
                    <p>{url_stat["url"]}</p>
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
