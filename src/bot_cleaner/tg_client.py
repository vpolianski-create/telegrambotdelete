"""Обёртка над Telethon: вход в аккаунт и работа со списком ботов.

Вся сетевая логика собрана здесь и отделена от GUI, чтобы её можно было
тестировать и переиспользовать независимо от интерфейса.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Callable, Iterable, List, Optional

from telethon import TelegramClient, functions
from telethon.errors import FloodWaitError, SessionPasswordNeededError
from telethon.tl.custom.dialog import Dialog


@dataclass
class BotInfo:
    id: int
    username: Optional[str]
    display_name: str
    last_message_date: Optional[str]
    unread_count: int

    @property
    def label(self) -> str:
        handle = f"@{self.username}" if self.username else f"id{self.id}"
        return f"{self.display_name} ({handle})"


def dialogs_to_bots(dialogs: Iterable[Dialog]) -> List[BotInfo]:
    """Чистая функция: отбирает из диалогов только чаты с ботами.

    Вынесена отдельно от сетевого кода, чтобы покрывать её тестами,
    подставляя поддельные объекты диалогов без реального подключения к Telegram.
    """
    bots: List[BotInfo] = []
    for dialog in dialogs:
        entity = getattr(dialog, "entity", None)
        if entity is None or not getattr(entity, "bot", False):
            continue
        name = getattr(entity, "first_name", None) or getattr(entity, "title", None) or "Bot"
        date = dialog.date.isoformat() if getattr(dialog, "date", None) else None
        bots.append(
            BotInfo(
                id=entity.id,
                username=getattr(entity, "username", None),
                display_name=name,
                last_message_date=date,
                unread_count=getattr(dialog, "unread_count", 0) or 0,
            )
        )
    bots.sort(key=lambda b: b.display_name.lower())
    return bots


class PasswordRequiredError(Exception):
    """Аккаунт защищён двухфакторным паролем — нужно запросить его у пользователя."""


class BotCleanerService:
    def __init__(self, api_id: int, api_hash: str, session_path: str) -> None:
        self.client = TelegramClient(session_path, api_id, api_hash)
        self._phone: Optional[str] = None
        self._phone_code_hash: Optional[str] = None

    async def connect(self) -> None:
        await self.client.connect()

    async def is_authorized(self) -> bool:
        return await self.client.is_user_authorized()

    async def send_code(self, phone: str) -> None:
        self._phone = phone
        result = await self.client.send_code_request(phone)
        self._phone_code_hash = result.phone_code_hash

    async def sign_in_with_code(self, code: str) -> None:
        if not self._phone or not self._phone_code_hash:
            raise RuntimeError("Сначала нужно вызвать send_code().")
        try:
            await self.client.sign_in(
                phone=self._phone, code=code, phone_code_hash=self._phone_code_hash
            )
        except SessionPasswordNeededError as exc:
            raise PasswordRequiredError() from exc

    async def sign_in_with_password(self, password: str) -> None:
        await self.client.sign_in(password=password)

    async def get_me_label(self) -> str:
        me = await self.client.get_me()
        name = " ".join(filter(None, [me.first_name, me.last_name])) or "Без имени"
        handle = f"@{me.username}" if me.username else str(me.id)
        return f"{name} ({handle})"

    async def list_bots(self) -> List[BotInfo]:
        dialogs = await self.client.get_dialogs()
        return dialogs_to_bots(dialogs)

    async def remove_bot(self, bot_id: int, block: bool, delete_chat: bool) -> None:
        entity = await self.client.get_entity(bot_id)
        if block:
            await self.client(functions.contacts.BlockRequest(id=entity))
        if delete_chat:
            await self.client.delete_dialog(entity)

    async def remove_bots(
        self,
        bots: Iterable[BotInfo],
        block: bool,
        delete_chat: bool,
        on_progress: Optional[Callable[[BotInfo, Optional[BaseException]], None]] = None,
    ) -> None:
        """Последовательно удаляет ботов из списка с мягкими паузами между запросами.

        Ошибка на одном боте не прерывает обработку остальных — вызывающий
        код узнаёт о ней через on_progress и решает, что показать пользователю.
        """
        for bot in bots:
            error: Optional[BaseException] = None
            try:
                await self.remove_bot(bot.id, block=block, delete_chat=delete_chat)
            except FloodWaitError as exc:
                await asyncio.sleep(exc.seconds)
                try:
                    await self.remove_bot(bot.id, block=block, delete_chat=delete_chat)
                except BaseException as exc2:  # noqa: BLE001
                    error = exc2
            except BaseException as exc:  # noqa: BLE001
                error = exc

            if on_progress is not None:
                on_progress(bot, error)

            await asyncio.sleep(0.3)

    async def disconnect(self) -> None:
        await self.client.disconnect()
