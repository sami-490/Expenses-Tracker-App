$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = 'C:\Users\samiu\.gemini\antigravity-ide\scratch\Expenses-Tracker-App'
$javaHome = 'C:\Program Files\Android\Android Studio\jbr'
$sdkRoot = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$cmdlineToolsZip = "$env:USERPROFILE\Downloads\cmdline-tools.zip"

if (-not (Test-Path $javaHome)) {
    throw "Java home not found at $javaHome"
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

New-Item -ItemType Directory -Force -Path $sdkRoot | Out-Null
$cmdlineToolsDir = Join-Path $sdkRoot 'cmdline-tools'
New-Item -ItemType Directory -Force -Path $cmdlineToolsDir | Out-Null

if (-not (Test-Path (Join-Path $cmdlineToolsDir 'bin\sdkmanager.bat'))) {
    if (-not (Test-Path $cmdlineToolsZip)) {
        $downloadUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip'
        Invoke-WebRequest -Uri $downloadUrl -OutFile $cmdlineToolsZip
    }

    $tempExtract = Join-Path $env:TEMP 'android-cmdline-tools'
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $tempExtract
    New-Item -ItemType Directory -Force -Path $tempExtract | Out-Null
    Expand-Archive -Path $cmdlineToolsZip -DestinationPath $tempExtract -Force

    $sourceDir = Get-ChildItem -Path $tempExtract -Directory | Select-Object -First 1
    if (-not $sourceDir) { throw 'Unable to determine extracted command line tools directory.' }

    $latestDir = Join-Path $cmdlineToolsDir 'latest'
    if (Test-Path $latestDir) { Remove-Item -Recurse -Force $latestDir }
    New-Item -ItemType Directory -Force -Path $latestDir | Out-Null

    Copy-Item -Recurse -Force (Join-Path $sourceDir.FullName '*') $latestDir
}

$sdkManager = Join-Path $cmdlineToolsDir 'latest\bin\sdkmanager.bat'
if (-not (Test-Path $sdkManager)) {
    throw "sdkmanager.bat not found at $sdkManager"
}

& $sdkManager --sdk_root=$sdkRoot --licenses | Out-String | Write-Host
& $sdkManager --sdk_root=$sdkRoot "platform-tools" "platforms;android-36" "build-tools;36.0.0" | Out-String | Write-Host

$gradleZip = Join-Path $env:USERPROFILE '.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3-all.zip'
$gradleLck = Join-Path $env:USERPROFILE '.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3-all.zip.lck'
$gradlePart = Join-Path $env:USERPROFILE '.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3-all.zip.part'
Remove-Item -Force -ErrorAction SilentlyContinue $gradleZip, $gradleLck, $gradlePart

Set-Location $projectRoot
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\nodejs\npm.cmd' exec -- cap sync android
Set-Location (Join-Path $projectRoot 'android')
& '.\gradlew.bat' assembleDebug

$apkPath = Join-Path (Get-Location) 'app\build\outputs\apk\debug\app-debug.apk'
if (-not (Test-Path $apkPath)) {
    throw "APK was not produced at $apkPath"
}

Write-Host "APK_READY:$apkPath"
