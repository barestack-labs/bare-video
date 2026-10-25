#!/usr/bin/env python3
"""Bare Video machine doctor. Standard-library only."""
from __future__ import annotations
import json, os, platform, shutil, subprocess
from pathlib import Path


def version(cmd, args=("--version",)):
    path = shutil.which(cmd)
    if not path:
        return None
    try:
        p = subprocess.run([path, *args], capture_output=True, text=True, timeout=5)
        out = (p.stdout or p.stderr).strip().splitlines()
        return {"path": path, "version": out[0] if out else "detected"}
    except Exception as e:
        return {"path": path, "version": f"detected (version check failed: {e})"}


def find_browser():
    system = platform.system().lower()
    candidates = []
    if system == "windows":
        for base in [os.environ.get("PROGRAMFILES"), os.environ.get("PROGRAMFILES(X86)"), os.environ.get("LOCALAPPDATA")]:
            if base:
                candidates.append(Path(base)/"Google"/"Chrome"/"Application"/"chrome.exe")
                candidates.append(Path(base)/"Chromium"/"Application"/"chrome.exe")
    elif system == "darwin":
        candidates += [Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"), Path("/Applications/Chromium.app/Contents/MacOS/Chromium")]
    else:
        for name in ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]:
            p = shutil.which(name)
            if p: candidates.append(Path(p))
    for p in candidates:
        if p.exists(): return str(p)
    return None


def memory_gb():
    try:
        if platform.system() == "Windows":
            import ctypes
            class S(ctypes.Structure):
                _fields_=[("dwLength",ctypes.c_ulong),("dwMemoryLoad",ctypes.c_ulong),("ullTotalPhys",ctypes.c_ulonglong),("ullAvailPhys",ctypes.c_ulonglong),("ullTotalPageFile",ctypes.c_ulonglong),("ullAvailPageFile",ctypes.c_ulonglong),("ullTotalVirtual",ctypes.c_ulonglong),("ullAvailVirtual",ctypes.c_ulonglong),("sullAvailExtendedVirtual",ctypes.c_ulonglong)]
            s=S(); s.dwLength=ctypes.sizeof(S); ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(s)); return round(s.ullTotalPhys/1024**3,1)
        if platform.system() == "Darwin":
            return round(int(subprocess.check_output(["sysctl","-n","hw.memsize"]))/1024**3,1)
        meminfo=Path('/proc/meminfo').read_text(); kb=int([x for x in meminfo.splitlines() if x.startswith('MemTotal:')][0].split()[1]); return round(kb/1024**2,1)
    except Exception: return None


def main():
    root = Path(__file__).resolve().parents[1]
    usage = shutil.disk_usage(root)
    report = {
        "bare_video_root": str(root),
        "platform": platform.platform(),
        "cpu": platform.processor() or platform.machine(),
        "ram_gb": memory_gb(),
        "disk_free_gb": round(usage.free/1024**3,1),
        "python": {"path": shutil.which("python") or shutil.which("python3"), "version": platform.python_version()},
        "node": version("node"),
        "ffmpeg": version("ffmpeg", ("-version",)),
        "ffprobe": version("ffprobe", ("-version",)),
        "browser": find_browser(),
        "cloud_keys": {
            "groq": bool(os.environ.get("GROQ_API_KEY")),
            "deepgram": bool(os.environ.get("DEEPGRAM_API_KEY")),
        }
    }
    missing=[]
    if not report['node']: missing.append('Node 22+')
    if not report['ffmpeg'] or not report['ffprobe']: missing.append('FFmpeg + ffprobe')
    if not report['browser']: missing.append('Chrome/Chromium')
    report['missing_core_tools']=missing
    if report['cloud_keys']['groq']:
        report['recommended_transcription']='Groq (configured)'
    elif report['cloud_keys']['deepgram']:
        report['recommended_transcription']='Deepgram (configured)'
    else:
        report['recommended_transcription']='Offer cloud .env setup or local faster-whisper; do not download a model without permission.'
    print(json.dumps(report, indent=2))

if __name__ == '__main__': main()
