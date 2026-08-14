import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from "react";
import { selectFilteredEvents, useDevtoolsStore } from "../../store";
import { copyEventsToClipboard, downloadEventsAsJson } from "../../utils";
import { EventDetails } from "../eventDetails";
import { isFilterActive } from "./Timeline.utils";
import TimelineContent from "./TimelineContent";
import TimelineEmptyState from "./TimelineEmptyState";
import TimelineToolbar from "./TimelineToolbar";

function Timeline(): ReactElement {
  const { events, selectedEventId, selectEvent, filter, setFilter } = useDevtoolsStore((state) => ({
    events: selectFilteredEvents(state),
    selectedEventId: state.selectedEventId,
    selectEvent: state.selectEvent,
    filter: state.filter,
    setFilter: state.setFilter,
  }));

  const selectedEvent = selectedEventId ? events.find((e) => e.id === selectedEventId) : null;

  // Clear selection if selected event was removed or filtered out.
  useEffect(() => {
    if (selectedEventId && !events.some((event) => event.id === selectedEventId)) {
      selectEvent(null);
    }
  }, [selectedEventId, events, selectEvent]);

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: e.target.value });
    },
    [setFilter]
  );

  const handleCloseDetails = useCallback(() => {
    selectEvent(null);
  }, [selectEvent]);

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const handleCopy = useCallback(() => {
    void copyEventsToClipboard(events).then((ok) => {
      setCopyStatus(ok ? "copied" : "failed");
    });
  }, [events]);

  // Auto-clear the transient copy status.
  useEffect(() => {
    if (copyStatus === "idle") {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCopyStatus("idle");
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [copyStatus]);

  const handleExport = useCallback(() => {
    downloadEventsAsJson(events);
  }, [events]);

  if (events.length === 0 && !isFilterActive(filter)) {
    return <TimelineEmptyState />;
  }

  return (
    <>
      <TimelineToolbar
        search={filter.search}
        hasEvents={events.length > 0}
        copyStatus={copyStatus}
        onSearchChange={handleSearchChange}
        onCopy={handleCopy}
        onExport={handleExport}
      />
      <TimelineContent
        events={events}
        selectedEventId={selectedEventId}
        onSelectEvent={selectEvent}
      />
      {selectedEvent && <EventDetails event={selectedEvent} onClose={handleCloseDetails} />}
    </>
  );
}

export default Timeline;
