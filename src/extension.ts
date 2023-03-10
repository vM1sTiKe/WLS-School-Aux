// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	const usingInWSL = vscode.workspace.name?.includes("WSL") || false
	const available = vscode.extensions.all.find(ext => ext.id == "ms-vscode-remote.remote-wsl")

	context.subscriptions.push( vscode.commands.registerCommand("wlsschoolaux.compile", async () => {
		if(!available && !usingInWSL) return

		const workSpaces = vscode.workspace.workspaceFolders
		//verifies if only one workspace being used
		if(workSpaces && workSpaces.length != 1) {
			vscode.window.showInformationMessage("Use only one workspace")
			return
		}
		const uri = vscode.workspace.workspaceFolders?.[0].uri
		if(!uri) {
			vscode.window.showInformationMessage("No URI")
			return
		}
		
		//returns if no makefile
		if( !(await vscode.workspace.fs.readDirectory( uri )).find(f => f[0] == "makefile" && f[1] == 1) ) {
			vscode.window.showInformationMessage("No makefile file")
			return
		}

		//create makefile text to concat extras
		const makeFileSTR = [
			["default:\n\tgcc -Wall -o prog main.c input.c"],
			["debug:\n\tgcc -Wall -o prog -g main.c input.c"],
			["clean:\n\trm -f prog"]
		]
		
		//concat modules in makefile text
		if( (await vscode.workspace.fs.readDirectory( uri )).find(f => f[0] == "modules" && f[1] == 2) ) {
			for (const module of await vscode.workspace.fs.readDirectory( vscode.Uri.from({ scheme: uri.scheme, path: `${uri.path}/modules` }) )) {
				makeFileSTR[0].push(`${module[0]}.c`)
				makeFileSTR[1].push(`${module[0]}.c`)
			}
		}

		//write data into makefile
		vscode.workspace.fs.writeFile( vscode.Uri.from({ scheme: uri.scheme,  path: `${uri.path}/makefile` }), Buffer.from( makeFileSTR.map(str => str.join(" ")).join("\n") ) )
		vscode.window.showInformationMessage("Done")
	}) );

	//search if the WSL extension is available
	if(!available && !usingInWSL) {
		vscode.window.showInformationMessage("Non executing cause no WSL available")
		return
	}
	if( !usingInWSL ) vscode.commands.executeCommand("remote-wsl.reopenInWSL")
	
}

// This method is called when your extension is deactivated
export function deactivate() {}