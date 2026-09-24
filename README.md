# dsh-wsl-mail

> **语言：** **中文**（本页） · [English](./README.en.md)

邮件只读：himalaya list / notmuch search。

| | |
|---|---|
| 版本 | **0.1.0** |
| 套件 | [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit) **可选**，不在 `install.sh` |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-mail
# 或本机 path：
# dsh plugin --profile web add /mnt/c/Users/YOU/Desktop/AIFullStackDevelopment/dsh-wsl-mail
```

kit 批量链接（可选）：`bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## 工具

| 工具 | 作用 |
|------|------|
| `mail_status` | CLI 是否可用 |
| `mail_list` | himalaya 信封列表 |
| `mail_notmuch` | notmuch 搜索 |

## 配置要点

`timeoutMs`

不发送、不删除。自行配置 himalaya/notmuch；勿贴 IMAP 密码。

## 兼容性

| 字段 | 值 |
|------|----|
| **插件** | `dsh-wsl-mail` **0.1.0** |
| **最低 dsh** | ≥ **0.1.2**（Web UI 一次性 `?token=`，Windows 中继 `:3081`） |
| **最新验证** | 以 [dsh-wsl-kit 兼容性](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) 为准（当前 **`0.1.7-alpha.2`**）— 套件唯一真源 |
| **套件档位** | 可选（默认不在 `install.sh` / `KIT_SET=daily`） |

## License

MIT
