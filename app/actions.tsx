"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { nanoid } from "nanoid";
import { openai } from "@ai-sdk/openai";
import Markdown from "react-markdown";
import { z } from "zod";
import { DataAPIClient } from "@datastax/astra-db-ts";

export const AI = createAI({
  actions: {
    continueConversation: async (input: string) => {
      const history = getMutableAIState();

      const result = await streamUI({
        model: openai("gpt-3.5-turbo"),
        messages: [...history.get(), { role: "user", content: input }],
        text: ({ done, content }) => {
          if (done) {
            history.done([...history.get(), { role: "assistant", content }]);
          }

          return (
            <Markdown
              components={{
                p: ({ children }) => <p className="py-2">{children}</p>,
              }}
            >
              {content}
            </Markdown>
          );
        },
        tools: {
          getMovies: {
            description: "Get movies by a prompt",
            parameters: z.object({
              prompt: z.string().describe("The prompt to get movies by"),
            }),
            generate: async function* ({ prompt }) {
              yield "Starting...";
              const client = new DataAPIClient(process.env.DS_API_KEY!);
              const db = client.db(process.env.DS_API_ENDPOINT!);
              yield "Searching Astra Vector store...";

              const data = await db
                .collection("imdb_openai")
                .find({}, { vectorize: prompt, limit: 8 })
                .toArray();

              return (
                <ul className="flex items-center gap-2">
                  {data.map((movie: any) => (
                    <li
                      className="transition-all hover:-translate-y-2"
                      key={movie._id}
                    >
                      <a
                        target="_blank"
                        href={`https://imdb.com/find/?q=${movie.Series_Title}}`}
                      >
                        <img
                          src={movie.Poster_Link}
                          alt={movie.Series_Title}
                          className="rounded shadow"
                          width="100"
                          height="150"
                        />
                      </a>
                      <h2>{movie.Series_Title}</h2>
                    </li>
                  ))}
                </ul>
              );
            },
          },
        },
      });

      return {
        id: nanoid(),
        role: "assistant",
        display: result.value,
      };
    },
  },
  initialAIState: [],
  initialUIState: [],
});
