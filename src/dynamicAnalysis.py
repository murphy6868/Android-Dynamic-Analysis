import frida # https://www.jianshu.com/p/c349471bdef7 Frida详细安装教程
import time, click
from typing import List, Tuple, Optional
from pathlib import Path

import logUtils, logging, adbUtils
from fridaMessageHandler import FridaMessageLogger
from config import Config
 

L = logUtils.createLogger(__name__, log_level=logging.DEBUG)

class DynamicAnalysis:
    def __init__(self, target: str, mode: str):
        self.count = 0
        self.file = None
        self.config = Config(target, mode)

        self.targetAPKs, self.targetPackageNames = self._get_TargetAPKs_TargetPackageNames()
        self.installedPackages = adbUtils.get_InstalledPackageNames()
        self.deveceID = adbUtils.getDeviceId()
        self.device = frida.get_device_manager().get_device(self.deveceID)
        self.firdaProcess = adbUtils.start_fridaFerver(self.config.FRIDA_SERVER_LOCATION)

    def _get_TargetAPKs_TargetPackageNames(self) -> Tuple[List[str], List[str]]: 
        targetAPKs, targetPackageNames = [], []
        for apkPath in self.config.targetApksDir.glob("*.apk"):
            apkLocation = apkPath.as_posix()
            targetAPKs.append(apkLocation)
            packageName = apkPath.stem
            targetPackageNames.append(packageName)
        return targetAPKs, targetPackageNames
    
    def _runApp(self, packageName: str) -> None:
        fridaMessageLogger = FridaMessageLogger(self.config.targetModeLogsDir, packageName)
        if fridaMessageLogger.isDone:
            return
        
        pid = self.device.spawn(packageName)
        session = self.device.attach(pid)
        try:
            script = session.create_script(self.config.fridaSriptCode)
            script.on("message", fridaMessageLogger.onMessage)
            script.load()
            script.exports_sync.additional(self.config.mode)
            time.sleep(1)
            self.device.resume(pid)
            sec = 0
            while True:
                print("sec:", sec)
                sec += 1
                time.sleep(1)
                if fridaMessageLogger.isDone or sec == 31:
                    break
        finally:
            self.device.kill(pid)
            session.detach()
            time.sleep(1)
        return
    
    def installApps(self) -> None:
        adbUtils.installApps(self.targetAPKs)

    def runApps(self) -> None:
        for idx, packageName in enumerate(self.targetPackageNames): 
            L.info(f"Running {idx}: {packageName}")
            if packageName not in self.installedPackages:
                L.warning(f"{packageName} is not installed")
            else:
                self._runApp(packageName)
        return

@click.command()
@click.argument("target")
@click.option("-i", "--install", is_flag=True, help="Install TARGET APKs")
@click.option("-m", "--mode", help=f"run apps in TEXT mode. Valid modes are:                  \
                                            {', '.join(Config.VALID_RUNNING_MODES)}")
def main(target: str, install: bool, mode: Optional[str]):
    if install:
        dynamicAnalysis = DynamicAnalysis(target, Config.VALID_RUNNING_MODES[0])
        dynamicAnalysis.installApps()
    elif mode is not None:
        dynamicAnalysis = DynamicAnalysis(target, mode)
        while True:
            try: 
                dynamicAnalysis.runApps()
            except Exception as e:
                print(e)
    else:
        raise click.BadParameter("Must provide a running mode or --install flag")
    return

if __name__ == "__main__":
    main()