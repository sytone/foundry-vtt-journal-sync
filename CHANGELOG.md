# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2020-08-11

Note: This is a breaking change and only works on 0.7.8 or later of Foundry VTT

- Fixed: Error uploading files to server. [https://gitlab.com/foundrynet/foundryvtt/-/issues/4221](https://gitlab.com/foundrynet/foundryvtt/-/issues/4221)

## [0.6.11] - 2020-08-11

- Fixed: Error when making parent path not caught and stopping export of files.
- Fixed: Issue where export fails after first run.
- Fixed: Issues with filenames and invalid characters int he Journal entry names.

## [0.6.10] - 2020-08-11

- Fixed: Versions in the Mainfest files.
- Added: Script to handle the release automatically.
- Fixed: The Build to only run on a tagged release not every release.

## [0.6.0] - 2020-08-04

- Fixed: On import files other than markdown files would be imported.
- Fixed: Issues on Forge for export due to the data folder #2
- Fixed: .md was added to the Journal Entry name in foundry.
- Changed: Switched to release on version tag.

## [0.5.0] - 2020-07-10

- Added: When import / export detects that the content is JSON Markdown / HTML conversion is skipped.
- Fixed: When skipped folder or name is empty files in root of Journal were not being imported / exported.

## [0.4.1] - 2020-07-10

- Fixed: Name of Journal when exporting was not correct.

## [0.4.0] - 2020-07-02

- Added: Option to skip folders and Journals that have special formatting and are not actually journal entries.
- Added: Resolved issues with Forien's Quest Log and formatting. #1

## [0.3.0] - 2020-06-27

- Added: Ability to link to editing UI
- Added: Buttons in UI to import and export
- Added: Cleaned up UI messages to be less
- Added: Added ability to turn tracing on for the console log

## [0.2.1] - 2020-06-24

- Added: Github action to automatically publish the module.
- Added: CHANGELOG.md to track all the changes.

## [0.2.0] - 2020-06-21

- Added: Appended the ID of the Journal Entry to the filename to allow entries with the same title be updated.
- Added: Creation of folders in Foundry VTT to match server file system.
- Fixed: Made all functions async to handle calls and race issues

## [0.1.0] - 2015-10-06

- Added: Initial release
- Added: Created simple module to import and export Journal Entries to the file system and used Markdown as the format.
- Added: Created import and export commands for chat window.

[Unreleased]: https://github.com/sytone/foundry-vtt-journal-sync/releases/tag/v0.6.11...HEAD
[0.6.11]: https://github.com/sytone/foundry-vtt-journal-sync/compare/v0.6.10...v0.6.11
[0.6.10]: https://github.com/sytone/foundry-vtt-journal-sync/compare/v0.6.0...v0.6.10
[0.6.0]: https://github.com/sytone/foundry-vtt-journal-sync/compare/0.5.0...v0.6.0
[0.5.0]: https://github.com/sytone/foundry-vtt-journal-sync/compare/0.4.1...0.5.0
[0.4.1]: https://github.com/sytone/foundry-vtt-journal-sync/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/sytone/foundry-vtt-journal-sync/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/sytone/foundry-vtt-journal-sync/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/sytone/foundry-vtt-journal-sync/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.2.0...0.2.0
[0.2.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.1.4...v0.2.0
[0.1.4]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.1.0...v0.1.4
[0.1.0]: https://github.com/olivierlacan/keep-a-changelog/releases/tag/v0.1.0

## CHANGELOG.md notes

### Types of changes

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.
