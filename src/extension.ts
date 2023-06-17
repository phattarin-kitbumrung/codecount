import * as vscode from 'vscode';
import { TextEncoder } from 'util';
import { countMetricsInProject } from './metricsCounter';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {	
	let disposable = vscode.commands.registerCommand('codecount.start', async () => {
    const projectPath = vscode.workspace.workspaceFolders;
    vscode.window.showInformationMessage('CodeCount is now started...');
	
    if (projectPath) {
	  const countMetrics = countMetricsInProject(projectPath[0].uri.fsPath);
	  await vscode.workspace.fs.writeFile(vscode.Uri.parse(projectPath[0].uri.fsPath + '/' + 'codecount.html'), 
	  new TextEncoder().encode('<html><body>' + '<h2>codecount</h2>' +
	  	'Number of functions in the project: ' + countMetrics.functionCount + '<br>' + 
	  	'Number of classes in the project: ' + countMetrics.classCount + '<br>' + 
		'Number of files in the project: ' + countMetrics.fileCount + '<br>' + 
		'Number of lines of code in the project: ' + countMetrics.locCount + '</body></html>'));
	  vscode.env.openExternal(vscode.Uri.parse(projectPath[0].uri.fsPath + '/' + 'codecount.html'));
    } else {
      vscode.window.showErrorMessage('No workspace found!');
    }
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
