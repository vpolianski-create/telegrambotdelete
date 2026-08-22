import sys
import threading
import time
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from bot_cleaner.async_runner import AsyncLoopThread


async def _succeed(value):
    return value


async def _fail():
    raise ValueError("boom")


class AsyncLoopThreadTests(unittest.TestCase):
    def setUp(self) -> None:
        self.runner = AsyncLoopThread()
        self.runner.start()

    def tearDown(self) -> None:
        self.runner.stop()

    def test_run_coro_returns_result_via_callback(self) -> None:
        done = threading.Event()
        captured = {}

        def on_done(result, error):
            captured["result"] = result
            captured["error"] = error
            done.set()

        self.runner.run_coro(_succeed(42), on_done=on_done)
        self.assertTrue(done.wait(timeout=2))
        self.assertEqual(captured["result"], 42)
        self.assertIsNone(captured["error"])

    def test_run_coro_propagates_exceptions(self) -> None:
        done = threading.Event()
        captured = {}

        def on_done(result, error):
            captured["error"] = error
            done.set()

        self.runner.run_coro(_fail(), on_done=on_done)
        self.assertTrue(done.wait(timeout=2))
        self.assertIsInstance(captured["error"], ValueError)

    def test_marshal_is_used_when_provided(self) -> None:
        done = threading.Event()
        marshal_thread = {}
        callback_thread = {}

        def marshal(fn):
            marshal_thread["id"] = threading.get_ident()
            fn()

        def on_done(result, error):
            callback_thread["id"] = threading.get_ident()
            done.set()

        self.runner.run_coro(_succeed(1), on_done=on_done, marshal=marshal)
        self.assertTrue(done.wait(timeout=2))
        # on_done должен выполняться внутри переданного marshal-колбэка
        # (в реальном приложении это Tk.after, гарантирующий главный поток UI).
        self.assertEqual(marshal_thread["id"], callback_thread["id"])


if __name__ == "__main__":
    unittest.main()
