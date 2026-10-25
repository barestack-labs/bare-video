import os
import unittest
from unittest.mock import patch

from barevideo.asr import choose_provider


class ProviderTests(unittest.TestCase):
    def test_auto_prefers_groq(self):
        with patch.dict(os.environ, {"GROQ_API_KEY":"x","DEEPGRAM_API_KEY":"y"}, clear=True):
            self.assertEqual(choose_provider("auto"), "groq")

    def test_auto_requires_consent_for_local(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(RuntimeError):
                choose_provider("auto")
