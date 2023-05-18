# Conversational Search Engine using Large Language Model connected to External Knowledge Bases

Large Language Models (LLMs) have shown their
prowess in presenting information in a conversational and human
understandable manner, as shown by ChatGPT and Bard.
Having been trained on a sufficiently large (web) corpus, these
LLMs encode a significant amount of knowledge implicitly in
its parameters. They have broad applicability for a range of
NLP tasks like text generation, translation, sentiment analysis,
Conversational AI, chatbots etc.

However, augmenting an LLM with data from specific domains, such as medicine, finance or niche sources like stand-alone
institutions, out-of-the-box is hindered by the token limitations
and lack of domain-specific knowledge in its training process.

This project aims to overcome these pitfalls by incorporating
data ingestion and data embedding. Data ingestion from various
sources and data embedding by creating embeddings of the
domain specific corpus as well as of the query represented by the
user lead us to an LLM that can query and retrieve information
based on the user’s prompt with much higher accuracy.

## Installation

### Tech Stack

- Next.js
- Supabase Postgres DB
- OpenAI
- Node.js
- Visual Studio Code
- Jupyter Notebook

### Setup

1. Clone the repository
2. Open the repository in Visual Studio Code
3. Open a terminal in Visual Studio Code
4. Run `npm install` to install all dependencies
5. Run `npm run dev` to start the application
6. Open `http://localhost:3000` in your browser
7. Enjoy!

### Environment Variables

- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OPENAI_API_KEY`


