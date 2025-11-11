#!/bin/bash

# Script to set JAVA_HOME to Java 21 for Maven builds
# Usage: source ./set-java21.sh

export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ JAVA_HOME set to Java 21"
echo "   Java version: $(java -version 2>&1 | head -1)"
echo "   JAVA_HOME: $JAVA_HOME"

