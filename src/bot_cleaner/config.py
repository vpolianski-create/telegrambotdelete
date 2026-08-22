"""Хранение настроек приложения (api_id/api_hash) в домашней папке пользователя."""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass
from pathlib import Path


def app_data_dir() -> Path:
    """Каталог для хранения настроек и файла сессии Telethon.

    На Windows это %APPDATA%\\TelegramBotCleaner, на других ОС — ~/.telegram_bot_cleaner
    (используется только при запуске из исходников для разработки/тестов).
    """
    appdata = os.environ.get("APPDATA")
    if appdata:
        base = Path(appdata) / "TelegramBotCleaner"
    else:
        base = Path.home() / ".telegram_bot_cleaner"
    base.mkdir(parents=True, exist_ok=True)
    return base


CONFIG_FILE_NAME = "config.json"
SESSION_FILE_NAME = "user"  # Telethon добавит расширение .session


@dataclass
class AppConfig:
    api_id: int
    api_hash: str

    def save(self, directory: Path | None = None) -> None:
        directory = directory or app_data_dir()
        path = directory / CONFIG_FILE_NAME
        path.write_text(json.dumps(asdict(self), ensure_ascii=False, indent=2), encoding="utf-8")

    @classmethod
    def load(cls, directory: Path | None = None) -> "AppConfig | None":
        directory = directory or app_data_dir()
        path = directory / CONFIG_FILE_NAME
        if not path.exists():
            return None
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            return cls(api_id=int(data["api_id"]), api_hash=str(data["api_hash"]))
        except (json.JSONDecodeError, KeyError, ValueError, OSError):
            return None


def session_path(directory: Path | None = None) -> str:
    directory = directory or app_data_dir()
    return str(directory / SESSION_FILE_NAME)
