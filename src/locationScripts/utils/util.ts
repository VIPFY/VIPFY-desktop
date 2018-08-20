const path = require("path");
const electron = require("electron");
export const con = electron.remote.getGlobal("console");
const app = electron.remote.app;
export const appPath = app.getAppPath();
export const todoPath = "vipfy://todo/"; //"file://" + path.join(appPath, "src", "todo.html");

export function hideByQuery(query: string, parent: boolean): void {
  let elements = document.querySelectorAll<HTMLElement>(query);
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = "none";
    if (parent) {
      elements[i].parentElement!.style.display = "none";
    }
  }
}

export function redirectLinks(originalUrl: string, targetUrl: string): void {
  //select all links with hrefs starting with originalUrl
  redirectLinksByQuery(`a[href^='${originalUrl}']`, targetUrl);
}

export function redirectLinksByQuery(query: string, targetUrl: string): void {
  let elements = document.querySelectorAll<HTMLAnchorElement>(query);
  for (let i = 0; i < elements.length; i++) {
    elements[i].href = targetUrl;
  }
}

export function deleteElement(selector: string): void {
  const element = document.querySelector(selector);
  element.parentNode.removeChild(element);
}
