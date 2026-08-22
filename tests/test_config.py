import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from bot_cleaner.config import AppConfig, session_path


class AppConfigTests(unittest.TestCase):
    def test_save_and_load_roundtrip(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            config = AppConfig(api_id=12345, api_hash="abcdef0123456789")
            config.save(directory)

            loaded = AppConfig.load(directory)
            self.assertEqual(loaded, config)

    def test_load_returns_none_when_missing(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIsNone(AppConfig.load(Path(tmp)))

    def test_load_returns_none_on_corrupt_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            (directory / "config.json").write_text("not json", encoding="utf-8")
            self.assertIsNone(AppConfig.load(directory))

    def test_session_path_includes_directory(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            path = session_path(directory)
            self.assertTrue(path.startswith(str(directory)))


if __name__ == "__main__":
    unittest.main()
