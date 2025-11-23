import { JSX, ReactNode } from "react";

interface StoryContainerProps {
  title: string;
  children: ReactNode;
}

export const StoryContainer = ({ title, children }: StoryContainerProps): JSX.Element => {
  return (
    <div className="root">
      <h2>{title}</h2>
      {children}
    </div>
  );
};
