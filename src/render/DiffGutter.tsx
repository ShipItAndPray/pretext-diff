import React from "react";
import { formatLineNumber, gutterWidth } from "../layout/gutterLayout";

interface DiffGutterProps {
  lineNumber: number | null;
  maxLineNumber: number;
}

/**
 * Line number gutter for a single diff line.
 */
export const DiffGutter: React.FC<DiffGutterProps> = ({
  lineNumber,
  maxLineNumber,
}) => {
  const width = gutterWidth(maxLineNumber);
  const text = formatLineNumber(lineNumber, width);

  return (
    <span className="ptd-gutter" aria-hidden="true">
      {text}
    </span>
  );
};
