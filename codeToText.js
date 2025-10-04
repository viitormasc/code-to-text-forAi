#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const currentFolder = path.basename(process.cwd());
let fullCodeFileName = `${currentFolder}-fullcode.txt`;

let filesToInclude = new Set();
let exclude = new Set();

const workOnExtentions = new Set([
  '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.vb', '.r',
  '.rb', '.go', '.php', '.swift', '.kt', '.rs', '.scala', '.pl', '.lua', '.jl',
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.less', '.sass',
  '.sh', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
  '.sql', '.psql', '.db', '.sqlite',
  '.xml', '.json', '.toml', '.ini', '.yml', '.yaml', '.md', '.rst',
  'Makefile', '.gradle', '.cmake', '.ninja',
  '.pqm', '.pq'
]);

const ignoreDirectories = new Set([
  'venv',
  '.venv',
  'node_modules',
  '__pycache__',
  '.git',
  'dist',
  'build',
  'temp',
  'old_files',
  'flask_session'
]);

const scriptName = path.basename(__filename);
const excludeFiles = new Set([scriptName, 'package-lock.json', 'package.json', 'temp.py']);

function generateDirectoryTree(startPath) {
  let tree = "";

  function walkDirectory(currentPath, level = 0) {
    const items = fs.readdirSync(currentPath);
    const dirs = [];
    const files = [];

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          dirs.push(item);
        } else {
          files.push(item);
        }
      } catch (error) {
        continue;
      }
    }

    const currentDir = path.basename(currentPath) || currentPath;

    if (ignoreDirectories.has(currentDir)) {
      const indent = '│   '.repeat(level) + (level > 0 ? '├── ' : '');
      tree += `${indent}${currentDir}/ [EXCLUDED]\n`;
      return;
    }

    const indent = '│   '.repeat(level) + (level > 0 ? '├── ' : '');
    tree += `${indent}${currentDir}/\n`;

    for (const dir of dirs) {
      if (!ignoreDirectories.has(dir)) {
        walkDirectory(path.join(currentPath, dir), level + 1);
      } else {
        const dirIndent = '│   '.repeat(level + 1) + '├── ';
        tree += `${dirIndent}${dir}/ [EXCLUDED]\n`;
      }
    }

    for (const file of files) {
      if (!excludeFiles.has(file)) {
        const fileIndent = '│   '.repeat(level + 1) + '├── ';
        tree += `${fileIndent}${file}\n`;
      }
    }
  }

  walkDirectory(startPath);
  return tree;
}

function isProgrammingFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return workOnExtentions.has(ext) && !exclude.has(ext);
}

function shouldExclude(filePath) {
  const normalizedPath = path.normalize(filePath);
  const parts = normalizedPath.split(path.sep);

  for (let i = 0; i < parts.length - 1; i++) {
    if (ignoreDirectories.has(parts[i])) {
      return true;
    }
  }

  if (excludeFiles.has(parts[parts.length - 1])) {
    return true;
  }

  return false;
}

function shouldIncludeFile(filePath) {
  if (filesToInclude.size === 0) {
    return true;
  }
  const relFilePath = path.relative(process.cwd(), filePath);
  return filesToInclude.has(relFilePath);
}

function parseArguments() {
  const args = process.argv.slice(2);
  const parsedArgs = {
    clipboard: false,
    directory: process.cwd(),
    outputFile: fullCodeFileName,
    includeFiles: "",
    extensions: "",
    excludeDirs: "",
    excludeExtensions: ""
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-c':
      case '--clipboard':
        parsedArgs.clipboard = true;
        break;
      case '-d':
      case '--directory':
        parsedArgs.directory = args[++i];
        break;
      case '-o':
      case '--output-file':
        parsedArgs.outputFile = args[++i];
        break;
      case '-i':
      case '--include-files':
        parsedArgs.includeFiles = args[++i];
        break;
      case '-x':
      case '--extensions':
        parsedArgs.extensions = args[++i];
        break;
      case '-e':
      case '--exclude-dirs':
        parsedArgs.excludeDirs = args[++i];
        break;
      case '-X':
      case '--exclude-extensions':
        parsedArgs.excludeExtensions = args[++i];
        break;
    }
  }

  return parsedArgs;
}

