#\!/bin/bash
# Session start hook - loads persistent context

echo "# Session Context"
echo ""

if [[ -f ~/Claude/MEMORY.md ]]; then
  echo "## Memory"
  cat ~/Claude/MEMORY.md
  echo ""
fi

if [[ -f ~/Claude/todos/todo.md ]]; then
  echo "## Active Todos"
  cat ~/Claude/todos/todo.md
fi
