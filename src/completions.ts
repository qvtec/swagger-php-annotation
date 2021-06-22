import * as vscode from 'vscode';

export default class Completions implements vscode.CompletionItemProvider
{

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[]>
    {
        let result: any = [];

        if (!vscode.window.activeTextEditor) {
            return [];
        }

        // [/**]
        if (document.getWordRangeAtPosition(position, /\/\*\*/) !== undefined) {
            let block = new vscode.CompletionItem("/**", vscode.CompletionItemKind.Snippet);
            block.detail = "Swagger-PHP Annotation";
            block.documentation = "Generate a Swagger-php Annotation from the code snippet below.";
            let range = document.getWordRangeAtPosition(position, /\/\*\* \*\//);
            block.range = range;
            block.insertText = this.autoDocument(document, position);
            result.push(block);
            return result;
        }

        // [\s+*] anotation line test and nothing return
        const lineText: string = document.lineAt(position.line).text;
        if (!(/^\s+\*/.test(lineText))) {
            return [];
        }

        // HTTP Method [* @]
        if (document.getWordRangeAtPosition(position, /\*\s\@/) !== undefined) {
            this.tags.httpMethod.forEach(tag => {
                let item = new vscode.CompletionItem(tag.tag, vscode.CompletionItemKind.Snippet);

                let snippet: string = this.getAnnotation("${1:name}", tag.snippet);
                snippet = snippet.replace(/^(?!(\s\*|\/\*))/gm, "* $1");
                snippet = snippet.replace(/^\*\s\@/g, "");

                item.insertText = new vscode.SnippetString(snippet);
                item.commitCharacters = ['('];
                item.documentation = 'Press `(` to get Swagger-php template';
                result.push(item);
            });

            return result;
        }

        // OA types [*\s\s+@]
        if (document.getWordRangeAtPosition(position, /\*\s\s+\@/) !== undefined) {
            this.tags.types.forEach(tag => {
                let item = new vscode.CompletionItem(tag.tag, vscode.CompletionItemKind.Snippet);

                const regexp: RegExp = new RegExp('^(\\s+\\*\\s)(\\s*)');
                const match: any = regexp.exec(lineText);
                let indent: string = match[2];

                let snippet: string = tag.snippet;
                snippet = snippet.replace(/^(?!(\s\*))/gm, "* ###$1");
                snippet = snippet.replace(/###/gm, indent);
                snippet = snippet.replace(/^\*\s+\@/g, "");

                item.insertText = new vscode.SnippetString(snippet);
                item.commitCharacters = ['('];
                item.documentation = 'Press `(` to get Swagger-php template';
                result.push(item);
            });

            return result;
        }

        return result;
    }

    private autoDocument(document: vscode.TextDocument, position: vscode.Position): vscode.SnippetString
    {
        let templateArray = [];

        let match: any;

        // action
        let actionName: string = "";
        const nextLinePosition = new vscode.Position(position.line + 1, position.character - 3);
        if ((match = document.getWordRangeAtPosition(nextLinePosition, /public function (\w+)/)) !== undefined) {
            actionName = document.getText(match).replace('public function ', '');
        }

        // class
        let className: string = "";
        for (let n = 0; n < position.line; n++) {
            const nowPosition = new vscode.Position(n, 0);
            if ((match = document.getWordRangeAtPosition(nowPosition, /class (\w+)/)) !== undefined) {
                className = document.getText(match).replace('class ', '').replace('Controller', '');
                break;
            }
        }

        let snippet: string = this.getAnnotation(className, actionName);
        templateArray.push(snippet);

        if (templateArray[templateArray.length - 1] === "") {
            templateArray.pop();
        }

        let templateString:string = templateArray.join("\n");
        templateString = "/**\n" + templateString + "\n */";

        templateString = templateString.replace(/^$/gm, " *");
        templateString = templateString.replace(/^(?!(\s\*|\/\*))/gm, " * $1");

        return new vscode.SnippetString(templateString);
    }

    private getAnnotation(className: string, actionName: string): string
    {
        const path = className.split(/(?=[A-Z])/).join('-').toLowerCase();
        let snippet: string = "";
        switch (actionName) {
            case 'index':
                // Get
                snippet = '@OA\\Get(' +
                    '\n  tags={"${1:' + className + '}"},' +
                    '\n  path="\/api\/path",' +
                    '\n  summary="${1} ' + actionName + '",' +
                    '\n  @OA\\Response(' +
                    '\n    response=200,' +
                    '\n    description="OK",' +
                    '\n    @OA\\JsonContent(' +
                    '\n      type="object",' +
                    '\n      @OA\\Property(' +
                    '\n        property="data",' +
                    '\n        type="array",' +
                    '\n        @OA\\Items(ref="#/components/schemas/${1}Resource")' +
                    '\n      ),' +
                    '\n      @OA\\Property(property="links", ref="#/components/schemas/PageLinks"),' +
                    '\n      @OA\\Property(property="meta", ref="#/components/schemas/PageMeta")' +
                    '\n    )' +
                    '\n  )' +
                    '\n)';
                break;
            case 'store':
                // Post
                snippet = '@OA\\Post(' +
                '\n  tags={"${1:' + className + '}"},' +
                '\n  path="\/api\/path\/{id}",' +
                '\n  summary="${1} ' + actionName + '",' +
                '\n  @OA\\RequestBody(' +
                '\n    required=true,' +
                '\n    @OA\\JsonContent(' +
                '\n      type="object",' +
                '\n      required={"${2:xxx}"},' +
                '\n      @OA\\Property(property="${2}", type="string")' +
                '\n    )' +
                '\n  ),' +
                '\n  @OA\\Response(' +
                '\n    response=201,' +
                '\n    description="OK",' +
                '\n    @OA\\JsonContent(ref="#/components/schemas/${1}Resource")' +
                '\n  ),' +
                '\n  @OA\\Response(response=401, description="Unauthorized"),' +
                '\n  @OA\\Response(response=404, description="Not Found")' +
                '\n)';
                break;
            case 'show':
                // Get
                snippet = '@OA\\Get(' +
                '\n  tags={"${1:' + className + '}"},' +
                '\n  path="\/api\/path\/{id}",' +
                '\n  summary="${1} ' + actionName + '",' +
                '\n  @OA\\Parameter(ref="#/components/parameters/id"),'+
                '\n  @OA\\Response(' +
                '\n    response=200,' +
                '\n    description="OK",' +
                '\n    @OA\\JsonContent(ref="#/components/schemas/${1}Resource")' +
                '\n  ),' +
                '\n  @OA\\Response(response=404, description="Not Found")' +
                '\n)';
                break;
            case 'update':
                // Put
                snippet = '@OA\\Put(' +
                '\n  tags={"${1:' + className + '}"},' +
                '\n  path="\/api\/path\/{id}",' +
                '\n  summary="${1} ' + actionName + '",' +
                '\n  @OA\\Parameter(ref="#/components/parameters/id"),'+
                '\n  @OA\\RequestBody(' +
                '\n    required=true,' +
                '\n    @OA\\JsonContent(' +
                '\n      type="object",' +
                '\n      required={"${2:xxxx}"},' +
                '\n      @OA\\Property(property="${2}", type="string")' +
                '\n    )' +
                '\n  ),' +
                '\n  @OA\\Response(' +
                '\n    response=200,' +
                '\n    description="OK",' +
                '\n    @OA\\JsonContent(ref="#/components/schemas/${1}Resource")' +
                '\n  ),' +
                '\n  @OA\\Response(response=404, description="Not Found"),' +
                '\n  @OA\\Response(response=422, description="Unprocessable Entity")' +
                '\n)';
                break;
            case 'destroy':
                // Delete
                snippet = '@OA\\Delete(' +
                '\n  tags={"${1:' + className + '}"},' +
                '\n  path="\/api\/path\/{id}",' +
                '\n  summary="${1} ' + actionName + '",' +
                '\n  @OA\\Parameter(ref="#/components/parameters/id"),'+
                '\n  @OA\\Response(' +
                '\n    response=200,' +
                '\n    description="OK",' +
                '\n    @OA\\JsonContent(ref="#/components/schemas/${1}")' +
                '\n  ),' +
                '\n  @OA\\Response(response=404, description="Not Found")' +
                '\n)';
                break;
            default:
                snippet = '@OA\\Get(' +
                '\n  tags={"${1:Tag}"},' +
                '\n  path="${2:Path}",' +
                '\n  summary="${3:Summary}",' +
                '\n  @OA\\Parameter(ref="#/components/parameters/id"),' +
                '\n  @OA\\Response(response=200, description="OK"),' +
                '\n  @OA\\Response(response=401, description="Unauthorized"),' +
                '\n  @OA\\Response(response=404, description="Not Found")' +
                '\n)';
        }
        return snippet;
    }

    protected tags = {
        httpMethod: [
            {
                tag: '@OA\\Get(index)',
                snippet: 'index'
            },
            {
                tag: '@OA\\Get(show)',
                snippet: 'show'
            },
            {
                tag: '@OA\\Post(store)',
                snippet: 'store'
            },
            {
                tag: '@OA\\Put(update)',
                snippet: 'update'
            },
            {
                tag: '@OA\\Delete(destroy)',
                snippet: 'destroy'
            }
        ],
        types: [
            {
                tag: '@OA\\Parameter(ref:id)',
                snippet: '@OA\\Parameter(ref="#/components/parameters/id")'
            },
            {
                tag: '@OA\\Parameter',
                snippet: '@OA\\Parameter(' +
                '\n  name="${1:name}",' +
                '\n  in="${2|query,path|}",' +
                '\n  required=true,' +
                '\n  @OA\\Schema(type="${3|string,integer,object,array|}")' +
                '\n)'
            },
            {
                tag: '@OA\\Response',
                snippet: '@OA\\Response(' +
                '\n  response=200,' +
                '\n  description="OK",' +
                '\n  @OA\\JsonContent(ref="#/components/schemas/${1:Resource}")' +
                '\n)'
            },
            {
                tag: '@OA\\JsonContent(ref:id)',
                snippet: '@OA\\JsonContent(ref="#/components/schemas/${1:Resource}")'
            },
            {
                tag: '@OA\\JsonContent',
                snippet: '@OA\\JsonContent(' +
                '\n  type="${1|string,integer,object,array|}",' +
                '\n  required={"${2:name}"},' +
                '\n  @OA\\Property(property="${2}", type="${3|string,integer,object,array|}")' +
                '\n)'
            },
            {
                tag: '@OA\\Schema',
                snippet: '@OA\\Schema(ref="#/components/schemas/${1:Schema}")'
            },
            {
                tag: '@OA\\Items',
                snippet: '@OA\\Items(ref="#/components/schemas/${1:Schema}")'
            },
            {
                tag: '@OA\\Property(one line)',
                snippet: '@OA\\Property(property="${1:name}", type="${2|string,integer,object,array|}")'
            },
            {
                tag: '@OA\\Property(type array)',
                snippet: '@OA\\Property(' +
                '\n  property="${1:name}",' +
                '\n  type="array",' +
                '\n  @OA\\Items(ref="#/components/schemas/${2:Schema}")' +
                '\n)'
            },
            {
                tag: '@OA\\Property',
                snippet: '@OA\\Property(' +
                '\n  property="${1:name}",' +
                '\n  type="${2|string,integer,object,array|}",' +
                '\n  example="${example}",' +
                '\n  description="${description}"' +
                '\n)'
            },
            {
                tag: '@OA\\RequestBody',
                snippet: '@OA\\RequestBody(' +
                '\n  required=true,' +
                '\n  @OA\\JsonContent(' +
                '\n    type="${1|string,integer,object,array|}",' +
                '\n    required={"${2:name}"},' +
                '\n    @OA\\Property(property="${2}", type="${3|string,integer,object,array|}")' +
                '\n  )' +
                '\n)'
            }
        ],
    };
}
