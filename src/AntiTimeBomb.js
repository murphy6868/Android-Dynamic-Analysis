var API_LEVEL = -1;
var logArguments = true;
var logReturnValue = true;

var returnValueTag = "Returning value=== ";
var cloakMethodEnterTag = "\nCloaking Method=== "

function concatArguments(argumentsPassed) {
    var result = "";
    for (var j = 0; j < argumentsPassed.length; j++) {
        result += ("arg[" + j + "]: " + argumentsPassed[j] + "\n");
    }
    return result;
}

function concatReturn(str, res) {
    var result = str;
    result += "Result is: " + res + "\n";
    return result;
}

function printReturnValue(retValue) {
    send(returnValueTag + retValue);
}

function printCloakMethodEnter(classAndMethodName) {
    send(cloakMethodEnterTag + classAndMethodName);
}

function superPrint(methodAndClassName, type, retval, isCloackedMethod, methodArgs) {
    var result = "";
    if (isCloackedMethod) {
        result += "---(Cloacked!) ";
    }
    else {
        result += "+++ ";
    }
    result += "Entering " + type + " method=== " + methodAndClassName + "\n";
    for (var i = 0; i < methodArgs.length; i++) {
        result += ("arg[" + i + "]: " + methodArgs[i] + "\n");
    }
    result += "Return value=== " + retval + "\n";
    return result;
}


function createArgumentsLikeObject(...args) {
    var argumentsLikeJavascriptObject = {
        length: arguments.length,
        splice: function () { }
    }
    for (var i = 0; i < argumentsLikeJavascriptObject.length; i++) {
        argumentsLikeJavascriptObject[i] = arguments[i];
    }
    return argumentsLikeJavascriptObject;
}

