import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import LoadingDots from "@/components/LoadingDots";
import ResizablePanel from "@/components/ResizablePanel";
import MetaTags from "@/components/MetaTags";
import { ReactNode } from "react";
import { PageMeta } from "../types";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Props {
  children: ReactNode;
  meta?: PageMeta;
}

const DocsPage: NextPage<Props> = ({ children, meta: pageMeta }: Props) => {
  const [loading, setLoading] = useState(false);
  const [userQ, setUserQ] = useState("");
  const [answer, setAanswer] = useState<String>("");
  const [emails, setEmails] = useState<String[]>([]);
  const [phones, setPhones] = useState<String[]>([]);

  // console.log("Streamed response: ", answer);

  const question = userQ;

  const generateAnswer = async (e: any) => {
    e.preventDefault();
    if (!userQ) {
      return toast.error("Please enter a question!");
    }

    setAanswer("");
    setEmails([]);
    setPhones([]);
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

    let _emails = extractEmailIDs(answer);
    setEmails(_emails);
    let _phones = extractPhoneNumbers(answer);
    setPhones(_phones);
    setLoading(false);
  };

  /**
   * TODO: We need to prettify the URLs returned as a part of SOURCES
   * @reesha please do this
   *
   *  For this, you can use the API endpoint: /api/link-metadata
   *
   * API Docs:
   * Request Type: POST
   * Request Body: {
   *    urls: string[]
   * }
   *
   * Response: {
   *  url: string,
   * title: string,
   * description: string,
   * siteName: string,
   * favicons: string[],
   * contentType: string,
   * mediaType: string,
   * images: string[],
   * videos: string[],
   * }
   *
   */
  const retrieveSourceURLsMetadata = async (_urls: string[]) => {};

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
        className={`p-4 transition bg-neutral border border-neutral-focus shadow-md rounded-xl overflow-x-auto max-w-xl ${"hover:border-accent-focus  text-left"}`}
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
        className={`p-4 transition bg-neutral border border-neutral-focus shadow-md rounded-xl overflow-x-auto max-w-xl ${"hover:border-accent-focus  text-left"}`}
      >
        <p>SOURCES:</p>
        <ul>
          {splitanswer
            .trim()
            .split("\n")
            .filter((url) => url.trim().length > 0)
            .map((url) =>
              url.includes("http") ? (
                <li key={uuidv4()}>
                  <a
                    className="underline text-accent"
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

  const EmailUI = () => (
    <div className="flex flex-wrap items-center justify-start p-2 ">
      {/* Email icon filled */}

      {emails.map((email) => {
        return (
          <div className="flex flex-row space-x-2 p-2 mr-2 mb-2 items-center justify-center bg-neutral border border-none shadow-md rounded-xl ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-envelope-fill"
              viewBox="0 0 16 16"
            >
              <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z" />
            </svg>

            <a
              href={`mailto:${email}`}
              className="text-md italic underline "
              // key={email}
            >
              {email}
            </a>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <MetaTags
        title="RIT Answerbot"
        description="Web Developer answer-bot trained on Supabase, Nextjs, React, TailwindCSS."
        cardImage="/bot/docs-og.png"
        url=""
      />
      <div className="flex flex-col items-center justify-center  py-2 mx-auto">
      <div className="flex justify-end w-full p-2">
          <SwitchTheme/>
      </div>
        <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-2 mx-auto mt-12 text-center sm:mt-20">
          <h1 className="max-w-xl text-2xl font-bold sm:text-4xl">
            Ask me anything<sup>*</sup> about MSRIT!
          </h1>
          <div className="w-full max-w-xl">
            <textarea
              value={userQ}
              onChange={(e) => setUserQ(e.target.value)}
              rows={4}
              className="w-full p-2 my-5 border rounded-md shadow-md bg-neutral border-neutral-focus "
              placeholder={
                "e.g. Which department to join? I am interested in so and so things..."
              }
            />

            {!loading && (
              <button
                className="w-full px-4 py-2 mt-2 font-mediu btn btn-primary"
                onClick={(e) => generateAnswer(e)}
              >
                Ask your question &rarr;
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
