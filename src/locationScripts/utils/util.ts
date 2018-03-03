import path = require("path");
import electron = require("electron")
export const con = electron.remote.getGlobal("console");
const app = electron.remote.app;
export const appPath = app.getAppPath();
export const todoPath = "file://" + path.join(appPath, "todo.html");

export function hideByQuery(query: string, parent: boolean): void {
  let elements = document.querySelectorAll(query) as NodeListOf<HTMLElement>;
  for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
      if (parent) {
      elements[i].parentElement!.style.display = "none";
      }
  }
}