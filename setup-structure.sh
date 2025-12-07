#!/bin/bash

# Fog of War VTT - Project Structure Setup Script
# Run this script from your project root directory

echo "🎲 Setting up Fog of War VTT project structure..."

# Create directory structure
echo "📁 Creating directories..."

mkdir -p public
mkdir -p src/components/Canvas
mkdir -p src/components/Controls
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/context

# Create utility files
echo "🔧 Creating utility files..."

touch src/utils/config.js
touch src/utils/canvasHelpers.js
touch src/utils/coordinateHelpers.js

# Create hook files
echo "🪝 Creating custom hooks..."

touch src/hooks/useWebSocket.js
touch src/hooks/useCanvas.js
touch src/hooks/useTokenMovement.js
touch src/hooks/usePanZoom.js
touch src/hooks/useTokenDrag.js

# Create context files
echo "🌐 Creating context..."

touch src/context/GameStateContext.jsx

# Create component files
echo "🧩 Creating components..."

touch src/components/Canvas/GameCanvas.jsx
touch src/components/Canvas/FogCanvas.jsx
touch src/components/Canvas/Token.jsx

touch src/components/Controls/Header.jsx
touch src/components/Controls/GMControls.jsx
touch src/components/Controls/ZoomControls.jsx
touch src/components/Controls/Footer.jsx

touch src/components/App.jsx

# Create entry point
echo "🚀 Creating entry point..."

touch src/index.jsx

# Create public files
echo "📄 Creating public files..."

touch public/index.html

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
    echo "📦 Creating package.json..."
    touch package.json
fi

# Create README
if [ ! -f README.md ]; then
    echo "📖 Creating README.md..."
    touch README.md
fi

# Create .gitignore
if [ ! -f .gitignore ]; then
    echo "🚫 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Production build
dist/
build/

# Development
.DS_Store
*.log
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF
fi

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📊 File tree:"
tree -I 'node_modules' -L 3 2>/dev/null || find . -not -path '*/node_modules/*' -not -path '*/.git/*' -type f -o -type d | sed 's|[^/]*/| |g'

echo ""
echo "📝 Next steps:"
echo "1. Copy config.js content into src/utils/config.js"
echo "2. Run: npm init (if package.json is empty)"
echo "3. Install dependencies: npm install react react-dom"
echo "4. Start refactoring phase by phase!"
echo ""
echo "🎉 Happy refactoring!"
