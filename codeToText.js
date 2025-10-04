const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the master file name dynamically
const currentFolder = path.basename(process.cwd());
let fullCodeFileName = `${currentFolder}-fullcode.txt`;

let filesToInclude = new Set(); // if empty, include all files
let exclude = new Set(); // User-defined extensions to exclude

// Define programming-related file extensions
const workOnExtentions = new Set([
  // General Programming Languages
  '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.vb', '.r',
  '.rb', '.go', '.php', '.swift', '.kt', '.rs', '.scala', '.pl', '.lua', '.jl',

  // Web Development
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.less', '.sass',

  // Shell & Automation
  '.sh', '.zsh', '.fish', '.ps1', '.bat', '.cmd',

  // Database & Query Languages
  '.sql', '.psql', '.db', '.sqlite',

  // Markup & Config Files
  '.xml', '.json', '.toml', '.ini', '.yml', '.yaml', '.md', '.rst',

  // Build & Make Systems
  'Makefile', '.gradle', '.cmake', '.ninja',

  // Other
  '.pqm', '.pq'
]);

// Define directories to exclude
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

// Define the name of this script to exclude it
const scriptName = path.basename(__filename);

// Define files to exclude from both aggregation and directory tree
const excludeFiles = new Set([scriptName, 'package-lock.json', 'package.json', 'temp.py']);

function generateDirectoryTree(startPath) {
  /**
   * Generates an ASCII directory tree.
   * - Excluded directories and their subdirectories are only listed by name without their internal files.
   * - The script itself is excluded from the tree.
   */

  let tree = "";

  function walkDirectory(currentPath, level = 0) {
    const items = fs.readdirSync(currentPath);
    const dirs = [];
    const files = [];

    // Separate directories and files
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
        // Skip items that can't be accessed
        continue;
      }
    }

    // Get the current directory name for display
    const currentDir = path.basename(currentPath) || currentPath;

    // Check if the current directory is excluded
    if (ignoreDirectories.has(currentDir)) {
      const indent = '│   '.repeat(level) + (level > 0 ? '├── ' : '');
      tree += `${indent}${currentDir}/ [EXCLUDED]\n`;
      return;
    }

    // Add current directory to tree
    const indent = '│   '.repeat(level) + (level > 0 ? '├── ' : '');
    tree += `${indent}${currentDir}/\n`;

    // Process directories
    for (const dir of dirs) {
      if (!ignoreDirectories.has(dir)) {
        walkDirectory(path.join(currentPath, dir), level + 1);
      } else {
        const dirIndent = '│   '.repeat(level + 1) + '├── ';
        tree += `${dirIndent}${dir}/ [EXCLUDED]\n`;
      }
    }

    // Process files
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
  /** Checks if a file has a programming-related extension and is not in the exclude list. */
  const ext = path.extname(filename).toLowerCase();
  return workOnExtentions.has(ext) && !exclude.has(ext);
}

function shouldExclude(filePath) {
  /**
   * Determines if a file should be excluded based on its path.
   * - Excludes files in ignoreDirectories and their subdirectories.
   * - Excludes files listed in excludeFiles.
   */

  const normalizedPath = path.normalize(filePath);
  const parts = normalizedPath.split(path.sep);

  // Check if any part of the path is in the ignoreDirectories
  for (let i = 0; i < parts.length - 1; i++) {
    if (ignoreDirectories.has(parts[i])) {
      return true;
    }
  }

  // Check if the file itself is in excludeFiles
  if (excludeFiles.has(parts[parts.length - 1])) {
    return true;
  }

  return false;
}

function shouldIncludeFile(filePath) {
  /**
   * Determines if a file should be included based on filesToInclude.
   * If filesToInclude is empty, include all files.
   */
  if (filesToInclude.size === 0) {
    return true; // Include all files if the set is empty
  }
  const relFilePath = path.relative(process.cwd(), filePath);
  return filesToInclude.has(relFilePath);
}

function parseArguments() {
  /**
   * Parses command-line arguments.
   */
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
  /** Copy text to the system clipboard on macOS and Windows. */
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

  // Override the global options if command line arguments are provided
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

  // Debugging console statement to verify exclusions
  console.log(`Excluding extensions: ${Array.from(exclude).join(', ')}`);

  const startPath = args.directory;

  if (!fs.existsSync(startPath) || !fs.statSync(startPath).isDirectory()) {
    console.log(`Error: The specified directory '${startPath}' does not exist or is not a directory.`);
    process.exit(1);
  }

  // Generate directory tree
  const directoryTree = generateDirectoryTree(startPath);

  let aggregatedContent = "Directory Tree:\n" + directoryTree + "\n\n";

  // Function to traverse directory and process files
  function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Check if directory should be excluded
          if (ignoreDirectories.has(item)) {
            continue; // Skip this directory
          }

          // Check if any parent directory is excluded (already handled in shouldExclude)
          const relPath = path.relative(startPath, fullPath);
          if (shouldExclude(relPath)) {
            continue;
          }

          processDirectory(fullPath);
        } else {
          // Process file
          const ext = path.extname(item).toLowerCase();

          // Skip files with excluded extensions
          if (exclude.has(ext)) {
            continue;
          }

          // Skip non-programming files
          if (!isProgrammingFile(item)) {
            continue;
          }

          // Get relative path for exclusion and headers
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
        // Skip items that can't be accessed
        continue;
      }
    }
  }

  // Start processing from the root directory
  processDirectory(startPath);

  if (args.clipboard) {
    // Copy the aggregated content to the clipboard
    const success = copyToClipboard(aggregatedContent);
    if (success) {
      console.log("Aggregated content has been copied to the clipboard successfully.");
    } else {
      console.log("Failed to copy aggregated content to the clipboard.");
      process.exit(1);
    }
  } else {
    // Write the aggregated content to the master file
    try {
      fs.writeFileSync(fullCodeFileName, aggregatedContent, 'utf8');
      console.log(`Full code file '${fullCodeFileName}' has been created successfully.`);
    } catch (error) {
      console.log(`Error writing to file '${fullCodeFileName}': ${error}`);
      process.exit(1);
    }
  }
}

// Run the main function if this script is executed directly
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
