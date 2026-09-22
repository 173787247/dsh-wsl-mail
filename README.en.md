# dsh-wsl-mail

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

Mail list/search via himalaya / notmuch (no send).

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-mail
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `mail_status` | CLIs on PATH |
| `mail_list` | himalaya envelopes |
| `mail_notmuch` | notmuch search |

## Config

`timeoutMs`

No send/delete. Configure himalaya/notmuch yourself; never paste IMAP passwords.

## License

MIT
