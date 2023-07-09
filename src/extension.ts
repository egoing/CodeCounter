import * as vscode from "vscode";

const STATUS_BAR_ALIGNMENT = vscode.StatusBarAlignment.Left;
const STATUS_BAR_PRIORITY = 100;
const INTERVAL_MILLISECONDS = 1000;
let DEFAULT_TYPING_DELTA = 0.5;

let countdownTimer: NodeJS.Timeout | undefined;
let clockStatusBarItem: vscode.StatusBarItem;
let previousContent: string | undefined = undefined;
let typingIncrement = 0;

export function activate(context: vscode.ExtensionContext) {
  initializeClockStatusBarItem();

  vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
    previousContent = document.getText();
  });

  vscode.workspace.onDidChangeTextDocument(
    (event: vscode.TextDocumentChangeEvent) => {
      if (event.contentChanges.length > 0) {
        typingIncrement += DEFAULT_TYPING_DELTA;
        clockStatusBarItem.text = `$(watch) ${prettyTime(typingIncrement)}`;
      }
    }
  );

  vscode.workspace.onDidSaveTextDocument(() => {
    if (typingIncrement > 0) {
      startCountdown(Math.ceil(typingIncrement));
      resetTypingIncrement();
    }
  });

  vscode.commands.registerCommand(
    "extension.changeTypingDelta",
    async () => {
      const newValueStr = await vscode.window.showInputBox({
        prompt: "Typing time bonus",
        value: DEFAULT_TYPING_DELTA.toString(),
      });

      if (newValueStr !== undefined) {
        DEFAULT_TYPING_DELTA = parseFloat(newValueStr);
        vscode.window.showInformationMessage(
          `New typing time bonus is ${DEFAULT_TYPING_DELTA}`
        );
      }
    }
  );
}

export function deactivate() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
}

function prettyTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  let secs: any = seconds % 60;
  secs = secs.toFixed(1); // 소수점 첫째자리까지 포함하도록 변경

  let result = "";
  if (hrs > 0) {
    result += `${hrs}h `;
  }
  if (mins > 0) {
    result += `${mins}m `;
  }
  result += `${secs}s`;

  return result;
}

function initializeClockStatusBarItem() {
  clockStatusBarItem = vscode.window.createStatusBarItem(
    STATUS_BAR_ALIGNMENT,
    STATUS_BAR_PRIORITY
  );
  clockStatusBarItem.text = "$(watch)";
  clockStatusBarItem.show();
  clockStatusBarItem.command = "extension.changeTypingDelta";
}

function startCountdown(duration: number) {
  let remainingTime = duration;
  clockStatusBarItem.text = `$(watch) ${prettyTime(remainingTime)}`;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(countdownTimer);
      clockStatusBarItem.text = `$(watch)`;
    } else {
      remainingTime--;
      clockStatusBarItem.text = `$(watch) ${prettyTime(remainingTime)}`;
    }
  }, INTERVAL_MILLISECONDS);
}

function resetTypingIncrement() {
  typingIncrement = 0;
}
