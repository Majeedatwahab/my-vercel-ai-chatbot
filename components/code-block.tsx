"use client"
interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline = false,
  className,
  children,
  ...props
}: CodeBlockProps) {
  // Ensure inline is consistent
  return !inline ? (
    <div className="not-prose flex flex-col">
      <pre
        {...props}
        className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
      >
        <pre
          className="whitespace-pre-wrap break-words"
          
        >
          {children}
        </pre>
      </pre>
    </div>
  ) : (
    <code
      className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
      {...props}
    >
      {children}
    </code>
  );
}