/*****************************************************************************/
///////                   Defining Variables                     //////////////
/*****************************************************************************/
var dangerousJavaAPIs = [
    "android.accounts.AccountAuthenticatorActivity.clearWallpaper",
    "android.accounts.AccountAuthenticatorActivity.removeStickyBroadcast",
    "android.accounts.AccountAuthenticatorActivity.removeStickyBroadcastAsUser",
    "android.accounts.AccountAuthenticatorActivity.setWallpaper",
    "android.accounts.AccountAuthenticatorActivity.stopService",
    "android.accounts.AccountAuthenticatorActivity.unbindService",
    "android.app.Activity.clearWallpaper",
    "android.app.Activity.removeStickyBroadcast",
    "android.app.Activity.removeStickyBroadcastAsUser",
    "android.app.Activity.setWallpaper",
    "android.app.Activity.stopLockTask",
    "android.app.Activity.stopService",
    "android.app.Activity.unbindService",
    "android.app.ActivityGroup.clearWallpaper",
    "android.app.ActivityGroup.removeStickyBroadcast",
    "android.app.ActivityGroup.removeStickyBroadcastAsUser",
    "android.app.ActivityGroup.setWallpaper",
    "android.app.ActivityGroup.stopService",
    "android.app.ActivityGroup.unbindService",
    "android.app.ActivityManager.getRecentTasks",
    "android.app.ActivityManager.getRunningAppProcesses",
    "android.app.ActivityManager.getRunningTasks",
    "android.app.ActivityManager.killBackgroundProcesses",
    "android.app.ActivityManager.moveTaskToFront",
    "android.app.ActivityManager.restartPackage",
    "android.app.admin.DevicePolicyManager.getWifiMacAddress",
    "android.app.AliasActivity.clearWallpaper",
    "android.app.AliasActivity.removeStickyBroadcast",
    "android.app.AliasActivity.removeStickyBroadcastAsUser",
    "android.app.AliasActivity.setWallpaper",
    "android.app.AliasActivity.stopService",
    "android.app.AliasActivity.unbindService",
    "android.app.Application.clearWallpaper",
    "android.app.Application.removeStickyBroadcast",
    "android.app.Application.removeStickyBroadcastAsUser",
    "android.app.Application.setWallpaper",
    "android.app.Application.stopService",
    "android.app.Application.unbindService",
    "android.app.backup.BackupAgentHelper.clearWallpaper",
    "android.app.backup.BackupAgentHelper.removeStickyBroadcast",
    "android.app.backup.BackupAgentHelper.removeStickyBroadcastAsUser",
    "android.app.backup.BackupAgentHelper.setWallpaper",
    "android.app.backup.BackupAgentHelper.stopService",
    "android.app.backup.BackupAgentHelper.unbindService",
    "android.app.backup.BackupManager.dataChanged",
    "android.app.ExpandableListActivity.clearWallpaper",
    "android.app.ExpandableListActivity.removeStickyBroadcast",
    "android.app.ExpandableListActivity.removeStickyBroadcastAsUser",
    "android.app.ExpandableListActivity.setWallpaper",
    "android.app.ExpandableListActivity.stopService",
    "android.app.ExpandableListActivity.unbindService",
    "android.app.JobSchedulerImpl.schedule",
    "android.app.KeyguardManager$KeyguardLock.disableKeyguard",
    "android.app.KeyguardManager$KeyguardLock.reenableKeyguard",
    "android.app.KeyguardManager.exitKeyguardSecurely",
    "android.app.ListActivity.clearWallpaper",
    "android.app.ListActivity.removeStickyBroadcast",
    "android.app.ListActivity.removeStickyBroadcastAsUser",
    "android.app.ListActivity.setWallpaper",
    "android.app.ListActivity.stopService",
    "android.app.ListActivity.unbindService",
    "android.app.NativeActivity.clearWallpaper",
    "android.app.NativeActivity.removeStickyBroadcast",
    "android.app.NativeActivity.removeStickyBroadcastAsUser",
    "android.app.NativeActivity.setWallpaper",
    "android.app.NativeActivity.stopService",
    "android.app.NativeActivity.unbindService",
    "android.app.Service.stopSelf",
    "android.app.Service.stopSelfResult",
    "android.app.TabActivity.clearWallpaper",
    "android.app.TabActivity.removeStickyBroadcast",
    "android.app.TabActivity.removeStickyBroadcastAsUser",
    "android.app.TabActivity.setWallpaper",
    "android.app.TabActivity.stopService",
    "android.app.TabActivity.unbindService",
    "android.app.WallpaperManager.clear",
    "android.app.WallpaperManager.setBitmap",
    "android.app.WallpaperManager.setResource",
    "android.app.WallpaperManager.setStream",
    "android.app.WallpaperManager.suggestDesiredDimensions",
    "android.bluetooth.BluetoothA2dp.getConnectedDevices",
    "android.bluetooth.BluetoothA2dp.getConnectionState",
    "android.bluetooth.BluetoothA2dp.getDevicesMatchingConnectionStates",
    "android.bluetooth.BluetoothA2dp.isA2dpPlaying",
    "android.bluetooth.BluetoothAdapter.cancelDiscovery",
    "android.bluetooth.BluetoothAdapter.closeProfileProxy",
    "android.bluetooth.BluetoothAdapter.disable",
    "android.bluetooth.BluetoothAdapter.enable",
    "android.bluetooth.BluetoothAdapter.getAddress",
    "android.bluetooth.BluetoothAdapter.getBluetoothLeAdvertiser",
    "android.bluetooth.BluetoothAdapter.getBluetoothLeScanner",
    "android.bluetooth.BluetoothAdapter.getBondedDevices",
    "android.bluetooth.BluetoothAdapter.getName",
    "android.bluetooth.BluetoothAdapter.getProfileConnectionState",
    "android.bluetooth.BluetoothAdapter.getProfileProxy",
    "android.bluetooth.BluetoothAdapter.getScanMode",
    "android.bluetooth.BluetoothAdapter.getState",
    "android.bluetooth.BluetoothAdapter.isDiscovering",
    "android.bluetooth.BluetoothAdapter.isEnabled",
    "android.bluetooth.BluetoothAdapter.isMultipleAdvertisementSupported",
    "android.bluetooth.BluetoothAdapter.isOffloadedFilteringSupported",
    "android.bluetooth.BluetoothAdapter.isOffloadedScanBatchingSupported",
    "android.bluetooth.BluetoothAdapter.listenUsingInsecureRfcommWithServiceRecord",
    "android.bluetooth.BluetoothAdapter.listenUsingRfcommWithServiceRecord",
    "android.bluetooth.BluetoothAdapter.setName",
    "android.bluetooth.BluetoothAdapter.startDiscovery",
    "android.bluetooth.BluetoothAdapter.startLeScan",
    "android.bluetooth.BluetoothAdapter.stopLeScan",
    "android.bluetooth.BluetoothDevice.connectGatt",
    "android.bluetooth.BluetoothDevice.createBond",
    "android.bluetooth.BluetoothDevice.createInsecureRfcommSocketToServiceRecord",
    "android.bluetooth.BluetoothDevice.createRfcommSocketToServiceRecord",
    "android.bluetooth.BluetoothDevice.fetchUuidsWithSdp",
    "android.bluetooth.BluetoothDevice.getBluetoothClass",
    "android.bluetooth.BluetoothDevice.getBondState",
    "android.bluetooth.BluetoothDevice.getName",
    "android.bluetooth.BluetoothDevice.getType",
    "android.bluetooth.BluetoothDevice.getUuids",
    "android.bluetooth.BluetoothDevice.setPin",
    "android.bluetooth.BluetoothGatt.abortReliableWrite",
    "android.bluetooth.BluetoothGatt.beginReliableWrite",
    "android.bluetooth.BluetoothGatt.close",
    "android.bluetooth.BluetoothGatt.connect",
    "android.bluetooth.BluetoothGatt.disconnect",
    "android.bluetooth.BluetoothGatt.discoverServices",
    "android.bluetooth.BluetoothGatt.executeReliableWrite",
    "android.bluetooth.BluetoothGatt.readCharacteristic",
    "android.bluetooth.BluetoothGatt.readDescriptor",
    "android.bluetooth.BluetoothGatt.readRemoteRssi",
    "android.bluetooth.BluetoothGatt.requestConnectionPriority",
    "android.bluetooth.BluetoothGatt.requestMtu",
    "android.bluetooth.BluetoothGatt.setCharacteristicNotification",
    "android.bluetooth.BluetoothGatt.writeCharacteristic",
    "android.bluetooth.BluetoothGatt.writeDescriptor",
    "android.bluetooth.BluetoothGattServer.addService",
    "android.bluetooth.BluetoothGattServer.cancelConnection",
    "android.bluetooth.BluetoothGattServer.clearServices",
    "android.bluetooth.BluetoothGattServer.close",
    "android.bluetooth.BluetoothGattServer.connect",
    "android.bluetooth.BluetoothGattServer.notifyCharacteristicChanged",
    "android.bluetooth.BluetoothGattServer.removeService",
    "android.bluetooth.BluetoothGattServer.sendResponse",
    "android.bluetooth.BluetoothHeadset.getConnectedDevices",
    "android.bluetooth.BluetoothHeadset.getConnectionState",
    "android.bluetooth.BluetoothHeadset.getDevicesMatchingConnectionStates",
    "android.bluetooth.BluetoothHeadset.isAudioConnected",
    "android.bluetooth.BluetoothHeadset.sendVendorSpecificResultCode",
    "android.bluetooth.BluetoothHeadset.startVoiceRecognition",
    "android.bluetooth.BluetoothHeadset.stopVoiceRecognition",
    "android.bluetooth.BluetoothHealth.connectChannelToSource",
    "android.bluetooth.BluetoothHealth.disconnectChannel",
    "android.bluetooth.BluetoothHealth.getConnectedDevices",
    "android.bluetooth.BluetoothHealth.getConnectionState",
    "android.bluetooth.BluetoothHealth.getDevicesMatchingConnectionStates",
    "android.bluetooth.BluetoothHealth.getMainChannelFd",
    "android.bluetooth.BluetoothHealth.registerSinkAppConfiguration",
    "android.bluetooth.BluetoothHealth.unregisterAppConfiguration",
    "android.bluetooth.BluetoothManager.getConnectedDevices",
    "android.bluetooth.BluetoothManager.getConnectionState",
    "android.bluetooth.BluetoothManager.getDevicesMatchingConnectionStates",
    "android.bluetooth.BluetoothManager.openGattServer",
    "android.bluetooth.BluetoothSocket.connect",
    "android.bluetooth.le.BluetoothLeAdvertiser.startAdvertising",
    "android.bluetooth.le.BluetoothLeAdvertiser.stopAdvertising",
    "android.bluetooth.le.BluetoothLeScanner.flushPendingScanResults",
    "android.bluetooth.le.BluetoothLeScanner.startScan",
    "android.bluetooth.le.BluetoothLeScanner.stopScan",
    "android.content.ContextWrapper.clearWallpaper",
    "android.content.ContextWrapper.removeStickyBroadcast",
    "android.content.ContextWrapper.removeStickyBroadcastAsUser",
    "android.content.ContextWrapper.setWallpaper",
    "android.content.ContextWrapper.stopService",
    "android.content.ContextWrapper.unbindService",
    "android.content.MutableContextWrapper.clearWallpaper",
    "android.content.MutableContextWrapper.removeStickyBroadcast",
    "android.content.MutableContextWrapper.removeStickyBroadcastAsUser",
    "android.content.MutableContextWrapper.setWallpaper",
    "android.content.MutableContextWrapper.stopService",
    "android.content.MutableContextWrapper.unbindService",
    "android.hardware.ConsumerIrManager.getCarrierFrequencies",
    "android.hardware.ConsumerIrManager.transmit",
    "android.hardware.fingerprint.FingerprintManager.authenticate",
    "android.hardware.fingerprint.FingerprintManager.hasEnrolledFingerprints",
    "android.hardware.fingerprint.FingerprintManager.isHardwareDetected",
    "android.inputmethodservice.InputMethodService.clearWallpaper",
    "android.inputmethodservice.InputMethodService.removeStickyBroadcast",
    "android.inputmethodservice.InputMethodService.removeStickyBroadcastAsUser",
    "android.inputmethodservice.InputMethodService.setWallpaper",
    "android.inputmethodservice.InputMethodService.stopService",
    "android.inputmethodservice.InputMethodService.unbindService",
    "android.location.LocationManager.addGpsStatusListener",
    "android.location.LocationManager.addNmeaListener",
    "android.location.LocationManager.addProximityAlert",
    "android.location.LocationManager.getBestProvider",
    "android.location.LocationManager.getLastKnownLocation",
    "android.location.LocationManager.getProvider",
    "android.location.LocationManager.getProviders",
    "android.location.LocationManager.registerGnssStatusCallback",
    "android.location.LocationManager.removeUpdates",
    "android.location.LocationManager.requestLocationUpdates",
    "android.location.LocationManager.requestSingleUpdate",
    "android.location.LocationManager.sendExtraCommand",
    "android.media.AsyncPlayer.play",
    "android.media.AsyncPlayer.stop",
    "android.media.AudioManager.adjustStreamVolume",
    "android.media.AudioManager.setBluetoothScoOn",
    "android.media.AudioManager.setMicrophoneMute",
    "android.media.AudioManager.setMode",
    "android.media.AudioManager.setSpeakerphoneOn",
    "android.media.AudioManager.setStreamMute",
    "android.media.AudioManager.setStreamVolume",
    "android.media.AudioManager.startBluetoothSco",
    "android.media.AudioManager.stopBluetoothSco",
    "android.media.browse.MediaBrowser.disconnect",
    "android.media.MediaPlayer.pause",
    "android.media.MediaPlayer.release",
    "android.media.MediaPlayer.reset",
    "android.media.MediaPlayer.setWakeMode",
    "android.media.MediaPlayer.start",
    "android.media.MediaPlayer.stop",
    "android.media.MediaRouter$RouteGroup.requestSetVolume",
    "android.media.MediaRouter$RouteGroup.requestUpdateVolume",
    "android.media.MediaRouter$RouteInfo.requestSetVolume",
    "android.media.MediaRouter$RouteInfo.requestUpdateVolume",
    "android.media.MediaScannerConnection.disconnect",
    "android.media.Ringtone.play",
    "android.media.Ringtone.setAudioAttributes",
    "android.media.Ringtone.setStreamType",
    "android.media.Ringtone.stop",
    "android.media.RingtoneManager.getRingtone",
    "android.media.RingtoneManager.stopPreviousRingtone",
    "android.net.ConnectivityManager.getActiveNetwork",
    "android.net.ConnectivityManager.getActiveNetworkInfo",
    "android.net.ConnectivityManager.getAllNetworkInfo",
    "android.net.ConnectivityManager.getAllNetworks",
    "android.net.ConnectivityManager.getLinkProperties",
    "android.net.ConnectivityManager.getNetworkCapabilities",
    "android.net.ConnectivityManager.getNetworkInfo",
    "android.net.ConnectivityManager.getRestrictBackgroundStatus",
    "android.net.ConnectivityManager.isActiveNetworkMetered",
    "android.net.ConnectivityManager.registerDefaultNetworkCallback",
    "android.net.ConnectivityManager.registerNetworkCallback",
    "android.net.ConnectivityManager.reportBadNetwork",
    "android.net.ConnectivityManager.reportNetworkConnectivity",
    "android.net.ConnectivityManager.requestBandwidthUpdate",
    "android.net.ConnectivityManager.requestNetwork",
    "android.net.ConnectivityManager.requestRouteToHost",
    "android.net.ConnectivityManager.startUsingNetworkFeature",
    "android.net.sip.SipAudioCall.close",
    "android.net.sip.SipAudioCall.endCall",
    "android.net.sip.SipAudioCall.setSpeakerMode",
    "android.net.sip.SipAudioCall.startAudio",
    "android.net.sip.SipManager.close",
    "android.net.sip.SipManager.createSipSession",
    "android.net.sip.SipManager.getSessionFor",
    "android.net.sip.SipManager.isOpened",
    "android.net.sip.SipManager.isRegistered",
    "android.net.sip.SipManager.makeAudioCall",
    "android.net.sip.SipManager.open",
    "android.net.sip.SipManager.register",
    "android.net.sip.SipManager.setRegistrationListener",
    "android.net.sip.SipManager.takeAudioCall",
    "android.net.sip.SipManager.unregister",
    "android.net.VpnService.clearWallpaper",
    "android.net.VpnService.onRevoke",
    "android.net.VpnService.removeStickyBroadcast",
    "android.net.VpnService.removeStickyBroadcastAsUser",
    "android.net.VpnService.setWallpaper",
    "android.net.VpnService.stopService",
    "android.net.VpnService.unbindService",
    "android.net.wifi.p2p.WifiP2pManager.initialize",
    "android.net.wifi.WifiManager$MulticastLock.acquire",
    "android.net.wifi.WifiManager$MulticastLock.release",
    "android.net.wifi.WifiManager$WifiLock.acquire",
    "android.net.wifi.WifiManager$WifiLock.release",
    "android.net.wifi.WifiManager.addNetwork",
    "android.net.wifi.WifiManager.cancelWps",
    "android.net.wifi.WifiManager.disableNetwork",
    "android.net.wifi.WifiManager.disconnect",
    "android.net.wifi.WifiManager.enableNetwork",
    "android.net.wifi.WifiManager.getConfiguredNetworks",
    "android.net.wifi.WifiManager.getConnectionInfo",
    "android.net.wifi.WifiManager.getDhcpInfo",
    "android.net.wifi.WifiManager.getScanResults",
    "android.net.wifi.WifiManager.getWifiState",
    "android.net.wifi.WifiManager.is5GHzBandSupported",
    "android.net.wifi.WifiManager.isDeviceToApRttSupported",
    "android.net.wifi.WifiManager.isEnhancedPowerReportingSupported",
    "android.net.wifi.WifiManager.isP2pSupported",
    "android.net.wifi.WifiManager.isPreferredNetworkOffloadSupported",
    "android.net.wifi.WifiManager.isScanAlwaysAvailable",
    "android.net.wifi.WifiManager.isTdlsSupported",
    "android.net.wifi.WifiManager.isWifiEnabled",
    "android.net.wifi.WifiManager.pingSupplicant",
    "android.net.wifi.WifiManager.reassociate",
    "android.net.wifi.WifiManager.reconnect",
    "android.net.wifi.WifiManager.removeNetwork",
    "android.net.wifi.WifiManager.saveConfiguration",
    "android.net.wifi.WifiManager.setWifiEnabled",
    "android.net.wifi.WifiManager.startScan",
    "android.net.wifi.WifiManager.startWps",
    "android.net.wifi.WifiManager.updateNetwork",
    "android.os.PowerManager$WakeLock.acquire",
    "android.os.PowerManager$WakeLock.release",
    "android.os.PowerManager$WakeLock.setWorkSource",
    "android.os.SystemVibrator.cancel",
    "android.os.SystemVibrator.vibrate",
    "android.security.KeyChain.getCertificateChain",
    "android.security.KeyChain.getPrivateKey",
    "android.service.dreams.DreamService.clearWallpaper",
    "android.service.dreams.DreamService.dispatchGenericMotionEvent",
    "android.service.dreams.DreamService.dispatchKeyEvent",
    "android.service.dreams.DreamService.dispatchKeyShortcutEvent",
    "android.service.dreams.DreamService.dispatchTouchEvent",
    "android.service.dreams.DreamService.dispatchTrackballEvent",
    "android.service.dreams.DreamService.finish",
    "android.service.dreams.DreamService.onWakeUp",
    "android.service.dreams.DreamService.removeStickyBroadcast",
    "android.service.dreams.DreamService.removeStickyBroadcastAsUser",
    "android.service.dreams.DreamService.setWallpaper",
    "android.service.dreams.DreamService.stopService",
    "android.service.dreams.DreamService.unbindService",
    "android.service.dreams.DreamService.wakeUp",
    "android.service.quicksettings.TileService.clearWallpaper",
    "android.service.quicksettings.TileService.removeStickyBroadcast",
    "android.service.quicksettings.TileService.removeStickyBroadcastAsUser",
    "android.service.quicksettings.TileService.setWallpaper",
    "android.service.quicksettings.TileService.stopService",
    "android.service.quicksettings.TileService.unbindService",
    "android.service.voice.VoiceInteractionService.clearWallpaper",
    "android.service.voice.VoiceInteractionService.removeStickyBroadcast",
    "android.service.voice.VoiceInteractionService.removeStickyBroadcastAsUser",
    "android.service.voice.VoiceInteractionService.setWallpaper",
    "android.service.voice.VoiceInteractionService.stopService",
    "android.service.voice.VoiceInteractionService.unbindService",
    "android.speech.SpeechRecognizer.destroy",
    "android.speech.tts.TextToSpeech.getAvailableLanguages",
    "android.speech.tts.TextToSpeech.getDefaultLanguage",
    "android.speech.tts.TextToSpeech.getDefaultVoice",
    "android.speech.tts.TextToSpeech.getFeatures",
    "android.speech.tts.TextToSpeech.getLanguage",
    "android.speech.tts.TextToSpeech.getVoice",
    "android.speech.tts.TextToSpeech.getVoices",
    "android.speech.tts.TextToSpeech.isLanguageAvailable",
    "android.speech.tts.TextToSpeech.isSpeaking",
    "android.speech.tts.TextToSpeech.playEarcon",
    "android.speech.tts.TextToSpeech.playSilence",
    "android.speech.tts.TextToSpeech.playSilentUtterance",
    "android.speech.tts.TextToSpeech.setLanguage",
    "android.speech.tts.TextToSpeech.setVoice",
    "android.speech.tts.TextToSpeech.shutdown",
    "android.speech.tts.TextToSpeech.speak",
    "android.speech.tts.TextToSpeech.stop",
    "android.speech.tts.TextToSpeech.synthesizeToFile",
    "android.telephony.gsm.SmsManager.divideMessage",
    "android.telephony.gsm.SmsManager.sendDataMessage",
    "android.telephony.gsm.SmsManager.sendMultipartTextMessage",
    "android.telephony.gsm.SmsManager.sendTextMessage",
    "android.telephony.PhoneNumberUtils.isVoiceMailNumber",
    "android.telephony.SmsManager.divideMessage",
    "android.telephony.SmsManager.downloadMultimediaMessage",
    "android.telephony.SmsManager.injectSmsPdu",
    "android.telephony.SmsManager.sendDataMessage",
    "android.telephony.SmsManager.sendMultimediaMessage",
    "android.telephony.SmsManager.sendMultipartTextMessage",
    "android.telephony.SmsManager.sendTextMessage",
    "android.telephony.TelephonyManager.getAllCellInfo",
    "android.telephony.TelephonyManager.getCellLocation",
    "android.telephony.TelephonyManager.getDeviceId",
    "android.telephony.TelephonyManager.getGroupIdLevel1",
    "android.telephony.TelephonyManager.getIccAuthentication",
    "android.telephony.TelephonyManager.getLine1Number",
    "android.telephony.TelephonyManager.getNeighboringCellInfo",
    "android.telephony.TelephonyManager.getPhoneCount",
    "android.telephony.TelephonyManager.getSimSerialNumber",
    "android.telephony.TelephonyManager.getSimState",
    "android.telephony.TelephonyManager.getSubscriberId",
    "android.telephony.TelephonyManager.getVoiceMailAlphaTag",
    "android.telephony.TelephonyManager.getVoiceMailNumber",
    "android.telephony.TelephonyManager.listen",
    "android.view.ContextThemeWrapper.clearWallpaper",
    "android.view.ContextThemeWrapper.removeStickyBroadcast",
    "android.view.ContextThemeWrapper.removeStickyBroadcastAsUser",
    "android.view.ContextThemeWrapper.setWallpaper",
    "android.view.ContextThemeWrapper.stopService",
    "android.view.ContextThemeWrapper.unbindService",
    "android.view.inputmethod.InputMethodManager.showInputMethodAndSubtypeEnabler",
    "android.widget.VideoView.getAudioSessionId",
    "android.widget.VideoView.onKeyDown",
    "android.widget.VideoView.pause",
    "android.widget.VideoView.resume",
    "android.widget.VideoView.setVideoPath",
    "android.widget.VideoView.setVideoURI",
    "android.widget.VideoView.start",
    "android.widget.VideoView.stopPlayback",
    "android.widget.VideoView.suspend",
    /*
        "android.test.IsolatedContext.clearWallpaper",
        "android.test.IsolatedContext.removeStickyBroadcast",
        "android.test.IsolatedContext.removeStickyBroadcastAsUser",
        "android.test.IsolatedContext.setWallpaper",
        "android.test.IsolatedContext.stopService",
        "android.test.IsolatedContext.unbindService",
        "android.test.mock.MockApplication.clearWallpaper",
        "android.test.mock.MockApplication.removeStickyBroadcast",
        "android.test.mock.MockApplication.removeStickyBroadcastAsUser",
        "android.test.mock.MockApplication.setWallpaper",
        "android.test.mock.MockApplication.stopService",
        "android.test.mock.MockApplication.unbindService",
        "android.test.RenamingDelegatingContext.clearWallpaper",
        "android.test.RenamingDelegatingContext.removeStickyBroadcast",
        "android.test.RenamingDelegatingContext.removeStickyBroadcastAsUser",
        "android.test.RenamingDelegatingContext.setWallpaper",
        "android.test.RenamingDelegatingContext.stopService",
        "android.test.RenamingDelegatingContext.unbindService",
    */
    //"java.io.File.$init",
    "android.telephony.TelephonyManager.getNetworkOperatorName",
    "android.telephony.TelephonyManager.getSimOperator",
    "android.telephony.TelephonyManager.getImei",
    "java.lang.Runtime.exec"
];

