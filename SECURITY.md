# Security Policy

## Supported Versions

| Version | Supported          |
| :------ | :----------------- |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

The ATP-STRENGTH engineering team takes security and athlete data privacy seriously.

If you believe you have discovered a vulnerability or security issue within the codebase, please do **NOT** open a public issue. Instead, report it responsibly:

1. Send an email to `security@atp-strength.internal` or contact the repository owner through private GitHub vulnerability reporting.
2. Include a detailed proof-of-concept (PoC) and steps to reproduce.
3. Allow up to 48 hours for an acknowledgment and coordinated triage.

## Privacy & Local-First Security Architecture

ATP-STRENGTH adheres to a strict **Zero-Telemetry, Local-First Architecture**:
- All session data, sets, weights, and neuromuscular records are stored locally in the athlete's device storage via an offline Write-Ahead Logging (WAL) engine.
- Every entry is verified with cryptographic checksums (`djb2` standard) before being persisted.
- No third-party analytical trackers, pixel beacons, or user identification cookies are deployed.
