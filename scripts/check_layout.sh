#!/bin/bash

# Check layout files for potential overflow issues which often break mobile scrolling.
echo "Running static analysis for layout overflow issues..."

LAYOUT_FILES=$(find . -path ./node_modules -prune -o -name "layout.tsx" -print)

if [ -z "$LAYOUT_FILES" ]; then
  echo "No layout files found yet to check."
  exit 0
fi

ISSUES=0

for file in $LAYOUT_FILES; do
  if grep -E -q "overflow(-x)?-hidden" "$file"; then
    echo "⚠️ WARNING: 'overflow-hidden' or 'overflow-x-hidden' detected in $file."
    echo "Ensure this is not applied to <html> or <body> tags, as it can break mobile scrolling behavior."
    echo "Matching lines:"
    grep -E -n --color=always "overflow(-x)?-hidden" "$file"
    ISSUES=1
  fi
done

if [ $ISSUES -eq 1 ]; then
  echo "Static analysis complete: Please review the warnings above."
  exit 1
else
  echo "✅ No obvious layout overflow issues detected."
  exit 0
fi
