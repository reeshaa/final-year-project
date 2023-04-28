import { NextPage } from "next";
import Link from "next/link";

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col justify-center min-h-screen antialiased text-center text-slate-50">
      <div className="flex flex-col items-center px-6 m-auto mx-auto max-w-7xl">
        <h1 className="max-w-xxl text-4xl font-extrabold">
          Domain-specific ChatBot - Final Year Project
        </h1>
        <div className="my-9">
          <Link href="/embeddings">
            <button className="btn btn-wide btn-outline mr-5">Create Embeddings</button>
          </Link>
          <Link href="/docs">
            <button className="btn btn-wide btn-primary">Search</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
