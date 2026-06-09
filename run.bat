@echo off
title Clase IA - Galería de Trabajos
color 0A

echo ============================================
echo   Diplomatura IA - Modulo Codigo
echo   Galeria de Trabajos
echo ============================================
echo.

:: Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Node.js detectado - Iniciando servidor con npx serve...
    echo.
    npx serve . -l 3000 --no-clipboard
    goto :end
)

:: Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Python detectado - Iniciando servidor...
    echo.
    python -m http.server 3000
    goto :end
)

:: Fallback - try global npm serve
where serve >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] serve detectado - Iniciando servidor...
    echo.
    serve . -l 3000 --no-clipboard
    goto :end
)

echo [X] No se encontro Node.js ni Python.
echo     Instala Node.js desde https://nodejs.org/ o
echo     usa Python: winget install python
pause

:end
pause