function copyToClipboard(content) {
  try {
    if (process.platform === 'darwin') {
      execSync('pbcopy', { input: content, encoding: 'utf8' });
      return true;
    } else if (process.platform === 'win32') {
      execSync('clip', { input: content, encoding: 'utf16le' });
      return true;
    } else {
      console.log("Clipboard copy is only supported on macOS and Windows 10+.");
      return false;
    }
  } catch (error) {
    console.log(`Error copying to clipboard: ${error}`);
    return false;
  }
}

function main() {
  const args = parseArguments();

  if (args.outputFile) {
    fullCodeFileName = args.outputFile;
  }

  if (args.includeFiles) {
    filesToInclude = new Set(args.includeFiles.split(',').map(f => f.trim()).filter(f => f));
  }

  if (args.extensions) {
    const extensions = args.extensions.split(',').map(ext => ext.trim()).filter(ext => ext);
    workOnExtentions.clear();
    extensions.forEach(ext => workOnExtentions.add(ext));
  }

  if (args.excludeDirs) {
    const excludeDirs = args.excludeDirs.split(',').map(d => d.trim()).filter(d => d);
    ignoreDirectories.clear();
    excludeDirs.forEach(dir => ignoreDirectories.add(dir));
  }

  if (args.excludeExtensions) {
    exclude = new Set(args.excludeExtensions.split(',').map(ext => ext.trim()).filter(ext => ext));
  }

  console.log(`Excluding extensions: ${Array.from(exclude).join(', ')}`);

  const startPath = args.directory;

  if (!fs.existsSync(startPath) || !fs.statSync(startPath).isDirectory()) {
    console.log(`Error: The specified directory '${startPath}' does not exist or is not a directory.`);
    process.exit(1);
  }

  const directoryTree = generateDirectoryTree(startPath);
  let aggregatedContent = "Directory Tree:\n" + directoryTree + "\n\n";

  function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (ignoreDirectories.has(item)) {
            continue;
          }

          const relPath = path.relative(startPath, fullPath);
          if (shouldExclude(relPath)) {
            continue;
          }

          processDirectory(fullPath);
        } else {
          const ext = path.extname(item).toLowerCase();

          if (exclude.has(ext)) {
            continue;
          }

          if (!isProgrammingFile(item)) {
            continue;
          }

          const relFilePath = path.relative(startPath, fullPath);

          if (shouldExclude(relFilePath) || !shouldIncludeFile(fullPath)) {
            continue;
          }

          const header = `\n\n# ======================\n# File: ${relFilePath}\n# ======================\n\n`;
          aggregatedContent += header;

          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            aggregatedContent += content;
          } catch (error) {
            const errorMsg = `\n# Error reading file ${relFilePath}: ${error}\n`;
            aggregatedContent += errorMsg;
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  processDirectory(startPath);

  if (args.clipboard) {
    const success = copyToClipboard(aggregatedContent);
    if (success) {
      console.log("Aggregated content has been copied to the clipboard successfully.");
    } else {
      console.log("Failed to copy aggregated content to the clipboard.");
      process.exit(1);
    }
  } else {
    try {
      fs.writeFileSync(fullCodeFileName, aggregatedContent, 'utf8');
      console.log(`Full code file '${fullCodeFileName}' has been created successfully.`);
    } catch (error) {
      console.log(`Error writing to file '${fullCodeFileName}': ${error}`);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateDirectoryTree,
  isProgrammingFile,
  shouldExclude,
  shouldIncludeFile,
  parseArguments,
  copyToClipboard,
  main
};
