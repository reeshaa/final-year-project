import SwitchTheme from "@/components/SwitchTheme";
import { NextPage } from "next";
import Link from "next/link";

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col justify-center min-h-screen antialiased text-center">
        <div className="flex justify-end w-full p-2">
          <SwitchTheme/>
      </div>
      <div className="flex flex-col items-center px-6 m-auto mx-auto max-w-7xl">
        <h1 className="max-w-xxl text-4xl font-extrabold">
          ChatBot to Answer your Questions Regarding MSRIT
        </h1>
        <div className="my-9">
          <Link href="/embeddings">
            <button className="btn btn-wide btn-outline mr-5">Generate New Embeddings</button>
          </Link>
          <Link href="/docs">
            <button className="btn btn-wide btn-primary">Ask Me a Question</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
