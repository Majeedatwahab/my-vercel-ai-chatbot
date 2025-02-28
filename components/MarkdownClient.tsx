"use client"; // Forces client-side rendering

import ReactMarkdown from "react-markdown";

export const MarkdownClient = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ node, children }) => <p className="mb-4">{children}</p>,
        pre: ({ children }) => (
          <pre className="whitespace-pre-wrap break-words">{children}</pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
