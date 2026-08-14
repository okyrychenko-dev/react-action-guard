import { clsx } from "clsx";
import { ChangeEvent, ReactElement } from "react";
import { CopyIcon, DownloadIcon } from "../../icons";
import { IconButton } from "../shared";
import styles from "./Timeline.module.css";

interface TimelineToolbarProps {
  search: string;
  hasEvents: boolean;
  copyStatus: "idle" | "copied" | "failed";
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCopy: VoidFunction;
  onExport: VoidFunction;
}

function TimelineToolbar(props: TimelineToolbarProps): ReactElement {
  const { search, hasEvents, copyStatus, onSearchChange, onCopy, onExport } = props;

  return (
    <div className={styles.toolbar}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Search by ID or reason..."
        value={search}
        onChange={onSearchChange}
      />
      <span
        role="status"
        aria-live="polite"
        className={clsx(styles.copyStatus, copyStatus === "failed" && styles.copyStatusError)}
      >
        {copyStatus === "copied" && "Copied"}
        {copyStatus === "failed" && "Copy failed"}
      </span>
      <IconButton title="Copy events as JSON" disabled={!hasEvents} onClick={onCopy}>
        <CopyIcon />
      </IconButton>
      <IconButton title="Download events as JSON" disabled={!hasEvents} onClick={onExport}>
        <DownloadIcon />
      </IconButton>
    </div>
  );
}

export default TimelineToolbar;
