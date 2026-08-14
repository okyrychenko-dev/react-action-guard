import { ReactElement } from "react";

interface CodeBlockProps {
  code: string;
  title?: string;
}

function CodeBlock(props: CodeBlockProps): ReactElement {
  const { code, title } = props;

  return (
    <div>
      {title && (
        <p className="mt-20">
          <strong>{title}</strong>
        </p>
      )}
      <pre className="code-block">{code}</pre>
    </div>
  );
}

export default CodeBlock;
