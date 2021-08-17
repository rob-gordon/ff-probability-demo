import React, { useEffect, useState } from "react";
import { styled } from "tonami";
import Editor, { EditorProps } from "@monaco-editor/react";
import createPersistedState from "use-persisted-state";
import Graph from "./Graph";
import TextResizer from "./TextResizer";
const useEditorValue = createPersistedState("ff-probability-editor-value");
function App() {
  const [value, setValue] = useEditorValue<string>("");
  const debouncedText: string = useDebounce<string>(value, 500);
  return (
    <>
      <AppWrapper className="App">
        <EditorWrapper>
          <Editor
            value={value}
            options={editorOptions}
            onChange={(val) => val && setValue(val)}
          />
        </EditorWrapper>
        <Graph textToParse={debouncedText} />
      </AppWrapper>
      <TextResizer />
    </>
  );
}

export default App;

const AppWrapper = styled.div({
  height: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
});

const EditorWrapper = styled.div({
  overflow: "hidden",
  borderRight: "solid 1px black",
});

const editorOptions: EditorProps["options"] = {
  minimap: { enabled: false },
  fontSize: 16,
  tabSize: 2,
  insertSpaces: true,
  wordBasedSuggestions: false,
  occurrencesHighlight: false,
  renderLineHighlight: false,
  highlightActiveIndentGuide: false,
  scrollBeyondLastLine: false,
  renderIndentGuides: false,
  overviewRulerBorder: false,
  lineDecorationsWidth: "10px",
  renderValidationDecorations: "off",
  hideCursorInOverviewRuler: true,
  matchBrackets: "never",
  selectionHighlight: false,
  lineHeight: 28,
  lineNumbersMinChars: 5,
  cursorWidth: 2,
};

function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
