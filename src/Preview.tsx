import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { ShadowRoot } from "./ShadowRoot";
import { useAsyncRunner } from "./useAsyncRunner";
import { getHashCode } from "./urlHash";

// @ts-expect-error
window.process = { env: {} };

const Preview = () => {
  const [code, setCode] = useState(() => getHashCode());
  const { element, styleSheets, error, isLoading } = useAsyncRunner({ code });

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setCode(e.detail);
    };

    window.addEventListener("code" as any, handler, true);
    return () => window.removeEventListener("code" as any, handler, true);
  }, []);

  console.log(styleSheets);
  return (
    <>
      {isLoading && <div className="preview-loading"></div>}
      {styleSheets.length > 0 ? (
        <ShadowRoot className="preview-element" styleSheets={styleSheets}>
          {element}
        </ShadowRoot>
      ) : (
        <div className="preview-element">{element}</div>
      )}
      {error && <pre className="preview-error">{error}</pre>}
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Preview />
  </React.StrictMode>,
  document.getElementById("preview")
);
