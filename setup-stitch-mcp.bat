@echo off
echo ==========================================
echo   Stitch MCP Server Setup for Copilot CLI
echo ==========================================
echo.

set CONFIG_DIR=%USERPROFILE%\.config\github-copilot
set CONFIG_FILE=%CONFIG_DIR%\mcp.json

echo Step 1: Creating config directory...
if not exist "%CONFIG_DIR%" (
    mkdir "%CONFIG_DIR%"
    echo Created: %CONFIG_DIR%
) else (
    echo Directory already exists: %CONFIG_DIR%
)

echo.
echo Step 2: Creating mcp.json config file...
echo.

(
echo {
echo   "mcpServers": {
echo     "stitch": {
echo       "command": "npx",
echo       "args": ["-y", "@anthropic/stitch-mcp"],
echo       "env": {
echo         "STITCH_API_KEY": "YOUR_NEW_API_KEY_HERE"
echo       }
echo     }
echo   }
echo }
) > "%CONFIG_FILE%"

echo Config file created at: %CONFIG_FILE%
echo.
echo ==========================================
echo   IMPORTANT: Next Steps
echo ==========================================
echo.
echo 1. Go to Stitch and REGENERATE your API key (old one was exposed)
echo 2. Edit the config file:
echo    notepad "%CONFIG_FILE%"
echo 3. Replace YOUR_NEW_API_KEY_HERE with your new API key
echo 4. Save and close notepad
echo 5. Restart Copilot CLI
echo.
echo Opening config file in notepad...
notepad "%CONFIG_FILE%"
echo.
pause
