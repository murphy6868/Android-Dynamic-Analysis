from pathlib import Path
import os


class Config:

    PROJECT_ROOT_PATH = Path(__file__).parent.parent
    FRIDA_SERVER_FILENAME = "frida-server-16.1.4-android-x86_64"
    FRIDA_SERVER_LOCATION = "/data/local/tmp/" + FRIDA_SERVER_FILENAME
    VALID_RUNNING_MODES = ["DirectTesting", "TAF=2", "TAF=3", "TAF=4", "Delay_5", "AntiTimebomb"]
    FRIDA_LOGS_PATH = PROJECT_ROOT_PATH.joinpath("fridaLogs")
    
    _FRIDA_SCRIPT_PATH = PROJECT_ROOT_PATH.joinpath("src/AntiTimeBomb.js")
    _APK_PATH = PROJECT_ROOT_PATH.joinpath("APK")

    def __init__(self, target, mode):
        self.mode = mode
        if mode not in self.VALID_RUNNING_MODES:
            raise ValueError(f"Invalid mode: {mode}. Valid mode options are {', '.join(self.VALID_RUNNING_MODES)}")
        with open(self._FRIDA_SCRIPT_PATH, "r", encoding="utf8") as f:
            self.fridaSriptCode = f.read()
        self.targetModeLogsDir = self.FRIDA_LOGS_PATH.joinpath(target).joinpath(mode)
        self.targetApksDir = self._APK_PATH.joinpath(target)
        self._setup_fridaLogsDir()

    def _setup_fridaLogsDir(self):
        try:
            os.makedirs(self.targetModeLogsDir, exist_ok=True)
        except OSError as e:
            print(f"Error creating directory for {self.mode}: {e}")
