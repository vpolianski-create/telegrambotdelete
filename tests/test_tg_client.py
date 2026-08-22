import datetime as dt
import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import unittest

from bot_cleaner.tg_client import BotInfo, dialogs_to_bots


def make_dialog(*, is_bot, name="Bot", username=None, entity_id=1, unread=0, date=None):
    entity = SimpleNamespace(
        id=entity_id,
        bot=is_bot,
        first_name=name,
        username=username,
        title=None,
    )
    return SimpleNamespace(entity=entity, unread_count=unread, date=date)


class DialogsToBotsTests(unittest.TestCase):
    def test_filters_out_non_bot_dialogs(self) -> None:
        dialogs = [
            make_dialog(is_bot=True, name="Weather Bot", username="weatherbot", entity_id=1),
            make_dialog(is_bot=False, name="Alice", entity_id=2),
        ]
        bots = dialogs_to_bots(dialogs)
        self.assertEqual(len(bots), 1)
        self.assertEqual(bots[0].id, 1)
        self.assertEqual(bots[0].username, "weatherbot")

    def test_skips_dialogs_without_entity(self) -> None:
        dialogs = [SimpleNamespace(entity=None, unread_count=0, date=None)]
        self.assertEqual(dialogs_to_bots(dialogs), [])

    def test_sorted_by_display_name(self) -> None:
        dialogs = [
            make_dialog(is_bot=True, name="Zeta Bot", entity_id=1),
            make_dialog(is_bot=True, name="Alpha Bot", entity_id=2),
        ]
        bots = dialogs_to_bots(dialogs)
        self.assertEqual([b.display_name for b in bots], ["Alpha Bot", "Zeta Bot"])

    def test_label_uses_username_when_present(self) -> None:
        dialogs = [make_dialog(is_bot=True, name="News", username="newsbot", entity_id=5)]
        bot = dialogs_to_bots(dialogs)[0]
        self.assertEqual(bot.label, "News (@newsbot)")

    def test_label_falls_back_to_id_without_username(self) -> None:
        dialogs = [make_dialog(is_bot=True, name="Mystery", username=None, entity_id=42)]
        bot = dialogs_to_bots(dialogs)[0]
        self.assertEqual(bot.label, "Mystery (id42)")

    def test_unread_count_defaults_to_zero(self) -> None:
        dialog = make_dialog(is_bot=True, entity_id=1, unread=None)
        bot = dialogs_to_bots([dialog])[0]
        self.assertEqual(bot.unread_count, 0)

    def test_last_message_date_is_iso_string(self) -> None:
        date = dt.datetime(2026, 1, 1, tzinfo=dt.timezone.utc)
        dialog = make_dialog(is_bot=True, entity_id=1, date=date)
        bot = dialogs_to_bots([dialog])[0]
        self.assertEqual(bot.last_message_date, date.isoformat())


class BotInfoTests(unittest.TestCase):
    def test_bot_info_is_a_plain_dataclass(self) -> None:
        bot = BotInfo(id=1, username="x", display_name="X", last_message_date=None, unread_count=0)
        self.assertEqual(bot.id, 1)


if __name__ == "__main__":
    unittest.main()