var dangerousNativeAPIs = ["libc.so:fopen",
    // "libc.so:__system_property_get"
];

var cloackedCommands = { "which,su": "which,s", "getprop": "which s" }

/*****************************************************************************/
///////                     Monitoring Java APIs                 //////////////
/*****************************************************************************/
// This function monitors the execution of Sensitive APIs in Android
function monitorDangerousJavaAPIs() {
    for (let i = 0; i < dangerousJavaAPIs.length; i++) {
        hookJavaAPIAndItsOverloads(dangerousJavaAPIs[i]);
    }
}

function hookJavaAPIAndItsOverloads(JavaAPIName) {
    var className = JavaAPIName.substring(0, (JavaAPIName.lastIndexOf(".")));
    var methodName = JavaAPIName.substring(JavaAPIName.lastIndexOf(".") + 1);
    var classHanle = Java.use(className);
    var methodHandle = classHanle[methodName];
    for (let i = 0; i < methodHandle.overloads.length; i++) {
        methodHandle.overloads[i].implementation = function () {
            var retval = this[methodName].apply(this, arguments);
            send(superPrint(JavaAPIName + "[" + i + "]", "Java API", retval, false, arguments));
            return retval;
        };
    }
}

/*****************************************************************************/
///////          Monitoring Invoke Calls Using Reflection        //////////////
/*****************************************************************************/
// This function monitors the execution of functions that are invoked using Java's Reflection in Android.
function monitorJavaReflectionMethodInvokes() {
    var classHanle = Java.use("java.lang.reflect.Method");
    var methodHandle = classHanle["invoke"];
    methodHandle.overloads[0].implementation = function () {
        // Entered mehtod
        var methodAndClassName = this.getDeclaringClass() + "." + this.getName();
        methodAndClassName = methodAndClassName.replace("class ", "");
        var retval = this["invoke"].apply(this, arguments);
        send(superPrint(methodAndClassName, "Java Reflection", retval, false, arguments));
        return retval;
    };
}


