import fs from 'fs';
import ts from 'typescript';

function checkJsFile(filePath: string) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const parseDiagnostics = (sourceFile as any).parseDiagnostics || [];
  if (parseDiagnostics.length > 0) {
    console.error(`❌ [SYNTAX ERRORS IN ${filePath}]:`);
    for (const diag of parseDiagnostics) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(diag.start);
      const startPos = Math.max(0, diag.start - 50);
      const endPos = Math.min(code.length, diag.start + 50);
      const snippet = code.slice(startPos, endPos);
      console.error(`  - Line ${line + 1}, Col ${character + 1}: ${ts.flattenDiagnosticMessageText(diag.messageText, '\n')}`);
      console.error(`    Snippet: "... ${snippet} ..."`);
    }
  } else {
    console.log(`✅ [SYNTAX OK]: ${filePath}`);
  }
}

function main() {
  checkJsFile('assets/index-CMn9DqNx.js');
  checkJsFile('assets/index-Ftt5f73P.js');
}

main();
