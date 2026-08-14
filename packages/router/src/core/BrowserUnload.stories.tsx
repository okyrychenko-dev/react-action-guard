import { ReactElement, useState } from "react";
import { useBeforeUnload } from "../core";
import { InfoBox, StatusDisplay, StoryContainer } from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";

/**
 * Demonstrates browser unload protection (tab close, refresh)
 */

const BrowserUnloadDemo = (): ReactElement => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useBeforeUnload(isUploading, "File upload in progress. Are you sure you want to leave?");

  const startUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <StoryContainer title="Browser Unload Protection">
      <InfoBox className="mb-20">
        <p>
          <strong>🌐 How it works:</strong> This demo uses <code>useBeforeUnload</code> to prevent
          accidental <strong>tab close, browser close, or page refresh</strong> during file upload.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={isUploading}
        blockedMessage="🔒 Upload in progress - browser close blocked"
        readyMessage="✅ Safe to close browser"
      />

      <div className="card mt-20">
        <h3 className="card-title">📤 File Upload</h3>
        {!isUploading && uploadProgress === 0 && (
          <div>
            <p className="text-muted mb-16">
              Click the button below to simulate a file upload. Try closing the browser tab or
              refreshing the page while uploading!
            </p>
            <button onClick={startUpload} className="btn btn-primary">
              📤 Start Upload
            </button>
          </div>
        )}

        {isUploading && (
          <div>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
                  {uploadProgress}%
                </div>
              </div>
            </div>
            <button onClick={cancelUpload} className="btn btn-danger">
              ❌ Cancel Upload
            </button>
          </div>
        )}

        {!isUploading && uploadProgress === 100 && (
          <div>
            <div className="success-message">
              <div className="success-icon">✅</div>
              <p className="success-text">Upload Complete!</p>
            </div>
            <button
              onClick={() => {
                setUploadProgress(0);
              }}
              className="btn btn-primary"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>

      <InfoBox className="mt-20">
        <p>
          <strong>💡 Try this:</strong>
        </p>
        <ol className="list">
          <li>Click &quot;Start Upload&quot;</li>
          <li>Try to close this tab (Ctrl/Cmd + W)</li>
          <li>Or try to refresh the page (Ctrl/Cmd + R)</li>
          <li>Browser will show a warning dialog!</li>
        </ol>
        <p className="mt-20">
          <strong>Note:</strong> This only works in browsers, not in Storybook iframe. Open this
          story in a new tab to test.
        </p>
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof BrowserUnloadDemo> = {
  title: "Examples/Browser Unload Protection",
  component: BrowserUnloadDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Demonstrates **browser unload protection** using `useBeforeUnload`. " +
          "This prevents users from accidentally closing the tab, closing the browser, or refreshing the page " +
          "during critical operations like file uploads. Works independently of router navigation.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BrowserUnloadDemo>;

export const FileUpload: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "📤 **File Upload Protection** - Prevents accidental browser close during upload. " +
          "Open in new tab to test browser close/refresh blocking.",
      },
    },
  },
};
