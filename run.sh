#!/bin/bash
# ─── Medica — single command launcher ───────────────────────────────
# Usage: ./run.sh
# Compiles all Java sources and launches the application.
# Requires: Java 11+ on PATH, lib/ folder with the two JARs.
# ────────────────────────────────────────────────────────────────────

MAIN="com.medica.MedicaApp"
SRC="src/main/java"
OUT="target/classes"
CP="lib/postgresql-42.7.3.jar:lib/jbcrypt-0.4.jar"

# Check config.properties
if [ ! -f "config.properties" ]; then
    echo ""
    echo " [ERROR] config.properties not found."
    echo " Copy config.properties.example to config.properties"
    echo " and fill in your Supabase credentials."
    echo ""
    exit 1
fi

# Create output directory
mkdir -p "$OUT"

# Compile
echo "Compiling..."
find "$SRC" -name "*.java" | xargs javac -cp "$CP" -d "$OUT"

if [ $? -ne 0 ]; then
    echo " [ERROR] Compilation failed."
    exit 1
fi

# Run
echo ""
java -cp "$OUT:$CP" "$MAIN"
