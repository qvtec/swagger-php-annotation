import * as vscode from 'vscode';

export default class Indent
{
    private activeEditor = vscode.window.activeTextEditor;

    constructor() {
    }

    public changeActiveTextEditor(editor: vscode.TextEditor | undefined): void {
        this.activeEditor = editor;
    }

    public changeTextDocument(event: vscode.TextDocumentChangeEvent): void {
        if (this.activeEditor && event.document === this.activeEditor.document) {
            if (this.isNewLine(event)) {
                this.updateNewLIneIndent();
            }
        }
    }

    private updateNewLIneIndent(): void {
        if (!this.activeEditor) {
            return;
        }

        const start = this.activeEditor.selection.start;
        // const tabSize = <number>this.activeEditor.options.tabSize!;
        const tabSize = 2;
        const lineText: string = this.activeEditor.document.lineAt(start.line + 1).text;
        const beforeLineText: string = this.activeEditor.document.lineAt(start.line).text;

        const regexp: RegExp = new RegExp('^(\\s+\\*\\s)(\\s*)');
        const match: any = regexp.exec(beforeLineText);

        let docIndent: string = match[1];
        let indent: string = match[2];

        let position: vscode.Position = new vscode.Position(start.line + 1, docIndent.length);

        const nextStartString = lineText.slice(docIndent.length, docIndent.length + 1);
        const beforeEndString = beforeLineText.slice(-1);

        if (beforeEndString === '(' && nextStartString === ')') {
            indent = indent + ' '.repeat(tabSize) + '\n' + docIndent + indent;
            vscode.commands.executeCommand("cursorUp");
            vscode.commands.executeCommand("cursorLineEnd");
        }
        else if (nextStartString === ')' || nextStartString === ',') {
            indent = indent.slice(tabSize);
        }
        else if (beforeEndString === '(') {
            indent = indent + ' '.repeat(tabSize);
        }

        this.activeEditor.edit(editBuilder => {
            editBuilder.insert(position, indent);
        }, {
            undoStopBefore: true,
            undoStopAfter: true
        });
    }

    private isNewLine(event: vscode.TextDocumentChangeEvent): boolean {
        let isNewLine: boolean = false;
        for (const change of event.contentChanges) {
            let pattern = /^(\r\n|\r|\n)\s+\*\s/;
            if (pattern.test(change.text)) {
                isNewLine = true;
                break;
            }
        }
        return isNewLine;
    }
}