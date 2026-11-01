; Inno Setup script
; Build with: ISCC GarisAktaEditor.iss

#define AppName "Sistem Garis Akta Notaris Digital"
#define AppVersion "1.4.7"
#ifndef AppSourceDir
  #define AppSourceDir "dist\SIGANDI-v1.4.7"
#endif
#define AppPublisher "Radina.net"
#define AppExeName "GarisAktaEditor.exe"
#define AppIcon "assets\app_icon.ico"
#ifdef IntegrationTest
  #define AppId "{{F2706A57-50E1-42D3-A009-B140891704A1}"
#else
  #define AppId "{{DCC9D65B-95A5-4C26-8B31-7A9D6B9A334D}"
#endif
#define WordAddinSource "output\word-addin\installer\SIGANDI-Word.dotm"
#define WordAddinSHA GetSHA256OfFile(WordAddinSource)

[Setup]
AppId={#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL=https://radina.net
AppSupportURL=https://radina.net
AppUpdatesURL=https://radina.net
DefaultDirName={localappdata}\Programs\GarisAktaEditor
DefaultGroupName=Radina.net\{#AppName}
DisableProgramGroupPage=yes
AllowNoIcons=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
#ifdef IntegrationTest
OutputBaseFilename=SIGANDI_Installer_Integration_Test
OutputDir=tmp\installer-word-test-1.4.7
Uninstallable=no
CreateUninstallRegKey=no
UsePreviousAppDir=no
UsePreviousTasks=no
#else
OutputDir=dist
OutputBaseFilename=GarisAktaEditor_Setup_v{#AppVersion}
#endif
Compression=lzma
SolidCompression=yes
WizardStyle=modern
WizardImageFile=assets\installer_wizard.bmp
WizardSmallImageFile=assets\installer_wizard_small.bmp
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
SetupIconFile={#AppIcon}
UninstallDisplayIcon={app}\{#AppExeName}
UninstallDisplayName={#AppName}
VersionInfoVersion={#AppVersion}
VersionInfoCompany={#AppPublisher}
VersionInfoDescription={#AppName} Installer
VersionInfoProductName={#AppName}
VersionInfoProductVersion={#AppVersion}
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"; Flags: checkedonce

[Files]
Source: "{#AppSourceDir}\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#WordAddinSource}"; DestDir: "{app}\WordAddin"; DestName: "SIGANDI-Word.dotm"; Flags: ignoreversion
Source: "{#WordAddinSource}"; DestDir: "{code:GetWordStartup}"; DestName: "SIGANDI-Word.dotm"; Flags: ignoreversion
Source: "word-addin\PANDUAN.txt"; DestDir: "{app}\WordAddin"; Flags: ignoreversion
Source: "output\pdf\Panduan SIGANDI v1.4.7.pdf"; DestDir: "{app}"; DestName: "Panduan SIGANDI.pdf"; Flags: ignoreversion

[Registry]
#ifndef IntegrationTest
Root: HKCU; Subkey: "Software\RadinaNet\SIGANDI"; ValueType: string; ValueName: "DesktopExe"; ValueData: "{app}\{#AppExeName}"; Flags: uninsdeletevalue
#endif

[Icons]
#ifndef IntegrationTest
Name: "{autoprograms}\Radina.net\{#AppName}"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\{#AppExeName}"
Name: "{autoprograms}\Radina.net\Panduan SIGANDI"; Filename: "{app}\Panduan SIGANDI.pdf"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\{#AppExeName}"; Tasks: desktopicon
#endif

[Run]
#ifndef IntegrationTest
Filename: "{app}\{#AppExeName}"; Description: "Launch SIGANDI"; Flags: nowait postinstall skipifsilent
#endif

#include "word-addin\installer_word.iss"
