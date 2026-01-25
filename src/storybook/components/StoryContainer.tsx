import { ReactElement, ReactNode } from "react";

interface StoryContainerProps {
  title: string;
  children: ReactNode;
}

function StoryContainer(props: StoryContainerProps): ReactElement {
  const { title, children } = props;

  return (
    <div className="root">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default StoryContainer;
