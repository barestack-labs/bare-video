import tempfile
import unittest
from pathlib import Path

from barevideo.hyperframes import build_project


class HyperFramesTests(unittest.TestCase):
    def test_builds_project(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            video=root/"x.mp4"
            video.write_bytes(b"fake")
            transcript={"duration":2.0,"words":[
                {"text":"hello","start":0.1,"end":.5},
                {"text":"world","start":.6,"end":1.0},
            ]}
            plan={"beats":[{"id":0,"start":0,"end":2,"text":"hello world","layout":"editorial","asset":None}]}
            out=build_project(video,transcript,plan,root/"hf",sfx_level="none")
            html=(out/"index.html").read_text()
            self.assertIn('data-composition-id="bare-video"',html)
            self.assertIn("editorial",html)