/*****************************************************************************/
///////                           Monitoring Native calls        //////////////
/*****************************************************************************/
// This function monitors the execution of some Native functions (fopen, etc.) on Android.
function monitorNativeDangerousMethods() {
    var libc = Module.findBaseAddress("libc.so");
    if (libc === null) {
        console.log("libc.so not found!");
        return;
    } else {
        console.log("hooking libc.so");
    }
    for (let i = 0; i < dangerousNativeAPIs.length; i++) {
        hookNativeAPIAndItsOverloads(dangerousNativeAPIs[i]);
    }
}

function hookNativeAPIAndItsOverloads(nativeAPIName) {
    var library = nativeAPIName.substring(0, nativeAPIName.lastIndexOf(":"));;
    var functionName = nativeAPIName.substring(nativeAPIName.lastIndexOf(":") + 1);
    var functionHandle = Module.findExportByName(library, functionName);
    if (functionHandle === null) {
        console.log(nativeAPIName + " not found!");
        return;
    }
    Interceptor.attach(functionHandle,
        {
            onEnter: function (args) {
                // args[0] is the filename (char *filename)
                // args[1] is the mode (char *mode)
                var filename = Memory.readCString(args[0]);
                var mode = Memory.readCString(args[1]);
                // console.log("fopen called with filename: " + filename + ", mode: " + mode);
                // Store arguments to be used in onLeave
                this.args = [filename, mode];
            },
            
            onLeave: function (retval) {
                send(superPrint(library + ":" + functionName, "Native API", retval, false, this.args));
            }
        });
}


