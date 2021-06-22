import * as vscode from 'vscode';

import Completions from "./completions";
import Indent from "./indent";
import Decorator from './decorator';

export function activate(context: vscode.ExtensionContext)
{
    ///////////////////////
    // Completions
    ///////////////////////
    const provider = vscode.languages.registerCompletionItemProvider('php', new Completions(), '*', '@');
	context.subscriptions.push(provider);

    ///////////////////////
    // Decorator, Indent
    ///////////////////////
    let decorator = new Decorator();
    let indent = new Indent();

    vscode.window.onDidChangeActiveTextEditor(editor => {
        decorator.changeActiveTextEditor(editor);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        indent.changeTextDocument(event);
        decorator.changeTextDocument(event);
    }, null, context.subscriptions);
}

export function deactivate() {}
