---
date: 2025-07-28T20:36:34Z
title: "chainctl iam role-bindings delete"
slug: chainctl_iam_role-bindings_delete
url: /chainguard/chainctl/chainctl-docs/chainctl_iam_role-bindings_delete/
draft: false
tags: ["chainctl", "Reference", "Product"]
images: []
type: "article"
toc: true
---
## chainctl iam role-bindings delete

Delete a role-binding.

```
chainctl iam role-bindings delete ROLE_BINDING_ID [--yes] [--output=id]
```

### Examples

```
  # Delete a role-binding
  chainctl iam role-bindings delete 9b6da6e64b45129eb4e9f9f3ce9b69ca2a550c6b/034e4afcda8c0b07/55b470f08e38b4d2
```

### Options

```
  -h, --help   help for delete
  -y, --yes    Automatic yes to prompts; assume "yes" as answer to all prompts and run non-interactively.
```

### Options inherited from parent commands

```
      --api string         The url of the Chainguard platform API. (default "https://console-api.enforce.dev")
      --audience string    The Chainguard token audience to request. (default "https://console-api.enforce.dev")
      --config string      A specific chainctl config file. Uses CHAINCTL_CONFIG environment variable if a file is not passed explicitly.
      --console string     The url of the Chainguard platform Console. (default "https://console.chainguard.dev")
      --force-color        Force color output even when stdout is not a TTY.
      --issuer string      The url of the Chainguard STS endpoint. (default "https://issuer.enforce.dev")
      --log-level string   Set the log level (debug, info) (default "ERROR")
  -o, --output string      Output format. One of: [csv, env, go-template, id, json, markdown, none, table, terse, tree, wide]
  -v, --v int              Set the log verbosity level.
```

### SEE ALSO

* [chainctl iam role-bindings](/chainguard/chainctl/chainctl-docs/chainctl_iam_role-bindings/)	 - IAM role-bindings resource interactions.