/*****************************************************************************/
///////                    Cloaking Emulator                     //////////////
/*****************************************************************************/

function getRandom() {
    return Math.random();
}

////*************************         Debugging functions are defined here           ********************/////////////////
function show(obj) {
    for (const [key, value] of Object.entries(obj)) {
        send("\n======================================================");
        send("Key is: " + key + "\nValue is: " + value + "\n");
    }
}

function showOverloads(className, methodName) {
    Java.perform(function () { Java.use(className)[methodName].overload() });

}

function showFridaToast(text) {
    let context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();
    Java.scheduleOnMainThread(function () {
        var toast = Java.use("android.widget.Toast");
        toast.makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(), Java.use("java.lang.String").$new(text), 1).show();
    });

};

////*************************         Global Variables are defined here           ********************/////////////////

// The interval by which you would like the sensors value to be updated. The time is in milliseconds.
let sensorTriggerInterval = 500;

let android_os_SystemProperties =
{
    "qemu.hw.mainkeys": "",
    "ro.build.description": "starqltecs-user 10 QP1A.190711.020 G960WVLS7ETH1 release-keys",
    "net.eth0.dns1": "",
    "rild.libpath": "/vendor/lib64/libsec-ril.so",
    "ro.radio.use-ppp": "",
    "gsm.version.baseband": "",
    "ro.build.display.id": "QP1A.190711.020.G960WVLS7ETH1",
    "init.svc.console": "",
    "ro.product.model": "SM-G960W",
    "ro.kernel.qemu": "0",
    "ro.secure": "1",
    "ro.debuggable": "0",
    "ro.build.fingerprint": "samsung/starqltecs/starqltecs:10/QP1A.190711.020/G960WVLS7ETH1:user/release-keys",
    "ro.product.manufacturer": "Samsung Inc",
    "ro.product.brand": "Samsung",
    "ro.product.name": "SM-G960W",
    "ro.hardware": "qcom",
    "ro.product.board": "sdm845",
    "no.such.thing": "2321412255",
    "ro.build.tags": "release-keys",
    "ro.build.type": "user",
    "ro.build.user": "USER",
    "ro.build.host": "SWDH2812",
    "ro.product.cpu.abi" : "arm64-v8a"
};

// This function can be used to replace a function in the original program. 
// @className is the name of the class that contains the function (for instance, android.telephony.TelephonyManager)
// @methodName is the name of the method inside the class (for instance, getDeviceId)
// @overloadIndex is the index of the overload the you would like to manipulate. 
// @resolver is the new function that you would like to be executed upon the execution of the original function. You can pass any custom function that you like (with a custom return value) as the resolver. 
// The arguments passed to the original function will be passed to you cusom function using args.
function overideByIndex(className, methodName, overloadIndex, resolver) {
    let handle = Java.use(className);
    let methodHandle = handle[methodName].overloads[overloadIndex];
    methodHandle.implementation = function (...parameters) {
        return resolver.call(this, ...parameters);
    };
}

