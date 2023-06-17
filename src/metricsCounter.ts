import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

type Metric = {
  functionCount: number, 
  classCount: number, 
  fileCount: number, 
  locCount: number
};

function countFunctions(sourceFile: ts.SourceFile): number {
  let count = 0;

  function visit(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.FunctionDeclaration 
      || node.kind === ts.SyntaxKind.ArrowFunction
      || node.kind === ts.SyntaxKind.MethodDeclaration
      || node.kind === ts.SyntaxKind.Constructor
      || node.kind === ts.SyntaxKind.FunctionKeyword) {
      count++;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return count;
}

function countClasses(sourceFile: ts.SourceFile): number {
  let count = 0;

  function visit(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      count++;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return count;
}

function countLinesOfCode(sourceCode: string): number {
  const lines = sourceCode.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim() !== '');

  return nonEmptyLines.length;
}

export function countMetricsInProject(projectPath: string): Metric {
  let functionCount = 0;
  let classCount = 0;
  let fileCount = 0;
  let locCount = 0;

  function processFile(fileName: string) {
    const sourceCode = fs.readFileSync(fileName, 'utf-8');
    const sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.ES2022, true);
    functionCount += countFunctions(sourceFile);
    classCount += countClasses(sourceFile);
    fileCount++;
    locCount += countLinesOfCode(sourceCode);
  }

  function processDirectory(directory: string) {
    const fileNames = fs.readdirSync(directory);

    for (const fileName of fileNames) {
      const fullPath = path.join(directory, fileName);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory() && fileName !== 'node_modules') {
        processDirectory(fullPath);
      } else if (stats.isFile() && (fileName.endsWith('.ts') || fileName.endsWith('.tsx'))) {
        processFile(fullPath);
      }
    }
  }

  processDirectory(projectPath);

  // console.log(`Number of files in the project: ${fileCount}`);
  // console.log(`Number of functions in the project: ${functionCount}`);
  // console.log(`Number of classes in the project: ${classCount}`);
  // console.log(`Number of lines of code in the project: ${locCount}`);

  return {
    functionCount,
    classCount,
    fileCount,
    locCount
  };
}
