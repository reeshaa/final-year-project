import ColumnCards from "@/components/ColumnsCards";
import SwitchTheme from "@/components/SwitchTheme";
import { capabilitiesList, examplesList, limitationsList } from "@/utils/points";
import { NextPage } from "next";
import Link from "next/link";

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen antialiased text-center">
      <div className="flex justify-end w-full p-2">
        <SwitchTheme/>
      </div>
     
      <div className="flex flex-col items-center px-6 mx-auto max-w-5xl ">

        <div className="flex flex-col w-full lg:flex-row py-10">
          <ColumnCards title="Capabilities" contentList={capabilitiesList}/>
          <div className="divider lg:divider-horizontal"/> 
          <ColumnCards title="Examples" contentList={examplesList}/>
          <div className="divider lg:divider-horizontal"/> 
          <ColumnCards title="Limitations" contentList={limitationsList}/>
        </div> 

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
