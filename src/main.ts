import "./neat.css";
import "./style.css";
import "./calculator.css";
import "./table.css";

import { calculator } from "./calculator.ts";
import { match } from "ts-pattern";

let inputCount = 0;
let history: string[] = [];
let historyIndex: number = 0;

function displayPush(input: string, output: string) {
    const display = document.getElementById("main-display");
    if (!display) return;

    const inputSpan = document.createElement("span");
    inputSpan.className = "display-input";
    inputSpan.textContent = input;

    const outputSpan = document.createElement("span");
    outputSpan.className = "display-output";
    outputSpan.textContent = output;

    const br = document.createElement("br");
    display.prepend(br);
    display.prepend(outputSpan);
    display.prepend(br);
    display.prepend(inputSpan);
    inputCount += 1;
}

function handleEnter() {
    const inputElem = document.getElementById("main-input") as HTMLInputElement;
    const inputValue = inputElem.value || "";
    const fullPrecision = (document.getElementById("full-precision") as HTMLInputElement).checked;

    // Reset color
    inputElem.style.backgroundColor = "var(--bg-accent)";

    if (inputValue.trim() === "") return;

    // Process input
    const result = calculator(inputValue, fullPrecision);

    // Handle syntax error
    if (result.kind === "SyntaxError") {
        inputElem.style.backgroundColor = "var(--bg-error)";
        return;
    }

    // Save input to history, reset index
    history.push(inputValue);
    historyIndex = 0;

    // Render result
    const prompt = fullPrecision ? "➤➤" : "➤";
    const input = `${prompt} ${inputValue}`;

    const output = match(result)
        .returnType<string>()
        .with({ kind: "ValidResult" }, (r) => r.output)
        .with({ kind: "EvalError" }, (r) => r.message)
        .exhaustive();

    displayPush(input, output);

    // Reset input field
    inputElem.value = "";
}

// Move up in history
function handleUp() {
    const input = document.getElementById("main-input") as HTMLInputElement;
    if (history.length === 0) return;
    if (historyIndex < history.length) {
        historyIndex++;
        input.value = history[history.length - historyIndex];
    }
}

// Move down in history
function handleDown() {
    const input = document.getElementById("main-input") as HTMLInputElement;
    if (history.length === 0) return;
    if (historyIndex > 1) {
        historyIndex--;
        input.value = history[history.length - historyIndex];
    } else if (historyIndex === 1) {
        historyIndex = 0;
        input.value = "";
    }
}

function clear() {
    const display = document.getElementById("main-display");
    if (!display) return;

    display.innerHTML = "";
    inputCount = 0;
}

addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("main-input") as HTMLInputElement;
    const clearButton = document.getElementById("clear-button") as HTMLInputElement;
    const enterButton = document.getElementById("enter-button") as HTMLInputElement;

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleEnter();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            handleUp();
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            handleDown();
        }
    });

    clearButton.addEventListener("click", () => {
        clear();
    });

    enterButton.addEventListener("click", handleEnter);
});
