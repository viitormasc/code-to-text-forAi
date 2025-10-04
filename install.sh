#!/bin/bash

set -e

echo "🚀 Installing codeToText command..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

SCRIPT_URL="https://raw.githubusercontent.com/viitormasc/code-to-text-forAi/main/codeToText.js"
SCRIPT_DIR="$HOME/.local/bin"
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

# Add to PATH for all major shells
add_to_shell() {
    local shell_rc="$1"
    local export_line="$2"
    
    if [ -f "$shell_rc" ]; then
        if ! grep -q "$export_line" "$shell_rc"; then
            echo "$export_line" >> "$shell_rc"
            echo "✅ Added to $shell_rc"
        else
            echo "ℹ️  Already in $shell_rc"
        fi
    fi
}

# Define PATH additions for different shells
LOCAL_BIN_PATH='export PATH="$HOME/.local/bin:$PATH"'

# Update all common shell configuration files
echo "🔧 Configuring shell support..."

# bash
add_to_shell ~/.bashrc "$LOCAL_BIN_PATH"
add_to_shell ~/.bash_profile "$LOCAL_BIN_PATH"
add_to_shell ~/.profile "$LOCAL_BIN_PATH"

# zsh
add_to_shell ~/.zshrc "$LOCAL_BIN_PATH"
add_to_shell ~/.zshenv "$LOCAL_BIN_PATH"
add_to_shell ~/.zprofile "$LOCAL_BIN_PATH"

# fish
if command -v fish &> /dev/null; then
    FISH_CONFIG_DIR="$HOME/.config/fish"
    mkdir -p "$FISH_CONFIG_DIR"
    FISH_PATH="set -gx PATH \$HOME/.local/bin \$PATH"
    add_to_shell "$FISH_CONFIG_DIR/config.fish" "$FISH_PATH"
fi

# tcsh/csh
add_to_shell ~/.tcshrc "setenv PATH ~/.local/bin:\$PATH"
add_to_shell ~/.cshrc "setenv PATH ~/.local/bin:\$PATH"

# ksh
add_to_shell ~/.kshrc "export PATH=\"\$HOME/.local/bin:\$PATH\""
add_to_shell ~/.profile "$LOCAL_BIN_PATH"  # ksh also uses .profile

# Create a universal script that works everywhere
UNIVERSAL_SCRIPT="$HOME/.local/bin/codeToText-universal"
cat > "$UNIVERSAL_SCRIPT" << 'EOF'
#!/bin/sh
exec node "$HOME/.local/bin/codeToText" "$@"
EOF
chmod +x "$UNIVERSAL_SCRIPT"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Available commands:"
echo "   codeToText           # Primary command"
echo "   codeToText-universal # Fallback command"
echo ""
echo "🔄 Please restart your terminal or run one of these commands to reload:"
echo "   source ~/.bashrc     # for bash"
echo "   source ~/.zshrc      # for zsh"
echo "   exec \$SHELL         # for current shell"
echo ""
echo "📖 Usage examples:"
echo "   codeToText                          # Create full code file in current directory"
echo "   codeToText --clipboard              # Copy to clipboard instead of file"
echo "   codeToText --directory /path/to/project"
echo "   codeToText --include-files \"src/index.js,src/utils.js\""
echo "   codeToText --exclude-dirs \"node_modules,dist\""
echo ""
echo "🔍 Test installation:"
echo "   codeToText --help"
