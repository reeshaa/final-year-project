import LoadingDots from "@/components/LoadingDots";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import MetaTags from "@/components/MetaTags";
import ResizablePanel from "@/components/ResizablePanel";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { ReactNode, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { Navbar } from "../components/Navbar";
import { PageMeta } from "../types";

interface Props {
  children: ReactNode;
  meta?: PageMeta;
}

const DocsPage: NextPage<Props> = ({ children, meta: pageMeta }: Props) => {
  const [loading, setLoading] = useState(false);
  const [userQ, setUserQ] = useState("");
  const [answer, setAanswer] = useState<String>("");

  // console.log("Streamed response: ", answer);

  const question = userQ;

  const generateAnswer = async (e: any) => {
    e.preventDefault();
    if (!userQ) {
      return toast.error("Please enter a question!");
    }

    setAanswer("");

    setLoading(true);
    const response = await fetch("/api/docs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question
      })
    });
    console.log("Edge function returned.");

    if (!response.ok) {
      console.log("Response received by frontend: ", response);
      setLoading(false);
      if (response.status === 500) {
        console.log("Response Status Text: ", response.statusText);
        toast.error(response.statusText);
      }
      toast.error("Something went wrong!");
      console.log("Response body: ", response.body);
      // Instead of throwing an error and crashing the app, we will show the error message as the
      // streamed response
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAanswer((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  const extractEmailIDs = (text: String) => {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const emails = text.match(emailRegex);
    return emails?.map((email) => email.toString()) ?? [];
  };

  const extractPhoneNumbers = (text: String) => {
    const phoneRegex = /(\+?\d{2})?(\d{10})/g;
    const phones = text.match(phoneRegex);
    return phones?.map((phone) => phone.toString()) ?? [];
  };

  const AnswerUI = () => {
    const splitanswer = answer.split("SOURCES:")[0];
    return (
      <div
        className={`p-4 transition textarea textarea-bordered  shadow-md rounded-xl overflow-x-auto max-w-xl ${"hover:border-accent-focus  text-left"}`}
      >
        <MarkdownRenderer content={splitanswer.trim()} />
      </div>
    );
  };

  const SourcesUI = () => {
    const splitanswer = answer.split("SOURCES:")[1];
    if (!splitanswer || splitanswer?.length === 0) {
      return null;
    }
    return (
      <div
        className={`p-4 transition textarea textarea-bordered  shadow-md rounded-xl overflow-x-auto max-w-xl ${"hover:border-accent-focus text-left"}`}
      >
        <p>
          <b>SOURCES:</b>
        </p>
        <ul>
          {splitanswer
            .trim()
            .split("\n")
            .filter((url) => url.trim().length > 0)
            .map((url) =>
              url.includes("http") ? (
                <li key={uuidv4()}>
                  <a
                    className="underline text-primary font-medium text-left"
                    target="_blank"
                    href={url.replace(/^-+/g, "")} // Remove leading hyphens
                  >
                    {url.replace(/^-+/g, "")}
                  </a>
                </li>
              ) : (
                <li key={uuidv4()}>{url}</li>
              )
            )}
        </ul>
      </div>
    );
  };

  const ContactDetailsUI = () => {
    let emails = extractEmailIDs(answer);

    let phones = extractPhoneNumbers(answer);

    if (!emails || emails.length === 0) {
      return null;
    }

    return (
      <div
        className={`p-4 transition textarea textarea-bordered shadow-md rounded-xl overflow-x-auto max-w-xl ${"hover:border-accent-focus text-left"}`}
      >
        <div className="flex flex-wrap ">
          {emails.map((email) => {
            return (
              <div className="flex flex-row space-x-2 mr-4 items-center justify-start ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#0EA5E9"
                  className="bi bi-envelope-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z" />
                </svg>

                <a
                  href={`mailto:${email}`}
                  className="text-primary font-medium text-left italic underline "
                  // key={email}
                >
                  {email}
                </a>
              </div>
            );
          })}
          {phones.map((phone) => {
            return (
              <div className="flex flex-row space-x-2 mr-4 items-center justify-start ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#0EA5E9"
                  className="bi bi-telephone-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"
                  />
                </svg>

                <a
                  href={`tel:${phone}`}
                  className="text-primary font-medium text-left italic underline "
                  // key={email}
                >
                  {phone}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <MetaTags
        title="RIT Answerbot"
        description="Web Developer answer-bot trained on Supabase, Nextjs, React, TailwindCSS."
        cardImage="/bot/docs-og.png"
        url=""
      />
      <div className="flex flex-col items-center justify-center  py-2 mx-auto">
        <Navbar />
        <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-2 mx-auto mt-12 text-center sm:mt-20">
          <h1 className="max-w-xl text-2xl font-bold sm:text-4xl">
            Ask me a question about MSRIT!
          </h1>
          <div className="w-full max-w-xl">
            <textarea
              value={userQ}
              onChange={(e) => setUserQ(e.target.value)}
              rows={4}
              className="w-full p-2 my-5 border rounded-md shadow-md textarea textarea-bordered"
              placeholder={
                "e.g. Which department to join? I am interested in so and so things..."
              }
            />

            {!loading && (
              <button
                className="w-full px-4 py-2 mt-2 font-medium btn btn-primary text-white"
                onClick={(e) => generateAnswer(e)}
              >
                Ask me a question &rarr;
              </button>
            )}
            {loading && (
              <button
                className="w-full px-4 py-2 mt-2 font-mediu btn btn-primary"
                disabled
              >
                <LoadingDots color="white" style="xl" />
              </button>
            )}
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{ duration: 2000 }}
            />

            <ResizablePanel>
              <AnimatePresence mode="wait">
                <motion.div className="my-10 space-y-10">
                  {answer && (
                    <>
                      <div>
                        <h2 className="mx-auto text-3xl font-bold sm:text-4xl">
                          Here is your answer:{" "}
                        </h2>
                      </div>

                      <AnswerUI />
                      <ContactDetailsUI />
                      <SourcesUI />

                      <style>
                        {`
                              p {
                                margin-bottom: 20px;
                              }
                            `}
                      </style>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </ResizablePanel>

            {/* <div className="max-w-xl text-xs">
            <p><sup>*</sup>Actually, I'm currently only trained on the following documentation:</p>
            <ul>
              <li><a target="_blank" href="">https://beta.reactjs.org/</a></li>
              <li><a target="_blank" href="">https://supabase.com/docs</a></li>
              <li><a target="_blank" href="">https://tailwindcss.com/docs</a></li>
              <li><a target="_blank" href="">https://nextjs.org/docs</a></li>
              <li><a target="_blank" href="">https://beta.nextjs.org/docs</a></li>
            </ul>
                    </div>*/}
          </div>
        </main>
      </div>
    </>
  );
};

export default DocsPage;
