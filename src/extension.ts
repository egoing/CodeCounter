import * as vscode from "vscode";

const STATUS_BAR_ALIGNMENT = vscode.StatusBarAlignment.Left;
const STATUS_BAR_PRIORITY = 100;
const INTERVAL_MILLISECONDS = 1000;
const DEFAULT_TYPING_INCREMENT = 0.5;

let countdownTimer: NodeJS.Timeout | undefined;
let clockStatusBarItem: vscode.StatusBarItem;
let previousContent: string | undefined = undefined;
let typingIncrement = 0;

export function activate(context: vscode.ExtensionContext) {
  initializeClockStatusBarItem();

  vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
    previousContent = document.getText();
  });

  vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
    if (event.contentChanges.length > 0) {
      typingIncrement += DEFAULT_TYPING_INCREMENT;
    }
  });

  vscode.workspace.onDidSaveTextDocument(() => {
    if (typingIncrement > 0) {
      startCountdown(Math.ceil(typingIncrement));
      resetTypingIncrement();
    }
  });

  context.subscriptions.push(vscode.commands.registerCommand('extension.Tick-tock-clock: stop', () => {
    vscode.window.showInformationMessage('Hello!');
  }));
}

export function deactivate() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
}

function initializeClockStatusBarItem() {
  clockStatusBarItem = vscode.window.createStatusBarItem(STATUS_BAR_ALIGNMENT, STATUS_BAR_PRIORITY);
  clockStatusBarItem.text = "$(watch) Ready";
  clockStatusBarItem.show();
}

function startCountdown(duration: number) {
  let remainingTime = duration;
	clockStatusBarItem.text = `$(watch) ${remainingTime}s`;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(countdownTimer);
      clockStatusBarItem.text = `$(watch) Ready`;
    } else {
			remainingTime--;
      clockStatusBarItem.text = `$(watch) ${remainingTime}s`;
    }
  }, INTERVAL_MILLISECONDS);
}

function resetTypingIncrement() {
  typingIncrement = 0;
}