function overideByOverload(className, methodName, functionArgTypes, resolver) {
    let handle = Java.use(className);
    let methodHandle = handle[methodName].overload(...functionArgTypes);
    methodHandle.implementation = function (...parameters) {
        return resolver.call(this, ...parameters);
    };
}

// This function cloaks the emulator device to running applications. In this way, the application cannot detect the presence of emulator and rooted environment. 
// If you do not want to use the cloaking functionality of CamoDroid, you can comment this function in the main method.
function CloakEmulator() {
    //****************************************************************		Overriding Functions		****************************************************************//
    // Defining Override Function to use Later for Overriding cerain Functions
    overideByIndex('java.io.File', '$init', 1, function (pathString) {

        //send("java.io.File.$init[1] was called with "+ pathString);
        let map = {
            // morphues
            "/proc/misc": "/proc/sys/net/ipv4/tcp_syncookies",
            "/proc/ioports": "/proc/sys/net/ipv4/tcp_syncookies",
            "/proc/uid_stat": "/proc/sys/net/ipv4/tcp_syncookies",
            "/sys/devices/virtual/misc/cpu_dma_latency/uevent": "/proc/sys/net/ipv4/tcp_syncookies",
            "/sys/devices/virtual/ppp": "/proc/sys/net/ipv4/tcp_syncookies",
            "/sys/devices/virtual/switch": "/proc/sys/net/ipv4/tcp_syncookies",
            "/sys/module/alarm/parameters": "/proc/sys/net/ipv4/tcp_syncookies",
            "/sys/devices/system/cpu/cpu0/cpufreq": "/proc/sys/net/ipv4/tcp_syncookies",
            "/sys/devices/virtual/misc/android_adb": "/proc/sys/net/ipv4/tcp_syncookies",
            "/proc/sys/net/ipv4/tcp_syncookies": "data/NullFile"

        };
        var retval;
        if (pathString in map) {
            retval = this.$init(map[pathString]);
            superPrint("java.io.File.$init", "Java API", retval, true, pathString);
        }
        else {
            retval = this.$init(pathString);
            superPrint("java.io.File.$init", "Java API", retval, false, pathString);
        }
        //logReturnValue(retval);
        return retval;
    });

    overideByIndex('android.telephony.TelephonyManager', 'getDeviceId', 0, function () { var retval = '333650816387732'; send(superPrint('android.telephony.TelephonyManager.getDeviceId', "Java API", retval, true, [])); return retval; });
    overideByIndex('android.telephony.TelephonyManager', 'getNetworkOperatorName', 0, function () { var retval = 'TELUS INC'; send(superPrint('android.telephony.TelephonyManager.getNetworkOperatorName', "Java API", retval, true, [])); return retval; });
    overideByIndex('android.telephony.TelephonyManager', 'getSimOperator', 0, function () { var retval = 'TELUS INC'; send(superPrint('android.telephony.TelephonyManager.getSimOperator', "Java API", retval, true, [])); return retval; });
    overideByIndex('android.telephony.TelephonyManager', 'getLine1Number', 0, function () { var retval = '3334567656'; send(superPrint('android.telephony.TelephonyManager.getLine1Number', "Java API", retval, true, [])); return retval; });
    overideByIndex('android.telephony.TelephonyManager', 'getSubscriberId', 0, function () { var retval = '5424643325'; send(superPrint('android.telephony.TelephonyManager.getSubscriberId', "Java API", retval, true, [])); return retval; });
    overideByIndex('android.telephony.TelephonyManager', 'getVoiceMailNumber', 0, function () { var retval = '3334567656'; send(superPrint('android.telephony.TelephonyManager.getVoiceMailNumber', "Java API", retval, true, [])); return retval; });
    overideByIndex('android.telephony.TelephonyManager', 'getImei', 0, function () { var retval = '333650816387732'; send(superPrint('android.telephony.TelephonyManager.getImei', "Java API", retval, true, [])); return retval; });

    //console.warn("\nCloaking BuildProp..");
    Java.use("android.os.Build")['FINGERPRINT'].value = "GalaxyS9/release-keys";
    Java.use("android.os.Build")['MODEL'].value = "GalaxyS9";
    Java.use("android.os.Build")['MANUFACTURER'].value = "Samsung Inc";
    Java.use("android.os.Build")['BRAND'].value = "Samsung";
    Java.use("android.os.Build")['PRODUCT'].value = "SM-G960W";
    Java.use("android.os.Build")['HARDWARE'].value = "qcom";
    Java.use("android.os.Build")['BOARD'].value = "sdm845";
    Java.use("android.os.Build")['SERIAL'].value = "2321412255";
    Java.use("android.os.Build")['TAGS'].value = "release-keys";
    Java.use("android.os.Build")['USER'].value = "USER";
    Java.use("android.os.Build")['HOST'].value = "SWDH2812";
    Java.use("android.os.Build")['MODEL'].implementation = function () { }

    Interceptor.attach(Module.findExportByName("libc.so", "__system_property_get"),
        {
            onEnter: function (args) {
                // reading the input argument and saving it in _name variable in the same instance
                this._name = args[0].readCString();
                //send(this._name)
                // savinng the pointer to return value into _value in the same instance
                this._value = args[1];
                //send("Native function libc.so__system_property_get was called with "+ this._name);
                //send("Argument is: "+this._name);
            },
            onLeave: function (result) {
                // checking if the property is in the monitored properties
                if (this._name in android_os_SystemProperties) {
                    // geting the fake return value 
                    let fakeValue = android_os_SystemProperties[this._name];
                    // writing the fake value into the pointer to the second argument 
                    Memory.writeUtf8String(this._value, fakeValue);

                    send(superPrint("libc.so:__system_property_get", "Native API", fakeValue, true, createArgumentsLikeObject(this._name)));
                }
                else {
                    // send(superPrint("libc.so:__system_property_get", "Native API", this._value, false, createArgumentsLikeObject(this._name)));
                }
            }
        });

    // File sys checks in Java
    Java.use('java.io.File')['$init'].overload('java.lang.String', 'java.lang.String').implementation = function (path, fileName) {

        let pathString = path + fileName;
        //send(pathString)
        let map =
        {
            // Rootbeer
            "/system/xbin/busybox": "/system/xbin/busybo",
            "/system/bin/su": "/system/bin/s",
            "/system/xbin/su": "/system/bin/s"

        };
        var retval;
        if (map[pathString] != null) {
            retval = this.$init("/system/bin/", "suasaa");
            superPrint("java.io.File.$init(java.lang.String,java.lang.String)", "Java API", retval, true, ["/system/bin/", "suasaa"]);
        }
        else {
            retval = this.$init(path, fileName);
            superPrint("java.io.File.$init(java.lang.String,java.lang.String)", "Java API", retval, false, [path, fileName]);
        }

        //logReturnValue(retval);
        return retval;
    };

    // File sys checks in C
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"),
        {

            onEnter: function (args) {
                var prop = Memory.readCString(args[0]);
                //send("libc.so  fopen was called with "+ prop + "   !!!!!!!!!");
                let map =
                {
                    "/data/local/su": "/system/bin/s",
                    "/data/local/bin/su": "/system/bin/s",
                    "/data/local/xbin/su": "/system/bin/s",
                    "/sbin/su": "/system/bin/s",
                    "/su/bin/su": "/system/bin/s",
                    "/system/bin/su": "/system/bin/s",
                    "/system/bin/.ext/su": "/system/bin/s",
                    "/system/bin/failsafe/su": "/system/bin/s",
                    "/system/sd/xbin/su": "/system/bin/s",
                    "/system/usr/we-need-root/su": "/system/bin/s",
                    "/system/xbin/su": "/system/bin/s",
                    "/data/su": "/system/bin/s",
                    "/dev/su": "/system/bin/s",
                    "/system/sbin/su": "/system/bin/s",
                    "/vendor/bin/su": "/system/bin/s",
                    "/vendor/xbin/su": "/system/bin/s",
                    "/data/local/su": "/system/bin/s",
                    "/system/xbin/busybox": "/system/bin/s",
                    "/system/xbin/su": "/system/bin/s"
                };
                //send("prop is"+prop);
                /*
                var argumentsLikeJavascriptObject= {
                    length: 1,
                    splice: function () {}
                }
                argumentsLikeJavascriptObject[0]=prop;
                */

                if (map[prop] != null) {
                    var fakeValue = map[prop];
                    Memory.writeUtf8String(args[0], fakeValue);
                    send(superPrint("libc.so:fopen", "Native API", "File *", true, createArgumentsLikeObject(prop)));
                }
                else {
                    // send(superPrint("libc.so:fopen", "Native API", "File *", false, createArgumentsLikeObject(prop)));
                }

            },
            onLeave: function (retval) {
            }
        });

    overideByIndex("java.lang.Runtime", "exec", 5, function (input) {
        if (cloackedCommands[input] != null) {
            var fakeCommand = cloackedCommands[input];
            send(superPrint("java.lang.Runtime.exec[5]", "Java API", "Process *", true, arguments));
            arguments[0] = fakeCommand
            return this["exec"].apply(this, arguments);
        }
        else {
            send(superPrint("java.lang.Runtime.exec[5]", "Java API", "Process *", false, arguments));
            return this["exec"].apply(this, arguments);
        }
    });

    // This function is called every sensorTriggerInterval milliseconds to update sensor data. 
    function triggerSensor(SensorEventListenerInstance) {
        //send("triggerSensor was called!");
        Java.scheduleOnMainThread(function () {
            let sensorEventClass = Java.use("android.hardware.SensorEvent");
            let sensorEventInstance = sensorEventClass.$new(3);
            let sensorEventClassValuesField = sensorEventClass.class.getField('values');

            let sensorEventInstanceValuesField = sensorEventClassValuesField.get(sensorEventInstance);
            let valuesJavaArray = Java.array('float', sensorEventInstanceValuesField);

            // set x
            valuesJavaArray[0] = getRandom();
            // set y
            valuesJavaArray[1] = getRandom();
            // set z
            valuesJavaArray[2] = getRandom();

            SensorEventListenerInstance.onSensorChanged(sensorEventInstance);
        });
    }

    // base overload function for registering a sensor listener (other overloads call this overload)
    overideByOverload("android.hardware.SensorManager", "registerListener", ['android.hardware.SensorEventListener', 'android.hardware.Sensor', 'int', 'android.os.Handler'], function (...input) {
        //send("registerListener was called !");
        let SensorEventListenerInstance = Java.cast(arguments[0], Java.use(arguments[0].$className));
        // Trigger sensor in certain intervals
        setInterval(() => {
            triggerSensor(SensorEventListenerInstance);
        }, sensorTriggerInterval);

        return this.registerListener(...input);
    });
}

