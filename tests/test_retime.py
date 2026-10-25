import unittest

from barevideo.retime import retime_transcript


class RetimeTests(unittest.TestCase):
    def test_maps_source_to_edit_time(self):
        transcript={
            "provider":"x","model":"m","language":"en","duration":5,"text":"a b","segments":[],
            "words":[
                {"text":"a","start":1.0,"end":1.5,"confidence":None,"speaker":None},
                {"text":"b","start":3.0,"end":3.4,"confidence":None,"speaker":None},
            ],
        }
        out=retime_transcript(transcript,[{"start":.9,"end":1.6},{"start":2.9,"end":3.5}])
        self.assertAlmostEqual(out["words"][0]["start"],.1,places=3)
        self.assertAlmostEqual(out["words"][1]["start"],.8,places=3)
