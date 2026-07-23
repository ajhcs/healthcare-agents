# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.5.x | Yes |
| < 1.5 | No — upgrade to the latest release |

## Reporting a vulnerability

Report vulnerabilities privately through
[GitHub private vulnerability reporting](https://github.com/ajhcs/healthcare-agents/security/advisories/new).
Do not open a public issue for security problems.

Relevant areas include the CLI (`bin/cli.js`), the installer (`install.sh`), the
Operator OS evidence-pack loaders (`lib/`), and the npm publish pipeline. The
package has no runtime dependencies, but installer and shell-script issues
(command injection, unsafe file writes, path traversal) are in scope.

We aim to acknowledge reports within a few business days. Please include the
version, a reproduction, and the impact you believe it has.

## PHI and data handling

**Never include PHI, real patient data, or proprietary payer data in any
report, issue, or pull request.** Use synthetic examples only.

This project is a prompt and workflow library; it is not a HIPAA-compliant
environment and does not process PHI itself. If you believe a file in this
repository contains real patient or otherwise sensitive data, report it through
the private channel above rather than a public issue, so it can be removed and
scrubbed from history first.

See [docs/trust-and-safety.md](docs/trust-and-safety.md) for the project's
scope, PHI guidance, and escalation rules.