/*****************************************************************************/
///////            AntiTimeBomb Functions          //////////////
/*****************************************************************************/


function Min(a, b) {
    return a < b ? a : b;
}


var delta = 0;
function timeAcceleration_incremental_10s(currentTime) {
    delta += 10000; // Increment by 10 seconds
    return currentTime + delta;
}


const Math = Java.use("java.lang.Math")

function timeAcceleration_exponantial_2(startTime, currentTime, threshold) {
    if (currentTime - startTime > threshold) {
        return Math.pow(currentTime - startTime, 2);
    }
    return 0;
}
function timeAcceleration_exponantial_3(startTime, currentTime, threshold) {
    if (currentTime - startTime > threshold) {
        return Math.pow(currentTime - startTime, 3);
    }
    return 0;
}
function timeAcceleration_exponantial_4(startTime, currentTime, threshold) {
    if (currentTime - startTime > threshold) {
        return Math.pow(currentTime - startTime, 4);
    }
    return 0;
}


var startTime_currentTimeMillis = -1
var startTime_getTimeInMillis = -1
var startTime_getTime = -1
var startTime_uptimeMillis = -1
var startTime_uptimeNanos = -1

function hook_currentTimeAPIs(timeAccelerationAlgo) {
    const System = Java.use("java.lang.System");
    startTime_currentTimeMillis = System.currentTimeMillis();
    System.currentTimeMillis.implementation = function() {
        var curTime = System.currentTimeMillis();
        return curTime + timeAccelerationAlgo(startTime_currentTimeMillis, curTime, 10000);
        // const argumentsJson = JSON.stringify(arguments, null, 2);
        // send('\nCALLED: currentTimeMillis [overload 1]');
        // send('ARGUMENTS:', argumentsJson);
        // send('RETURN_VALUE:', returnValue);
    }

    const Calendar = Java.use("android.icu.util.Calendar");
    // startTime_getTimeInMillis = Calendar.getTimeInMillis();
    // Calendar.getTimeInMillis.implementation = function () {
    //     var curTime = this.getTimeInMillis();
    //     return curTime + timeAccelerationAlgo(startTime_getTimeInMillis, curTime, 10000);
    // };

    var Date = Java.use("java.util.Date");
    // startTime_getTime = Date.getTime();
    // Date.getTime.implementation = function () {
    //     var curTime = this.getTime();
    //     return curTime + timeAccelerationAlgo(startTime_getTime, curTime, 10000);
    // };
    Date.equals.implementation = function (obj) {
        var result = this.equals(obj);
        result = true; // force the result to be true
        return result;
    };

    const SystemClock = Java.use("android.os.SystemClock");
    startTime_uptimeMillis = SystemClock.uptimeMillis();
    SystemClock.uptimeMillis.implementation = function() {
        var curTime = SystemClock.uptimeMillis();
        return curTime + timeAccelerationAlgo(startTime_uptimeMillis, curTime, 10000);
    }
    if (API_LEVEL >= 35) {
        startTime_uptimeNanos = SystemClock.uptimeNanos();
        SystemClock.uptimeNanos.implementation = function() {
            var curTime = SystemClock.uptimeNanos();
            return curTime + timeAccelerationAlgo(startTime_uptimeNanos, curTime, 10000000) / 1000;
        }
    }
}

