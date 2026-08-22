"""Графический интерфейс приложения на Tkinter (входит в стандартную поставку Python)."""

from __future__ import annotations

import tkinter as tk
from tkinter import messagebox, ttk
from typing import Dict, List, Optional

from .async_runner import AsyncLoopThread
from .config import AppConfig, app_data_dir, session_path
from .tg_client import BotCleanerService, BotInfo, PasswordRequiredError

WINDOW_TITLE = "Telegram Bot Cleaner"


class App(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title(WINDOW_TITLE)
        self.geometry("720x520")
        self.minsize(560, 420)

        self.loop_thread = AsyncLoopThread()
        self.loop_thread.start()

        self.service: Optional[BotCleanerService] = None
        self.bots: List[BotInfo] = []
        self.selected_ids: set[int] = set()
        self.item_to_bot: Dict[str, BotInfo] = {}

        self.container = ttk.Frame(self)
        self.container.pack(fill="both", expand=True)

        self.protocol("WM_DELETE_WINDOW", self._on_close)

        config = AppConfig.load()
        if config is None:
            self._show_setup_screen()
        else:
            self._start_service(config)

    # ------------------------------------------------------------------ #
    # Вспомогательные методы
    # ------------------------------------------------------------------ #
    def _clear_container(self) -> None:
        for child in self.container.winfo_children():
            child.destroy()

    def _marshal(self, callback):
        self.after(0, callback)

    def _run(self, coro, on_done=None):
        return self.loop_thread.run_coro(coro, on_done=on_done, marshal=self._marshal)

    # ------------------------------------------------------------------ #
    # Экран первичной настройки (api_id / api_hash)
    # ------------------------------------------------------------------ #
    def _show_setup_screen(self) -> None:
        self._clear_container()
        frame = ttk.Frame(self.container, padding=24)
        frame.pack(fill="both", expand=True)

        ttk.Label(
            frame,
            text="Первичная настройка",
            font=("Segoe UI", 14, "bold"),
        ).pack(anchor="w")

        info = (
            "Чтобы приложение могло подключиться к вашему аккаунту Telegram, "
            "нужны api_id и api_hash — их бесплатно выдаёт официальный сайт "
            "Telegram для разработчиков.\n\n"
            "1. Откройте my.telegram.org и войдите по своему номеру телефона.\n"
            "2. Выберите 'API development tools'.\n"
            "3. Создайте приложение (любое название) и скопируйте App api_id и App api_hash.\n"
            "4. Вставьте их ниже. Эти данные хранятся только на этом компьютере."
        )
        ttk.Label(frame, text=info, wraplength=640, justify="left").pack(
            anchor="w", pady=(8, 16)
        )

        form = ttk.Frame(frame)
        form.pack(fill="x")

        ttk.Label(form, text="api_id:").grid(row=0, column=0, sticky="w", pady=4)
        api_id_var = tk.StringVar()
        ttk.Entry(form, textvariable=api_id_var, width=30).grid(row=0, column=1, pady=4)

        ttk.Label(form, text="api_hash:").grid(row=1, column=0, sticky="w", pady=4)
        api_hash_var = tk.StringVar()
        ttk.Entry(form, textvariable=api_hash_var, width=30).grid(row=1, column=1, pady=4)

        error_label = ttk.Label(frame, text="", foreground="red")
        error_label.pack(anchor="w", pady=(8, 0))

        def on_save() -> None:
            raw_id = api_id_var.get().strip()
            raw_hash = api_hash_var.get().strip()
            if not raw_id.isdigit() or not raw_hash:
                error_label.config(text="Заполните оба поля. api_id должен быть числом.")
                return
            config = AppConfig(api_id=int(raw_id), api_hash=raw_hash)
            config.save()
            self._start_service(config)

        ttk.Button(frame, text="Сохранить и продолжить", command=on_save).pack(
            anchor="w", pady=16
        )
        ttk.Label(
            frame,
            text=f"Файл настроек: {app_data_dir()}",
            foreground="gray",
        ).pack(anchor="w")

    # ------------------------------------------------------------------ #
    # Подключение к Telegram и вход
    # ------------------------------------------------------------------ #
    def _start_service(self, config: AppConfig) -> None:
        self.service = BotCleanerService(config.api_id, config.api_hash, session_path())
        self._show_status_screen("Подключение к Telegram...")
        self._run(self.service.connect(), on_done=self._after_connect)

    def _after_connect(self, _result, error) -> None:
        if error is not None:
            self._show_error_screen(f"Не удалось подключиться: {error}")
            return
        self._run(self.service.is_authorized(), on_done=self._after_check_auth)

    def _after_check_auth(self, authorized, error) -> None:
        if error is not None:
            self._show_error_screen(f"Ошибка проверки авторизации: {error}")
            return
        if authorized:
            self._show_main_screen()
        else:
            self._show_phone_screen()

    def _show_status_screen(self, text: str) -> None:
        self._clear_container()
        frame = ttk.Frame(self.container, padding=24)
        frame.pack(fill="both", expand=True)
        ttk.Label(frame, text=text, font=("Segoe UI", 12)).pack(pady=40)

    def _show_error_screen(self, text: str) -> None:
        self._clear_container()
        frame = ttk.Frame(self.container, padding=24)
        frame.pack(fill="both", expand=True)
        ttk.Label(frame, text="Произошла ошибка", font=("Segoe UI", 14, "bold")).pack(
            anchor="w"
        )
        ttk.Label(frame, text=text, wraplength=640, justify="left", foreground="red").pack(
            anchor="w", pady=12
        )

        def retry() -> None:
            config = AppConfig.load()
            if config:
                self._start_service(config)
            else:
                self._show_setup_screen()

        ttk.Button(frame, text="Повторить", command=retry).pack(anchor="w")

    def _show_phone_screen(self) -> None:
        self._clear_container()
        frame = ttk.Frame(self.container, padding=24)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text="Вход в Telegram", font=("Segoe UI", 14, "bold")).pack(
            anchor="w"
        )
        ttk.Label(
            frame,
            text="Введите номер телефона в международном формате, например +79991234567",
        ).pack(anchor="w", pady=(8, 8))

        phone_var = tk.StringVar()
        entry = ttk.Entry(frame, textvariable=phone_var, width=30)
        entry.pack(anchor="w")
        entry.focus_set()

        error_label = ttk.Label(frame, text="", foreground="red")
        error_label.pack(anchor="w", pady=(8, 0))

        button = ttk.Button(frame, text="Получить код")

        def on_submit() -> None:
            phone = phone_var.get().strip()
            if not phone:
                error_label.config(text="Введите номер телефона.")
                return
            button.config(state="disabled")
            error_label.config(text="Отправка кода...", foreground="black")
            self._run(self.service.send_code(phone), on_done=lambda r, e: after_send(e))

        def after_send(error) -> None:
            button.config(state="normal")
            if error is not None:
                error_label.config(text=f"Ошибка: {error}", foreground="red")
                return
            self._show_code_screen()

        button.config(command=on_submit)
        button.pack(anchor="w", pady=16)
        entry.bind("<Return>", lambda _e: on_submit())

    def _show_code_screen(self) -> None:
        self._clear_container()
        frame = ttk.Frame(self.container, padding=24)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text="Код подтверждения", font=("Segoe UI", 14, "bold")).pack(
            anchor="w"
        )
        ttk.Label(
            frame, text="Введите код, который Telegram прислал вам в приложение."
        ).pack(anchor="w", pady=(8, 8))

        code_var = tk.StringVar()
        entry = ttk.Entry(frame, textvariable=code_var, width=20)
        entry.pack(anchor="w")
        entry.focus_set()

        error_label = ttk.Label(frame, text="", foreground="red")
        error_label.pack(anchor="w", pady=(8, 0))

        button = ttk.Button(frame, text="Войти")

        def on_submit() -> None:
            code = code_var.get().strip()
            if not code:
                error_label.config(text="Введите код.")
                return
            button.config(state="disabled")
            error_label.config(text="Проверка кода...", foreground="black")
            self._run(self.service.sign_in_with_code(code), on_done=lambda r, e: after(e))

        def after(error) -> None:
            button.config(state="normal")
            if isinstance(error, PasswordRequiredError):
                self._show_password_screen()
                return
            if error is not None:
                error_label.config(text=f"Ошибка: {error}", foreground="red")
                return
            self._show_main_screen()

        button.config(command=on_submit)
        button.pack(anchor="w", pady=16)
        entry.bind("<Return>", lambda _e: on_submit())

    def _show_password_screen(self) -> None:
        self._clear_container()
        frame = ttk.Frame(self.container, padding=24)
        frame.pack(fill="both", expand=True)

        ttk.Label(
            frame, text="Двухфакторная аутентификация", font=("Segoe UI", 14, "bold")
        ).pack(anchor="w")
        ttk.Label(
            frame, text="На вашем аккаунте включён облачный пароль. Введите его."
        ).pack(anchor="w", pady=(8, 8))

        password_var = tk.StringVar()
        entry = ttk.Entry(frame, textvariable=password_var, width=30, show="*")
        entry.pack(anchor="w")
        entry.focus_set()

        error_label = ttk.Label(frame, text="", foreground="red")
        error_label.pack(anchor="w", pady=(8, 0))

        button = ttk.Button(frame, text="Войти")

        def on_submit() -> None:
            password = password_var.get()
            if not password:
                error_label.config(text="Введите пароль.")
                return
            button.config(state="disabled")
            error_label.config(text="Проверка пароля...", foreground="black")
            self._run(
                self.service.sign_in_with_password(password),
                on_done=lambda r, e: after(e),
            )

        def after(error) -> None:
            button.config(state="normal")
            if error is not None:
                error_label.config(text=f"Ошибка: {error}", foreground="red")
                return
            self._show_main_screen()

        button.config(command=on_submit)
        button.pack(anchor="w", pady=16)
        entry.bind("<Return>", lambda _e: on_submit())

    # ------------------------------------------------------------------ #
    # Основной экран со списком ботов
    # ------------------------------------------------------------------ #
    def _show_main_screen(self) -> None:
        self._clear_container()
        self.selected_ids = set()

        frame = ttk.Frame(self.container, padding=12)
        frame.pack(fill="both", expand=True)

        top = ttk.Frame(frame)
        top.pack(fill="x")
        self.who_label = ttk.Label(top, text="")
        self.who_label.pack(side="left")
        ttk.Button(top, text="Обновить список", command=self._refresh_bots).pack(
            side="right"
        )

        columns = ("selected", "name", "username", "unread")
        self.tree = ttk.Treeview(
            frame, columns=columns, show="headings", selectmode="none", height=14
        )
        self.tree.heading("selected", text="")
        self.tree.heading("name", text="Имя бота")
        self.tree.heading("username", text="Username")
        self.tree.heading("unread", text="Непрочитано")
        self.tree.column("selected", width=32, anchor="center", stretch=False)
        self.tree.column("name", width=260, anchor="w")
        self.tree.column("username", width=200, anchor="w")
        self.tree.column("unread", width=100, anchor="center")
        self.tree.pack(fill="both", expand=True, pady=(8, 8))
        self.tree.bind("<Button-1>", self._on_tree_click)

        selectors = ttk.Frame(frame)
        selectors.pack(fill="x")
        ttk.Button(selectors, text="Выбрать все", command=self._select_all).pack(
            side="left"
        )
        ttk.Button(selectors, text="Снять выделение", command=self._select_none).pack(
            side="left", padx=8
        )

        options = ttk.Frame(frame)
        options.pack(fill="x", pady=(8, 0))
        self.block_var = tk.BooleanVar(value=True)
        self.delete_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(
            options, text="Заблокировать бота (запретить писать вам)", variable=self.block_var
        ).pack(anchor="w")
        ttk.Checkbutton(
            options, text="Удалить чат из списка", variable=self.delete_var
        ).pack(anchor="w")

        ttk.Button(
            frame, text="Удалить выбранных ботов", command=self._on_remove_selected
        ).pack(anchor="w", pady=(10, 6))

        self.status_var = tk.StringVar(value="")
        ttk.Label(frame, textvariable=self.status_var, foreground="gray").pack(
            anchor="w"
        )

        self._run(self.service.get_me_label(), on_done=self._after_who)
        self._refresh_bots()

    def _after_who(self, label, error) -> None:
        if error is None and label:
            self.who_label.config(text=f"Вход выполнен как: {label}")

    def _refresh_bots(self) -> None:
        self.status_var.set("Загрузка списка чатов...")
        self._run(self.service.list_bots(), on_done=self._after_list_bots)

    def _after_list_bots(self, bots, error) -> None:
        if error is not None:
            self.status_var.set(f"Ошибка загрузки: {error}")
            return
        self.bots = bots or []
        self.selected_ids = set()
        self.tree.delete(*self.tree.get_children())
        self.item_to_bot = {}
        for bot in self.bots:
            item_id = self.tree.insert(
                "",
                "end",
                values=("☐", bot.display_name, f"@{bot.username}" if bot.username else "-", bot.unread_count),
            )
            self.item_to_bot[item_id] = bot
        count = len(self.bots)
        self.status_var.set(
            f"Найдено ботов: {count}" if count else "Ботов в списке чатов не найдено."
        )

    def _on_tree_click(self, event) -> None:
        region = self.tree.identify_region(event.x, event.y)
        if region != "cell":
            return
        item_id = self.tree.identify_row(event.y)
        if not item_id:
            return
        bot = self.item_to_bot.get(item_id)
        if bot is None:
            return
        if bot.id in self.selected_ids:
            self.selected_ids.discard(bot.id)
            mark = "☐"
        else:
            self.selected_ids.add(bot.id)
            mark = "☑"
        values = list(self.tree.item(item_id, "values"))
        values[0] = mark
        self.tree.item(item_id, values=values)

    def _select_all(self) -> None:
        self.selected_ids = {bot.id for bot in self.bots}
        for item_id, bot in self.item_to_bot.items():
            values = list(self.tree.item(item_id, "values"))
            values[0] = "☑"
            self.tree.item(item_id, values=values)

    def _select_none(self) -> None:
        self.selected_ids = set()
        for item_id in self.item_to_bot:
            values = list(self.tree.item(item_id, "values"))
            values[0] = "☐"
            self.tree.item(item_id, values=values)

    def _on_remove_selected(self) -> None:
        if not self.selected_ids:
            messagebox.showinfo(WINDOW_TITLE, "Сначала выберите ботов в списке.")
            return
        if not self.block_var.get() and not self.delete_var.get():
            messagebox.showinfo(
                WINDOW_TITLE, "Выберите хотя бы одно действие: блокировка или удаление чата."
            )
            return

        selected_bots = [bot for bot in self.bots if bot.id in self.selected_ids]
        names = "\n".join(f"• {bot.label}" for bot in selected_bots)
        if not messagebox.askyesno(
            WINDOW_TITLE,
            f"Удалить выбранных ботов ({len(selected_bots)})?\n\n{names}",
        ):
            return

        self.status_var.set("Удаление ботов...")

        def on_progress(bot: BotInfo, error) -> None:
            def update() -> None:
                if error is None:
                    self.status_var.set(f"Удалён: {bot.label}")
                else:
                    self.status_var.set(f"Ошибка при удалении {bot.label}: {error}")

            self.after(0, update)

        self._run(
            self.service.remove_bots(
                selected_bots,
                block=self.block_var.get(),
                delete_chat=self.delete_var.get(),
                on_progress=on_progress,
            ),
            on_done=self._after_remove,
        )

    def _after_remove(self, _result, error) -> None:
        if error is not None:
            self.status_var.set(f"Ошибка: {error}")
        else:
            self.status_var.set("Готово. Обновляю список...")
        self._refresh_bots()

    # ------------------------------------------------------------------ #
    def _on_close(self) -> None:
        if self.service is not None:
            self._run(self.service.disconnect())
        self.loop_thread.stop()
        self.destroy()


def run() -> None:
    app = App()
    app.mainloop()
