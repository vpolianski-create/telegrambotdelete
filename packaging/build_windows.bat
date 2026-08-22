@echo off
REM Сборка Telegram Bot Cleaner в единый TelegramBotCleaner.exe.
REM Запускать на Windows из корня репозитория: packaging\build_windows.bat
REM Требуется установленный Python 3.10+ (python.org, с галочкой "Add to PATH").

setlocal

where python >nul 2>nul
if errorlevel 1 (
    echo Python не найден в PATH. Установите Python 3.10+ с python.org.
    exit /b 1
)

python -m venv .venv-build
call .venv-build\Scripts\activate.bat

pip install --upgrade pip
pip install -r requirements-dev.txt

pyinstaller --noconfirm packaging\TelegramBotCleaner.spec

echo.
echo Готово. Файл находится в dist\TelegramBotCleaner.exe