function hook_uptimeMillis() {
    const Handler = Java.use("android.os.SystemClock");
    Handler.uptimeMillis.implementation = function() {
        var ret = Handler.uptimeMillis();
        delta += 86400000;
        return ret;
        const argumentsJson = JSON.stringify(arguments, null, 2);
        //    send('\nCALLED: uptimeMillis [overload 1]');
        //    send('ARGUMENTS:', argumentsJson);
        //    send('RETURN_VALUE:', returnValue);
    }
}


function hook_postDelayed(threshold) {
     
    const Handler = Java.use("android.os.Handler");

    Handler.postDelayed.overload('java.lang.Runnable', 'long').implementation = function(r, delayMillis) {
        const argumentsJson = JSON.stringify(arguments, null, 2);
        const returnValue = Handler.postDelayed.overload('java.lang.Runnable', 'long').apply(this, r, Min(delayMillis, threshold*1000));

        // send('\nCALLED: postDelayed [overload 1]');
        // send('ARGUMENTS:' + argumentsJson);
        // send('RETURN_VALUE:' + returnValue);

         // if(arguments[1] === 3597751) {
         //      let msg = {};
         //      let java_lang_Exception = Java.use("java.lang.Exception")
         //      var exception = java_lang_Exception.$new()
         //      const trace = exception.getStackTrace()
         //      msg.stack = trace.map(traceEl => {
         //           return {
         //                class: traceEl.getClassName(),
         //                file: traceEl.getFileName(),
         //                line: traceEl.getLineNumber(),
         //                method: traceEl.getMethodName(),
         //                isNative: traceEl.isNativeMethod(),
         //                str: traceEl.toString()
         //           }
         //      })
         //      send(JSON.stringify(msg, null, 4))
         // }

         return returnValue;
    }
    if (API_LEVEL < 28) return;
    Handler.postDelayed.overload('java.lang.Runnable', 'java.lang.Object', 'long').implementation = function(r, token, delayMillis) {
        const argumentsJson = JSON.stringify(arguments, null, 2);
        const returnValue = Handler.postDelayed.overload('java.lang.Runnable', 'java.lang.Object', 'long').apply(this, r, token, Min(delayMillis, threshold*1000));

        // send('\nCALLED: postDelayed [overload 2]');
        // send('ARGUMENTS:' + argumentsJson);
        // send('RETURN_VALUE:' + returnValue);

        return returnValue;
    }
}

function printTimeRelated(methodAndClassName, args) {
    var result = "*** ";
    result += "Entering Time-related method=== " + methodAndClassName + "\n";
    for (var i = 0; i < args.length; i++) {
        result += ("arg[" + i + "]: " + args[i] + "\n");
    }
    return result;
}

function hook_sleepAPIs(threshold) {
    var Thread = Java.use("java.lang.Thread");
    Thread.sleep.overload('long').implementation = function(millis) {
        send(printTimeRelated("java.lang.Thread.sleep", arguments));
        return this.sleep(Min(millis, threshold*1000));
    };
    Thread.sleep.overload('long', 'int').implementation = function(millis, nanos) {
        send(printTimeRelated("java.lang.Thread.sleep", arguments));
        return this.sleep(Min(millis, threshold*1000), 0);
    };

    var SystemClock = Java.use('android.os.SystemClock');
    SystemClock.sleep.implementation = function(millis) {
        send(printTimeRelated("android.os.SystemClock.sleep", arguments));
        return this.sleep(Min(millis, threshold*1000));
    };

    var Socket = Java.use("java.net.Socket");
    Socket.connect.overload("java.net.SocketAddress", "int").implementation = function (endpoint, timeout) {
        send(printTimeRelated("java.net.Socket.connect", arguments));
        return this.connect(endpoint, Min(timeout, threshold*1000));
    };
}



/*****************************************************************************/
///////            Main Function          //////////////
/*****************************************************************************/


function antiTimeBasedEvasion() {
    //hook_sleep();
    //hook_postDelayed();
    hook_currentTimeAPIs();
    //hook_uptimeMillis();
}

// Listen for messages from Python
rpc.exports.additional = function(mode) {
    Java.perform(function () {
        try {
            var BuildVersion = Java.use("android.os.Build$VERSION");
            API_LEVEL = BuildVersion.SDK_INT.value;
            console.log("API Level: " + API_LEVEL);
            monitorDangerousJavaAPIs();
            monitorJavaReflectionMethodInvokes();
            monitorNativeDangerousMethods();
            CloakEmulator();
            if(mode === 'DirectTesting') {
            } else if(mode === 'Incremental') {
                hook_currentTimeAPIs(timeAcceleration_incremental_10s);
            } else if(mode === 'TAF=2') {
                hook_currentTimeAPIs(timeAcceleration_exponantial_2);
            } else if(mode === 'TAF=3') {
                hook_currentTimeAPIs(timeAcceleration_exponantial_3);
            } else if(mode === 'TAF=4') {
                hook_currentTimeAPIs(timeAcceleration_exponantial_4);
            } else if(mode === 'Delay_5') {
                hook_sleepAPIs(5);
                hook_postDelayed(5);
            } else if(mode === 'AntiTimebomb') {
                hook_currentTimeAPIs(timeAcceleration_exponantial_4);
                hook_sleepAPIs(5);
                hook_postDelayed(5);
            } else {
                send("Wrong running mode")
                var sysexit = Java.use("java.lang.System");
                sysexit.exit(1);
            }
        } catch (e) {
            send("Error occurred: " + e.message);
            send("Stack trace: " + e.stack);
            var sysexit = Java.use("java.lang.System");
            sysexit.exit(1); // Use exit code 1 to indicate an error
        }
    });
};



setTimeout(function() {
    send("!!! 30 seconds");
}, 30000);

setTimeout(function() {
    send("!!! 60 seconds");
}, 60000);

setTimeout(function() {
    send("!!! 90 seconds");
}, 90000);

setTimeout(function() {
    send("!!! 120 seconds");
}, 120000);

setTimeout(function() {
    send("!!! 150 seconds");
}, 150000);

setTimeout(function() {
    send("!!! 180 seconds");
}, 180000);



