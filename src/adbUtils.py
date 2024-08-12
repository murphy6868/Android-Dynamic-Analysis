import subprocess, time, platform, os
from typing import List
from pathlib import Path

import logUtils, logging, config


L = logUtils.createLogger(__name__, log_level=logging.DEBUG)

def start_fridaFerver(FRIDA_SERVER_LOCATION) -> subprocess.Popen:
    L.info("Starting Frida Server...")
    adb_command = ["adb", "shell", "nohup", FRIDA_SERVER_LOCATION, "&"]
    fridaProcess = subprocess.Popen(
        adb_command, shell=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if platform.system() == 'Windows' else 0,
    )
    time.sleep(1)
    return fridaProcess

def getDeviceId() -> str: # adb devices
    process = subprocess.Popen(["adb", "devices"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    stdout_str = stdout.decode("utf-8") if stdout is not None else ""
    stderr_str = stderr.decode("utf-8") if stderr is not None else ""
    for line in stdout_str.splitlines():
        if ":" in line: # 127.0.0.1:52001 device
            deveceID = line.split()[0]
            L.debug(f"deviceID: {deveceID}")
    L.debug(f"`adb devices` stdout:\n{stdout_str}")
    L.debug(f"`adb devices` stderr:\n{stderr_str}")
    return deveceID

def get_InstalledPackageNames() -> List[str]: # adb shell pm list packages
    process = subprocess.Popen(["adb", "shell", "pm", "list", "packages"], 
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    stdout_str = stdout.decode("utf-8") if stdout is not None else ""
    stderr_str = stderr.decode("utf-8") if stderr is not None else ""
    L.debug(f"`adb shell pm list packages` stdout:\n{stdout_str}")
    L.debug(f"`adb shell pm list packages` stderr:\n{stderr_str}")
    apps = [ app[ len("package:") : ] for app in stdout_str.splitlines() ]
    return apps

def _pushFridaServer():
    L.info(f"pushing Frida Server...")
    process = subprocess.Popen(
        ["adb", "push", config.Config.FRIDA_SERVER_FILENAME, config.Config.FRIDA_SERVER_LOCATION], 
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    stdout, stderr = process.communicate()
    stdout_str = stdout.decode("utf-8") if stdout is not None else ""
    stderr_str = stderr.decode("utf-8") if stderr is not None else ""
    L.debug(f"`adb push` stdout:\n{stdout_str}")
    L.debug(f"`adb push` stderr:\n{stderr_str}")

    L.info(f"Changing file mode to make Frida server executable...")
    process = subprocess.Popen(
        ["adb", "shell", "chmod", "755", config.Config.FRIDA_SERVER_LOCATION], 
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    stdout, stderr = process.communicate()
    stdout_str = stdout.decode("utf-8") if stdout else ""
    stderr_str = stderr.decode("utf-8") if stderr else ""
    
    L.debug(f"`adb shell chmod` stdout:\n{stdout_str}")
    L.debug(f"`adb shell chmod` stderr:\n{stderr_str}")
    
def installApps(targetAPKs) -> None: # adb install /path/to/your/app.apk
    _pushFridaServer()
    installedPackages = get_InstalledPackageNames()
    for idx, apk in enumerate(targetAPKs):
        L.info(f"Installing {idx}: {apk}...")
        packageName = Path(apk).stem
        if packageName in installedPackages: continue
        process = subprocess.Popen(["adb", "install", apk], 
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        stdout_str = stdout.decode("utf-8") if stdout is not None else ""
        stderr_str = stderr.decode("utf-8") if stderr is not None else ""
        L.debug(f"`adb install` stdout:\n{stdout_str}")
        L.debug(f"`adb install` stderr:\n{stderr_str}")



def get_package_name(apk_path):
    """
    Extract the package name of an APK file using aapt tool.
    """
    try:
        result = subprocess.run(['aapt', 'dump', 'badging', apk_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
        for line in result.stdout.split('\n'):
            if line.startswith('package:'):
                package_name = line.split()[1].split('=')[1].strip("'")
                return package_name
    except Exception as e:
        print(f"Error extracting package name for {apk_path}: {e}")
        return None

def rename_files_in_directory(directory):
    """
    Rename files in the specified directory to their package names with .apk extension.
    """
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            package_name = get_package_name(file_path)
            if package_name:
                new_filename = f"{package_name}.apk"
                new_file_path = os.path.join(directory, new_filename)
                try:
                    os.rename(file_path, new_file_path)
                    print(f"Renamed {file_path} to {new_file_path}")
                except Exception as e:
                    print(f"Error renaming {file_path} to {new_file_path}: {e}")

if __name__ == "__main__":
    # directory = r'C:\Users\yun\Desktop\dynamicAnalysis\android-dynamic-analysis\APK\drebin-0'  # Update this path to your directory
    directory = r'C:\Users\yun\Desktop\dynamicAnalysis\android-dynamic-analysis\APK\drebin-1'  # Update this path to your directory
    # directory = r'C:\Users\yun\Desktop\dynamicAnalysis\android-dynamic-analysis\APK\benign2-1'  # Update this path to your directory
    rename_files_in_directory(directory)