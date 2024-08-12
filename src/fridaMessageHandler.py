import threading
from pathlib import Path

import logUtils, logging


L = logUtils.createLogger(__name__, log_level=logging.DEBUG)

class FridaMessageLogger:

    def __init__(self, fridaLogsDir: Path, packageName: str):

        self.logFilePath = fridaLogsDir.joinpath(f"{packageName}.txt")

        if self.logFilePath.exists():
            self.isDone = True
        else:
            self.isDone = False
            self.file = open(self.logFilePath, "w")
            self.mutex = threading.Lock()
            self.totalApiCount = 0
            self.uniqueApiSet = set()
    
    def _writeLog(self, data):
        L.debug(f"Writing Frida log:\n{data}")
        self.mutex.acquire()
        try:
            self.file.write(data)
        finally:
            self.mutex.release()

    def onMessage(self, message, data):
        if self.isDone: 
            return
        if "payload" in message:
            payload = message["payload"]
            if "!!!" in payload:
                seconds = payload.split()[1]
                payload += f" {self.totalApiCount} {len(self.uniqueApiSet)}\n"
                if seconds == "30":
                    self._writeLog(payload)
                    self.file.flush()
                    self.file.close()
                    self.isDone = True
                    return
            elif "+++" in payload or "---" in payload:
                api = payload[payload.find("=== ")+4:payload.find("\n")]
                self.totalApiCount += 1
                self.uniqueApiSet.add(api)
                L.critical(f"API: {api}")
            self._writeLog(payload)