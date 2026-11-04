import { mount } from "svelte";
import App from "./App.svelte";
import "./style.css";

const root = document.querySelector<HTMLElement>("#root");

if (!root) {
  throw new Error("Application root is missing.");
}

mount(App, { target: root });
