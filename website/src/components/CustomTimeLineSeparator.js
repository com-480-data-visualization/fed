import React from "react";
import { TimelineSeparator, TimelineDot, TimelineConnector } from "@mui/lab";
import "../style/custom-timeline-separator.css";

const CustomTimelineSeparator = ({ children, index, events }) => {
  return (
    <TimelineSeparator>
      <TimelineDot />
      {index !== events.length - 1 && <TimelineConnector />}
      {children}
    </TimelineSeparator>
  );
};

export default CustomTimelineSeparator;
