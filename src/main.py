"""Точка входа приложения Telegram Bot Cleaner."""

from __future__ import annotations

import sys
from pathlib import Path

# Позволяет запускать "python main.py" напрямую из каталога src
# и находить пакет bot_cleaner как при обычном запуске, так и из exe PyInstaller.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from bot_cleaner.app import run  # noqa: E402


if __name__ == "__main__":
    run()
