#!/bin/bash

# Convenience script to run the backend with Java 21 automatically
# Usage: ./run.sh [maven-command]
# Example: ./run.sh spring-boot:run
# Example: ./run.sh clean install

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Source the Java 21 setup script
source ./set-java21.sh

# Run Maven with the provided command (default to spring-boot:run)
if [ $# -eq 0 ]; then
    echo "🚀 Starting Spring Boot application..."
    mvn spring-boot:run
else
    echo "🚀 Running: mvn $@"
    mvn "$@"
fi

