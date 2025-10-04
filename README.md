CodeToText 

A powerful command-line tool that aggregates all code files in your project into a single text file with a directory tree structure. Perfect for sharing complete codebases with AI assistants, code reviews, or documentation.

https://img.shields.io/badge/license-MIT-blue.svg
https://img.shields.io/badge/Node.js-14+-green.svg
https://img.shields.io/badge/platform-Windows%2520%257C%2520macOS%2520%257C%2520Linux-lightgrey.svg
 Quick Install

One-line installation (works on Windows, macOS, and Linux):
bash

curl -fsSL https://raw.githubusercontent.com/viitormasc/code-to-text-forAi/main/install.sh | bash

Restart your terminal or run:
bash

source ~/.zshrc  # for zsh
# OR
source ~/.bashrc # for bash

 What It Does

CodeToText scans your project directory and creates a comprehensive text file containing:

    📁 Directory tree visualization

    📝 All your code files aggregated in one place

    🔗 File headers showing relative paths

    🚫 Smart exclusions of build files, dependencies, and configs

Perfect for:

    Sharing complete projects with AI coding assistants

    Code reviews and documentation

    Archiving project snapshots

    Creating training datasets

    Debugging and analysis

 Usage Examples
Basic Usage
bash

# Create a full code file of current directory
codeToText

# Output: my-project-fullcode.txt

AI Assistant Sharing
bash

# Copy entire project to clipboard for ChatGPT/GitHub Copilot
codeToText --clipboard

# Then paste directly into your AI conversation!

Selective Export
bash

# Only include specific files
codeToText --include-files "src/index.js,src/utils.js,package.json"

# Exclude test files and dependencies
codeToText --exclude-dirs "node_modules,__tests__,coverage"

# Only include certain file types
codeToText --extensions ".js,.jsx,.ts,.tsx,.py"

Project Analysis
bash

# Analyze a different project
codeToText --directory /path/to/another/project

# Custom output filename
codeToText --output-file "project-analysis.txt"

📋 Full Command Reference
Option	Short	Description
--clipboard	-c	Copy output to clipboard instead of file
--directory	-d	Specify directory to scan (default: current)
--output-file	-o	Custom output filename
--include-files	-i	Comma-separated list of specific files to include
--extensions	-x	Comma-separated list of file extensions to include
--exclude-dirs	-e	Comma-separated list of directories to exclude
--exclude-extensions	-X	Comma-separated list of file extensions to exclude
🛠 Real-World Use Cases
1. AI-Powered Debugging
bash

# Get complete context for AI debugging
codeToText --clipboard
# Then: "Hey ChatGPT, here's my complete project. I'm getting an error in utils.js line 45..."

2. Code Review Preparation
bash

# Create clean snapshot for reviewers
codeToText --exclude-dirs "node_modules,dist,coverage" --output-file "code-review.txt"

3. Project Documentation
bash

# Document current state
codeToText --extensions ".js,.jsx,.ts,.tsx,.md" --output-file "project-snapshot-$(date +%Y%m%d).txt"

4. Multi-Language Projects
bash

# Include only source files
codeToText --extensions ".py,.js,.html,.css,.sql" --exclude-dirs "venv,node_modules,__pycache__"

5. Configuration Analysis
bash

# Focus on config files
codeToText --extensions ".json,.yml,.yaml,.toml,.ini,.xml" --output-file "configs.txt"

📁 Supported File Types

CodeToText automatically recognizes and includes:

Programming Languages: .js, .jsx, .ts, .tsx, .py, .java, .c, .cpp, .html, .css, .scss, .rb, .go, .php, .rs, .swift, .kt, and 30+ more

Configuration Files: .json, .yml, .yaml, .toml, .ini, .xml

Scripts & Shell: .sh, .zsh, .ps1, .bat

Documentation: .md, .rst
🚫 Smart Exclusions

Automatically excludes common directories:

    node_modules/, .git/, venv/, .venv/

    dist/, build/, __pycache__/

    coverage/, .nyc_output/

And files:

    package-lock.json, yarn.lock

    .DS_Store, thumbs.db

    Binary files and dependencies

🎪 Example Output

Here's what the generated file looks like:
text

Directory Tree:
my-project/
│   package.json
│   README.md
├── src/
│   ├── index.js
│   ├── utils.js
│   └── components/
│       ├── Button.js
│       └── Header.js
├── tests/
│   └── test-utils.js
└── config/
    └── settings.json


# ======================
# File: src/index.js
# ======================

import React from 'react';
import { render } from 'react-dom';

function App() {
  return <h1>Hello World</h1>;
}

render(<App />, document.getElementById('root'));


# ======================
# File: src/utils.js
# ======================

export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

// ... and so on for all files

🔧 Advanced Configuration
Custom File Extensions
bash

# Only include specific file types
codeToText --extensions ".js,.jsx,.ts,.tsx,.md"

# Exclude certain extensions
codeToText --exclude-extensions ".json,.md"

Custom Directory Exclusions
bash

# Add your own exclusions
codeToText --exclude-dirs "node_modules,dist,coverage,.cache,temp"

Multiple Commands Combined
bash

# Ultimate AI-sharing command
codeToText --clipboard --exclude-dirs "node_modules,dist,coverage" --exclude-extensions ".json,.md"

❓ Troubleshooting

Command not found?
bash

# Manual PATH fix
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

Clipboard not working?

    Windows: Uses built-in clip command

    macOS: Uses pbcopy

    Linux: Install xclip or use file output

Node.js required?

    Download from nodejs.org

    Or use a Node version manager like nvm

🤝 Contributing

Found a bug? Have a feature request? Contributions are welcome!

    Fork the repository

    Create your feature branch (git checkout -b feature/amazing-feature)

    Commit your changes (git commit -m 'Add amazing feature')

    Push to the branch (git push origin feature/amazing-feature)

    Open a Pull Request

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
🏆 Pro Tips

💡 Use with AI: The structured output is perfect for AI assistants - they can understand the project layout and file relationships.

💡 Version Control: Add the output to your commit messages when making major changes for better context.

💡 Documentation: Use as a starting point for technical documentation or onboarding materials.

💡 Backup: Create project snapshots before major refactors.

Ready to streamline your code sharing? Install now and experience the power of complete project context! 🚀
bash

curl -fsSL https://raw.githubusercontent.com/viitormasc/code-to-text-forAi/main/install.sh | bash
