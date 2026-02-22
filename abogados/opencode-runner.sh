#!/bin/bash
# opencode-runner.sh - Ejecuta prompts de opencode secuencialmente
# Uso: ./opencode-runner.sh <archivo_prompts.txt>
#
# Formato del archivo de prompts (una línea vacía separa cada prompt):
# prompt 1
#
# prompt 2
#
# prompt 3

set -e

if [ -z "$1" ]; then
    echo "Uso: $0 <archivo_prompts.txt>"
    echo ""
    echo "Ejemplo de archivo de prompts (prompts.txt):"
    echo 'hola, como estas?'
    echo ""
    echo 'dime tu nombre'
    exit 1
fi

PROMPTS_FILE="$1"

if [ ! -f "$PROMPTS_FILE" ]; then
    echo "Error: El archivo $PROMPTS_FILE no existe"
    exit 1
fi

echo "=========================================="
echo "  OpenCode Prompt Runner"
echo "=========================================="
echo "Archivo: $PROMPTS_FILE"
echo "Fecha: $(date)"
echo "=========================================="
echo ""

# Leer el archivo y dividir por bloques vacíos
# Usamos un delimitador temporal para procesar cada prompt
IFS=$'\n\n' 
prompts=($(cat "$PROMPTS_FILE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -v '^$'))

total=${#prompts[@]}
echo "Total de prompts a ejecutar: $total"
echo ""

for i in "${!prompts[@]}"; do
    index=$((i + 1))
    prompt="${prompts[$i]}"
    
    echo "----------------------------------------"
    echo "Prompt $index/$total"
    echo "----------------------------------------"
    echo "$prompt"
    echo ""
    
    # Ejecutar el prompt con opencode
    # Usamos heredoc para pasar el prompt
    echo "$prompt" | npx opencode run -
    
    echo ""
    echo "✅ Prompt $index completado"
    echo ""
done

echo "=========================================="
echo "  Todos los prompts completados"
echo "=========================================="
