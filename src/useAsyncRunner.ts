import {
  useState,
  useRef,
  useEffect,
  createElement,
  ReactElement,
} from "react";
import "construct-style-sheets-polyfill";

import { Runner, UseRunnerProps, UseRunnerReturn } from "react-runner";

const importModuleRegexp = /^import [^'"]* from ['"]([^'"\n ]+)['"]/gm;
const importCssRegexp = /^import +['"]([^'"\n ]+.css)['"]/gm;
const remoteRegexp = /^https?:\/\//;
const remoteCDN = "https://esm.sh/";
const cssCDN = "https://cdn.jsdelivr.net/npm/";

const extractImports = (code: string): [string[], string[]] => [
  (code.match(importModuleRegexp) || []).map((x) =>
    x.replace(importModuleRegexp, "$1")
  ),
  (code.match(importCssRegexp) || []).map((x) =>
    x.replace(importCssRegexp, "$1")
  ),
];

const importCss = (url: string) => {
  try {
    // https://github.com/tc39/proposal-import-assertions
    return eval(`import('${url}', { assert: { type: 'css' }})`);
  } catch {
    return fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.text();
      })
      .then((css) => {
        const style = new CSSStyleSheet();
        return style.replace(css);
      })
      .then((sheet) => ({
        default: sheet,
      }))
      .catch(() => {
        {
          throw new TypeError(
            `Failed to fetch dynamically imported module: ${url}`
          );
        }
      });
  }
};

const interopRequireDefault = (obj: any) => {
  return obj && obj[Symbol.toStringTag] === "Module"
    ? { ...obj, __esModule: true }
    : obj;
};

const normalizeModule = (module: string) => {
  if (remoteRegexp.test(module)) return module;
  if (module.endsWith(".css")) return `${cssCDN}${module}`;
  return `${remoteCDN}${module}`;
};

const defaultImportsRevolvor = (
  moduleImports: string[],
  cssImports: string[]
): Promise<[Record<string, any>, CSSStyleSheet[]]> => {
  return Promise.all([
    Promise.all(
      moduleImports.map(
        (module) => import(/* @vite-ignore */ normalizeModule(module))
      )
    ).then((result) =>
      Object.fromEntries(
        moduleImports.map((module, idx) => [
          module,
          interopRequireDefault(result[idx]),
        ])
      )
    ),
    Promise.all(
      cssImports.map((module) => importCss(normalizeModule(module)))
    ).then((result) => result.map((x) => x?.default).filter(Boolean)),
  ]).then((result) => result);
};

export type UseAsyncRunnerProps = UseRunnerProps & {
  resolveImports?: (
    moduleImports: string[],
    cssImports: string[]
  ) => Promise<[Record<string, any>, CSSStyleSheet[]]>;
};

export type UseAsyncRunnerReturn = UseRunnerReturn & {
  isLoading: boolean;
  styleSheets: CSSStyleSheet[];
};

export const useAsyncRunner = ({
  code,
  scope,
  disableCache,
  resolveImports = defaultImportsRevolvor,
}: UseAsyncRunnerProps): UseAsyncRunnerReturn => {
  const elementRef = useRef<ReactElement | null>(null);
  const styleSheetsRef = useRef<CSSStyleSheet[]>([]);
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  const [state, setState] = useState<UseAsyncRunnerReturn>({
    isLoading: false,
    element: null,
    styleSheets: [],
    error: null,
  });

  useEffect(() => {
    const trimmedCode = code.trim();
    const extractedImports = extractImports(trimmedCode);
    if (extractedImports[0].length || extractedImports[1].length) {
      setState({
        isLoading: true,
        element: disableCache ? null : elementRef.current,
        styleSheets: disableCache ? [] : styleSheetsRef.current,
        error: null,
      });
    }
    resolveImports(...extractImports(trimmedCode))
      .then(([importsMap, styleSheets]) => {
        let normalizedCode = trimmedCode.replace(importCssRegexp, "");
        if ("react-dom" in importsMap) {
          normalizedCode = normalizedCode.replace(
            /ReactDOM.render\(/i,
            "render("
          );
        }
        const element = createElement(Runner, {
          code: normalizedCode,
          scope: {
            ...scopeRef.current,
            import: importsMap,
          },
          onRendered: (error) => {
            if (error) {
              setState({
                isLoading: false,
                element: disableCache ? null : elementRef.current,
                styleSheets: disableCache ? [] : styleSheetsRef.current,
                error: error.toString(),
              });
            } else {
              elementRef.current = element;
              styleSheetsRef.current = styleSheets;
            }
          },
        });
        setState({ isLoading: false, element, styleSheets, error: null });
      })
      .catch((error: Error) => {
        setState({
          isLoading: false,
          element: disableCache ? null : elementRef.current,
          styleSheets: disableCache ? [] : styleSheetsRef.current,
          error: error.toString().replace(remoteCDN, ""),
        });
      });
  }, [code, disableCache]);

  return state;
};
