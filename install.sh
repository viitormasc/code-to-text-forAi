#!/bin/bash

set -e

echo "🚀 Installing codeToText command..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

SCRIPT_URL="https://raw.githubusercontent.com/viitormasc/code-to-text-forAi/main/codeToText.js"
SCRIPT_DIR="$HOME/.scripts"
SCRIPT_PATH="$SCRIPT_DIR/codeToText"

mkdir -p "$SCRIPT_DIR"

echo "📥 Downloading codeToText script..."
if command -v curl &> /dev/null; then
    curl -fsSL "$SCRIPT_URL" -o "$SCRIPT_PATH"
elif command -v wget &> /dev/null; then
    wget -q "$SCRIPT_URL" -O "$SCRIPT_PATH"
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

chmod +x "$SCRIPT_PATH"

add_to_shell() {
    local shell_rc="$1"
    local export_line='export PATH="$HOME/.scripts:$PATH"'
    
    if [ -f "$shell_rc" ]; then
        if ! grep -q "$export_line" "$shell_rc"; then
            echo "$export_line" >> "$shell_rc"
            echo "✅ Added to $shell_rc"
        else
            echo "ℹ️  Already in $shell_rc"
        fi
    fi
}

if [ -n "$BASH_VERSION" ]; then
    add_to_shell ~/.bashrc
    [ -f ~/.bash_profile ] && add_to_shell ~/.bash_profile
fi

if [ -n "$ZSH_VERSION" ]; then
    add_to_shell ~/.zshrc
fi

echo "🔁 Reloading shell configuration..."
if [ -n "$ZSH_VERSION" ]; then
    source ~/.zshrc 2>/dev/null || true
else
    source ~/.bashrc 2>/dev/null || true
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Usage:"
echo "  codeToText                          # Create full code file in current directory"
echo "  codeToText --clipboard              # Copy to clipboard instead of file"
echo "  codeToText --directory /path/to/project"
echo "  codeToText --include-files \"src/index.js,src/utils.js\""
echo "  codeToText --exclude-dirs \"node_modules,dist\""
echo ""
