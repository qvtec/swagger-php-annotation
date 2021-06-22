import * as vscode from 'vscode';

export default class Decolator
{
    private activeEditor = vscode.window.activeTextEditor;
    private timeout: NodeJS.Timer | undefined = undefined;

    private decorationTypes: vscode.TextEditorDecorationType[] = [];
    private regexes: RegExp[] = [];

    constructor() {
        this.initDataSet();

        if (this.activeEditor) {
            this.triggerUpdateDecorations();
        }
    }

    public changeActiveTextEditor(editor: vscode.TextEditor | undefined): void {
        this.activeEditor = editor;
        if (editor) {
            this.triggerUpdateDecorations();
        }
    }

    public changeTextDocument(event: vscode.TextDocumentChangeEvent): void {
        if (this.activeEditor && event.document === this.activeEditor.document) {
            if (this.isTargetLine(event)) {
                this.triggerUpdateDecorations();
            }
        }
    }

    private triggerUpdateDecorations(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = setTimeout(() => {
            this.updateDecorations();
        }, 500);
    }

    private updateDecorations(): void {
        if (!this.activeEditor) {
            return;
        }

        const editor = this.activeEditor;
        const document = editor.document;
        const text = document.getText();

        this.regexes.forEach((regEx: RegExp, idx: number) => {
            let decorationOption: vscode.DecorationOptions[] = [];
            let match: any;
            while (match = regEx.exec(text)) {
                match.forEach((target: string, i: number) => {
                    if (i === 0) {
                        return;
                    }
                    const targetRegexp = new RegExp(this.escape(target), 'g');
                    let targetMatch: any;
                    while (targetMatch = targetRegexp.exec(match[0])) {
                        const startPos = document.positionAt(match.index + targetMatch.index);
                        const endPos = document.positionAt(match.index + targetMatch.index + targetMatch[0].length);
                        const decorationPos = { range: new vscode.Range(startPos, endPos) };
                        decorationOption.push(decorationPos);
                    }
                });
            }

            editor.setDecorations(this.decorationTypes[idx], decorationOption);
        });
    }

    private initDataSet(): void {
        const config: any = vscode.workspace.getConfiguration().get('decorator.regexes');

        const regexesKeys = Object.keys(config);

        this.regexes = regexesKeys.map ((pattern) => {
            return new RegExp (pattern, 'g');
        });

        this.decorationTypes = regexesKeys.map ((pattern) => {
            const types = config[pattern].decorationType;
            return vscode.window.createTextEditorDecorationType(types);
        });
    }

    private isTargetLine(event: vscode.TextDocumentChangeEvent): boolean {
        let isTargetLine: boolean = false;
        for (const change of event.contentChanges) {
            const linePosition = new vscode.Position(change.range.start.line, 0);
            const lineText = event.document.lineAt(linePosition).text;
            let pattern = /^\s+\*/;
            if (pattern.test(lineText)) {
                isTargetLine = true;
                break;
            }
        }
        return isTargetLine;
    }

    private escape (value: string): string {
        return value
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/"/g, '\\"')
                .replace(/\//g, '\\/')
                .replace(/</g, '\\x3c')
                .replace(/>/g, '\\x3e')
                .replace(/(0x0D)/g, '\r')
                .replace(/(0x0A)/g, '\n');
    };
}