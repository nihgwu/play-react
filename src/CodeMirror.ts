import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { EditorView, keymap, KeyBinding } from "@codemirror/view";
import { defaultKeymap, indentMore, indentLess } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

import { getHashCode, updateHash, decodeHash, defaultHash } from "./urlHash";

const insertSoftTab = ({ state, dispatch }: EditorView) => {
  if (state.selection.ranges.some((r) => !r.empty)) {
    return indentMore({ state, dispatch });
  }

  dispatch(
    state.update(state.replaceSelection("  "), {
      scrollIntoView: true,
      userEvent: "input",
    })
  );
  return true;
};

const extendedKeymap: KeyBinding[] = [
  ...defaultKeymap,
  {
    key: "Tab",
    run: insertSoftTab,
    shift: indentLess,
  },
];

const view = new EditorView({
  state: EditorState.create({
    doc: getHashCode(),
    extensions: [
      basicSetup,
      oneDark,
      keymap.of(extendedKeymap),
      javascript({
        jsx: true,
        typescript: true,
      }),
    ],
  }),
  parent: document.getElementById("editor")!,
  dispatch: (tr) => {
    view.update([tr]);

    if (tr.docChanged) {
      const newCode = tr.newDoc.sliceString(0, tr.newDoc.length);
      updateHash(newCode);
      window.dispatchEvent(
        new CustomEvent("code", {
          detail: newCode,
        })
      );
    }
  },
});

