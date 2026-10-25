import unittest

from barevideo.captions import build_captions


class CaptionTests(unittest.TestCase):
    def test_chunks(self):
        transcript={"words":[
            {"text":"this","start":0,"end":.2},
            {"text":"is","start":.25,"end":.4},
            {"text":"barevideo","start":.45,"end":.9},
            {"text":"today","start":1.6,"end":2.0},
        ]}
        captions=build_captions(transcript,max_words=3)
        self.assertEqual(len(captions),2)
        self.assertEqual(captions[0]["emphasis_index"],2)
