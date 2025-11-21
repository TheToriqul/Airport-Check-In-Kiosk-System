#!/bin/bash

# Script to set JAVA_HOME to Java 21 for Maven builds
# Usage: source ./set-java21.sh
# This script ensures the Airport Kiosk project uses Java 21

JAVA_21_HOME="/opt/homebrew/opt/openjdk@21"

if [ ! -d "$JAVA_21_HOME" ]; then
    echo "❌ Error: Java 21 not found at $JAVA_21_HOME"
    echo "   Please install Java 21: brew install openjdk@21"
    return 1 2>/dev/null || exit 1
fi

export JAVA_HOME="$JAVA_21_HOME"
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ JAVA_HOME set to Java 21"
echo "   Java version: $(java -version 2>&1 | head -1)"
echo "   JAVA_HOME: $JAVA_HOME"
echo ""
echo "💡 Tip: You can now run 'mvn spring-boot:run' without issues"

