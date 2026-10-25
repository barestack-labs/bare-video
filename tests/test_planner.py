import unittest

from barevideo.planner import choose_layout


class PlannerTests(unittest.TestCase):
    def test_semantic_layouts(self):
        self.assertEqual(choose_layout("Go to this GitHub repo"),"proof")
        self.assertEqual(choose_layout("There are three tools"),"editorial")
        self.assertEqual(choose_layout("Run this ffmpeg command"),"ui")

    def test_caption_only_style(self):
        self.assertEqual(choose_layout("Go to GitHub",style="captions"),"face")
