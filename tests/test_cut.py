import unittest

from barevideo.cut import build_cut_map, propose_semantic_cuts

TRANSCRIPT={
    "provider":"x","model":"m","language":"en","duration":4.0,
    "text":"hello hello world again","segments":[],
    "words":[
        {"text":"hello","start":0.1,"end":0.4,"confidence":1,"speaker":None},
        {"text":"hello","start":0.45,"end":0.75,"confidence":1,"speaker":None},
        {"text":"world","start":1.3,"end":1.7,"confidence":1,"speaker":None},
        {"text":"again","start":2.4,"end":2.9,"confidence":1,"speaker":None},
    ],
}


class CutTests(unittest.TestCase):
    def test_repeat_candidate(self):
        candidates=propose_semantic_cuts(TRANSCRIPT)
        self.assertTrue(any(x["type"]=="repeat" and x.get("auto_apply") for x in candidates))

    def test_keep_map_is_ordered(self):
        result=build_cut_map(TRANSCRIPT,[],gap_threshold=.3,min_fragment=.2)
        self.assertGreaterEqual(len(result["keeps"]),3)
        for a,b in zip(result["keeps"],result["keeps"][1:]):
            self.assertGreaterEqual(b["start"],a["end"])
