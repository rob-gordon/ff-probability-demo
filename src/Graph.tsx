import cytoscape, { Core } from "cytoscape";
import dagre from "cytoscape-dagre";
import { useEffect, useRef } from "react";
import { parseText } from "./parse";

const nodeHtmlLabel = require("cytoscape-node-html-label");

if (!cytoscape.prototype.hasInitialised) {
  cytoscape.use(dagre);
  cytoscape.prototype.hasInitialised = true;
  nodeHtmlLabel(cytoscape);
}

export default function Graph({ textToParse }: { textToParse: string }) {
  const errorCatcher = useRef<undefined | Core>();
  const cy = useRef<undefined | Core>();
  const graphInitialized = useRef(false);
  useEffect(() => initializeGraph(errorCatcher, cy), []);
  useEffect(() => {
    updateGraph(cy, textToParse, errorCatcher, graphInitialized);
  }, [textToParse]);
  return <div id="cy" style={{ height: "100%", width: "100%" }} />;
}

function updateGraph(
  cy: React.MutableRefObject<cytoscape.Core | undefined>,
  textToParse: string,
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>,
  graphInitialized: React.MutableRefObject<boolean>
) {
  if (cy.current) {
    try {
      const startingLineNumber = 0;

      // Prepare Styles
      // const style = getCyStyleFromTheme(JSON.parse(themeString), userStyle);

      // Parse
      const elements = parseText(textToParse, startingLineNumber);

      // Test Error First
      errorCatcher.current?.json({ elements /*, style*/ });
      errorCatcher.current?.layout(defaultLayout);

      // Real
      cy.current
        .json({
          elements: elements,
        })
        .layout(defaultLayout)
        .run();
      cy.current.center();
      graphInitialized.current = true;

      // Reinitialize to avoid missing errors
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      // setHasError(false);
    } catch (e) {
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      // setHasError(true);
    }
  }
}

function initializeGraph(
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>,
  cy: React.MutableRefObject<cytoscape.Core | undefined>
) {
  errorCatcher.current = cytoscape();
  cy.current = cytoscape({
    container: document.getElementById("cy"), // container to render in
    layout: { ...defaultLayout },
    elements: [],
    style: style as cytoscape.Stylesheet[],
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,
    wheelSensitivity: 0.2,
  });
  // @ts-ignore
  cy.current.nodeHtmlLabel([
    {
      query: "node",
      tpl: (data: any) => {
        return `<span style="background-color: royalblue; color: white; padding: .25em .5em; border-radius: 10px; position: absolute; top: 1.5em; left: 0; font-size: 10px; transform: translateX(-50%); font-weight: bold;">${data.prob}</span>`;
      },
    },
  ]);
  const cyCurrent = cy.current;
  const errorCyCurrent = errorCatcher.current;

  return () => {
    cyCurrent.destroy();
    errorCyCurrent.destroy();
    cy.current = undefined;
    errorCatcher.current = undefined;
  };
}

const defaultLayout: cytoscape.LayoutOptions = {
  name: "dagre",
  fit: true,
  animate: true,
  spacingFactor: 1.25,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  rankDir: "TB", // Specific to cytoscape-dagre
};

const style = [
  {
    selector: "node",
    style: {
      backgroundColor: "#ffffff",
      "border-color": "#000000",
      color: "#000000",
      label: "data(label)",
      "font-size": 10,
      "text-wrap": "wrap",
      "text-max-width": "80",
      "text-valign": "center",
      "text-halign": "center",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "line-height": 1.25,
      "border-width": 1,
      shape: "rectangle",
      "font-family":
        "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
      width: "data(width)",
      height: "data(height)",
    },
  },
  {
    selector: "edge",
    style: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "loop-direction": "0deg",
      "loop-sweep": "20deg",
      width: 1,
      "text-background-opacity": 1,
      "text-background-color": "#ffffff",
      "line-color": "#000000",
      "target-arrow-color": "#000000",
      "target-arrow-shape": "vee",
      "arrow-scale": 1,
      "curve-style": "bezier",
      label: "data(label)",

      color: "#000000",
      "font-size": 10,
      "text-valign": "center",
      "text-wrap": "wrap",
      "font-family":
        "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
      "text-halign": "center",
      "edge-text-rotation": "autorotate",
    },
  },
];
