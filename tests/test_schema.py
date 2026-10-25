import unittest

from barevideo.schema import make_transcript


class SchemaTests(unittest.TestCase):
    def test_normalizes_words(self):
        transcript=make_transcript(provider="x",model="m",language="en",duration=2,words=[
            {"word":"Hello","start":0,"end":.4},
            {"text":"world","start":.5,"end":1.0,"confidence":.9},
        ])
        self.assertEqual(transcript["words"][0]["text"],"Hello")
        self.assertEqual(transcript["schema_version"],"1.0")
        self.assertEqual(transcript["duration"],2.0)

    def test_rejects_reversed_words(self):
        with self.assertRaises(ValueError):
            make_transcript(provider="x",model="m",language="en",words=[
                {"text":"a","start":1,"end":2},
                {"text":"b","start":.5,"end":.8},
            ])
