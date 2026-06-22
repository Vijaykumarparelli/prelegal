#!/usr/bin/env bash
echo "==> Stopping Prelegal servers..."
pkill -f "next dev" 2>/dev/null && echo "  stopped frontend" || echo "  frontend not running"
pkill -f "tsx watch src/index.ts" 2>/dev/null && echo "  stopped backend" || echo "  backend not running"
echo "Done."
