"""Фоновый asyncio event loop, работающий в отдельном потоке.

Tkinter (главный поток) может из него запускать корутины Telethon
через run_coro() и получать результат обратно в главном потоке через
переданный callback, который выполняется безопасно через root.after().
"""

from __future__ import annotations

import asyncio
import threading
from typing import Any, Callable, Coroutine


class AsyncLoopThread:
    def __init__(self) -> None:
        self._loop = asyncio.new_event_loop()
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._started = threading.Event()

    def _run_loop(self) -> None:
        asyncio.set_event_loop(self._loop)
        self._started.set()
        self._loop.run_forever()

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()
            self._started.wait()

    def run_coro(
        self,
        coro: Coroutine[Any, Any, Any],
        on_done: Callable[[Any, BaseException | None], None] | None = None,
        marshal: Callable[[Callable[[], None]], None] | None = None,
    ) -> "asyncio.Future[Any]":
        """Планирует выполнение корутины в фоновом loop.

        on_done(result, error) вызывается после завершения. Если передан
        marshal (например tk_root.after), вызов on_done переносится в
        главный поток через него — это обязательно для безопасного
        обновления виджетов Tkinter из фонового потока.
        """
        future = asyncio.run_coroutine_threadsafe(coro, self._loop)

        if on_done is not None:
            def _callback(fut: "asyncio.Future[Any]") -> None:
                try:
                    result = fut.result()
                    error = None
                except BaseException as exc:  # noqa: BLE001 - пробрасываем в UI
                    result = None
                    error = exc

                if marshal is not None:
                    marshal(lambda: on_done(result, error))
                else:
                    on_done(result, error)

            future.add_done_callback(_callback)

        return future

    def stop(self) -> None:
        self._loop.call_soon_threadsafe(self._loop.stop)
