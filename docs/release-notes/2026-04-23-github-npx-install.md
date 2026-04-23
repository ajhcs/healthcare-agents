# Healthcare Agents v1.1.2 Release Notes

Released: 2026-04-23

This patch release corrects the install docs after verifying that `healthcare-agents` is not yet published on the public npm registry from this environment.

## Changed

- README and INSTALL examples now use the working GitHub-backed command:

  ```bash
  npx --yes github:ajhcs/healthcare-agents install
  ```

- Package and installer metadata now report `1.1.2`.

## Validation

- `npx --yes github:ajhcs/healthcare-agents install --version`
- `bash scripts/lint-agents.sh`
- `bash install.sh --all --dry-run`
- `npm pack --dry-run`
