import eventManagerInstance from "../../events/EventManager";
import { PageOpenEvent } from "../../events/onPageOpen";
import { getSetting } from "../../settings";
import { colorizeHttpHistory, observeHTTPRequests } from "./colorize";
import { highlightHTTPRow } from "./manual";

export const colorizeHTTPFunctionality = () => {
  if (getSetting("highlightRowsFunctionality") === "false") return;

  eventManagerInstance.on("onPageOpen", (data: PageOpenEvent) => {
    if (data.newUrl == "#/intercept") {
      setTimeout(() => {
        observeHTTPRequests();
        colorizeHttpHistory();
      }, 100);
    }
  });

  
  highlightHTTPRow();
};