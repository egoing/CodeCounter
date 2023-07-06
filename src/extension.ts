import * as vscode from "vscode";
let countdownTimer:any;
function startCountdown(diff:number) {
	let countdown = diff;
	if(countdownTimer){
		clearInterval(countdownTimer);
	}
	countdownTimer = setInterval(() => {
			if (countdown <= 0) {
					clearInterval(countdownTimer);
					clockStatusUI.text = `$(watch) 0`;
			} else {
					clockStatusUI.text = `$(watch) ${countdown}s`;
					countdown--;
			}
	}, 1000);
}
let clockStatusUI: vscode.StatusBarItem;
let defaultDelta = 0.5;
export function activate(context: vscode.ExtensionContext) {
	let previousContent: string | undefined = undefined;
	let typingCount = 0;
  vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
		previousContent = document.getText();
	});	
	vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
    // 텍스트 문서가 변경될 때마다 실행 횟수 증가
		if (event.contentChanges.length > 0) {
			typingCount = typingCount + defaultDelta;
		}
	});
  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    if (typingCount > 0) {
				clockStatusUI.show();
        startCountdown(Math.ceil(typingCount));
    }
    typingCount = 0; // Save 후 실행 횟수 초기화
	});
	clockStatusUI = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	context.subscriptions.push(vscode.commands.registerCommand('extension.Tick-tock-clock: stop', () => {
		vscode.window.showInformationMessage('Hello!');
	}));

}
export function deactivate() {}