const examples = [
  { name: "Select example...", hash: "" },
  {
    name: "Hacker News",
    hash: defaultHash,
  },
  {
    name: "React Runner",
    hash: "JYWwDg9gTgLgBAbzgYQgEwKYFE3BtAGjgFcBnDAGWADcMAlYgO0YyiIGMoMBDGejAI7FgXOAF84AMygQQcAORdu7GAFoANjQyqoTFlHkAoUJFiI47dBgBC6iOwDW4qTLnzLIEBEaqY3AOakRoaWjKTwwIx4wNzqqJhwALwWVrb2DgAGhnBwJtDwSPHYuPhsJORUtAzMrBxKfHSCwqIS0rIKSioaWjp6rME5GAAepvCYktzE6vAAFACUSQB8iNk5KWEFcBjqGCAYjDBErDJllphE3sgAFtyM-hjOyWSUWtX6Mwira3CklmAYAC4Vt9vpForEigQviDMGAYFcgbD4XAANRwACMUJBay4QhEgIs9X4eK4H2h2MUPC6mlovRqBiBhSsODwhHKLyqfVORMaJIeYix2PEc0F3wF5NyURgMTiVlFwsM0OAkjgMyRVzgywATAAGBZcGDEKCMOCMKbqRXfA1Gk0zCUAHlw1B+MAAnjtEggkGBuGhcHcgfIABxgIZwHXhuAhobycRiRYSnL2oos0pwaixYgYT1nDASS43O7ZhAF273CQAegTQsQx2gcAAZA24PawFxFgg61AxPaK22MIsxImW06O9tdvsYD2K6OHTOaNW1nNVkOsoZhqM4ONJtNVQtEstPjlQuFzOO9gcjlAThw5XBS0XHuzKvQuWTvr8IP9GRKwdKIXKErqkCOryjkuLNASnA8A0TT4u+QqUsoag0touj0vIjIoMyJRss8L5vLUhIwcSkHiGBwryuKoJSjKkIrsuqzWsaqrQvai7fMmOGslA6aZsWub5ow1xlsWD7lnAVYSp2171k2Lb9mOsndr2ilDtijoLp2OwXlOvazpxUk5MuQ5AA",
  },
  {
    name: "React Select",
    hash: "JYWwDg9gTgLgBAZQKYBskGN4DMoRHAciiQENMBaAZ1QxgICh70IA7S+CMGYVyuAXjgBtenDgBvOADcSKAK5IAXIXQALCMxQkYSAgBo4WgEaplBAMLrN23XAC+e0ROmyFZ9lBIB3E1CgBPfUMSExQzBBhPHyQ-QPtHMUkZeSVCGRZgFC0g41NCADUSDKySAnt6AF1GJAAPSFg4ABMkLBI5FHgACgBKAQA+OE6nAB5kNEw4Tm5efnEpnjY7OAB6Pvpu+iA",
  },
  {
    name: "Reach UI",
    hash: "JYWwDg9gTgLgBAFQhANjYYA0cDecCuAzgKZKrpaLJoYAKEY+YcAvnAGZQQhwBEAAlGIBDAMYALAPQxqFXgG4AUKEiw+gkROmyMkwjACeKYoQB0owoQWLFxAB6r4AE2Lth+NB3wA7UegjecACidsLgxgAUAJS4inBwQjD4UIERcfFwADxOwABuAHzpGVlkNMwowgBGxCgAvLwAchDo7MCiwv7eVoXFxZmV+DAygfpGxLU4eOwBMADKwABexABccABMAKysLD29fYRgwt75gLwbgCi7mXqHx0W9lwNDAbt9kqUUzxmZbxhwFdV1vFmxCGwG8AHNurc+g9hnBRsYJlMZvMlqtNtsPntMgcjnBhFBgMIALTiYBOFzHQCZZIB4P8uOJue3i90Gw0xWVeOjAhShWRyuThhgRkw4KAgHVWvAJYPEMF4GJ5TO+5SqNXqTRabQ6wACVjxBOJf1VvAAzHB1cBWu1OpDGZ8YQEBWNERxkYsVustiwdgq7vTThcrkc2Vi-ca6ddg59JPaGYzLkq2Zc+R8k3ldlElCwgA",
  },
  {
    name: "React Three Fiber",
    hash: "JYWwDg9gTgLgBAJQKYEMDGMA0cDecCuAzksgGbZFIDKMKMScAvnKVBCHAORSoacBQoSLFxwAwigB2ANxSEKxAGJQUIBs1bsuAAR7oYAWhgALHkgD0pYACMkUAf1L5JGYBElwAQhAAeACjA2MEIASlx+ODhzczgAFWNgQjgeUjskFwYAd2AAGxy4AHNgaQYiOAATYB4MOHQ0JEIkmAg4EwY1QmMIuDR3QngO4zgAXgJiMj8Q7ui4KiR4fDA4froGUmhW4wZjCBKectrJA-1ihhX6bt7JfrgAbR29pHLsYhgACV27AF0Rsepaeh+UgoHLEKaRK43W4nEoveYAQVcJR+o0oNFWQJBYOmMSo+GshDQUBsDBMiR67EgknS8GamwYPCOdgMOQgEDA2DYANJWzggzgSD2AE8WCo1N1KMpVEg-H5zkhsOUkDlaGFhgA+OB+QYAOjQ+CgjJgOq5dDckh1PjgAGpRgAGHV2gCMIXBURiyBgBo80mASEy2DaxFqPGSSAK+ByKCgmzMOoAVkllUg1JIYEmfIEGsQDsAPAApKgADW6PC9UA8fm6kQAPINq5FcDrm4F2YRGA3IilhjhBh3G43CSCkD2YQwAPxwJ06gCscAAXFP+wO4O4xDlgGgANY9vyCmlqzWvREwU5+ACEY5Cy4H7gAChA8-QoAB5Pa7-dpw-LeYfPZ+GAoHwJBr07VdJAfJ87BffAYA-EovxGI9f0+KBMVBEDGHVMCa2sXwAHEkHYeYoBFaMCkIHtbidbAaKnL5mHMbCVzgOsGmMdEjmjcoAFlVmJEEKVZKAeweNIDknTgdhgMA8y3TgFy4aApAKJBOEY5jGxrcxBk0qYO34RklTQ7oawkGQ5E02tVGsP00wAGWAApjHgJiGxrSAn0c5z4EgQhgFPdwqKdO1aNCqc7QYqIrNY7wrT8gLzSogxpwAJmwcLIo09y4rgBLAskYKdXSuBMqitza3MczZEIbCQiAA",
  },
  {
    name: "canvas-confetti",
    hash: "JYWwDg9gTgLgBAYwgOwGYFMY2HVUIhwDkCAhsgG6kDOAtEmptkQFAsMZbAAUAlEA",
  },
  {
    name: "swr",
    hash: "JYWwDg9gTgLgBAJQKYEMDG8BmUIjgIilQ3wG4AoUSWOAVwGckBlAdQTm1wPoHcozy5NBAB29LEhhoAFkihwAvHAAUtKABsAlIoB8HSTNUbNAOhiyRy5UXraFemyYBW9Ucs2aK5JAA9q8ABMkTBRadSxaEQxgUTgAQTAwdzgAb3I4OGExeBS4AJQYFAAaODkceQBfRTpGVgRldIyCaRgYMHoALgB6LpQwYBMAc2BzWgAjE2EQLqJIei6ANzk0JHUu3n4ixozMA1koRs9BDOBMFTLobSIYNRECOLuL+WkUejgINDQ1IgCTAROzsoAIT5QpXSS3AgAGQgKACwBEgxMyP+cGukIaTTgAB54QsdNsmtjpABGHQpUEoEwiFAgJAVbFdUkErEZbFgcmUkxBehoKDAMAwGIiBldDmEtniHCInSAXg3AII7qS59HGvP5Yzk9AA+sJIjBRVLRINyfgCBUJTjDTLABTkSoKVPEKCggxQAC9NTqIHqDTBpcaUqb8ObWZbfUadIAeDcALvt2womTDQADW2t1In1jKtxsJjLxLLgR3NQA",
  },
];

const select = document.getElementById("examples") as HTMLSelectElement;
select.onchange = () => {
  const hash = examples[select.selectedIndex].hash;
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: decodeHash(hash),
    },
  });
};

examples.forEach((example) => {
  const option = document.createElement("option");
  option.innerText = example.name;
  select.appendChild(option);
});
