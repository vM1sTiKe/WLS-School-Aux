"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    //search if the WSL extension is available
    if (!vscode.extensions.all.find(ext => ext.id == "ms-vscode-remote.remote-wsl")) {
        vscode.window.showInformationMessage("Non executing cause no WSL available");
        return;
    }
    context.subscriptions.push(vscode.commands.registerCommand("wlsschoolaux.compile", async () => {
        const workSpaces = vscode.workspace.workspaceFolders;
        //verifies if only one workspace being used
        if (workSpaces && workSpaces.length != 1) {
            vscode.window.showInformationMessage("Use only one workspace");
            return;
        }
        const uri = vscode.workspace.workspaceFolders?.[0].uri;
        if (!uri)
            return;
        //returns if no makefile
        if (!(await vscode.workspace.fs.readDirectory(uri)).find(f => f[0] == "makefile" && f[1] == 1))
            return;
        //create makefile text to concat extras
        const makeFileSTR = [
            ["default:\n\tgcc -Wall -o prog main.c input.c"],
            ["debug:\n\tgcc -Wall -o prog -g main.c input.c"],
            ["clean:\n\trm -f prog"]
        ];
        //concat modules in makefile text
        if ((await vscode.workspace.fs.readDirectory(uri)).find(f => f[0] == "modules" && f[1] == 2)) {
            for (const module of await vscode.workspace.fs.readDirectory(vscode.Uri.from({ scheme: uri.scheme, path: `${uri.path}/modules` }))) {
                makeFileSTR[0].push(`${module[0]}.c`);
                makeFileSTR[1].push(`${module[0]}.c`);
            }
        }
        //write data into makefile
        vscode.workspace.fs.writeFile(vscode.Uri.from({ scheme: uri.scheme, path: `${uri.path}/makefile` }), Buffer.from(makeFileSTR.map(str => str.join(" ")).join("\n")));
    }));
    if (!vscode.workspace.name?.includes("WSL"))
        return;
    vscode.commands.executeCommand("remote-wsl.reopenInWSL");
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map