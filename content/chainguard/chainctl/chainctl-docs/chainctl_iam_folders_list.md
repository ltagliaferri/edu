---
date: 2025-07-28T20:36:34Z
title: "chainctl iam folders list"
slug: chainctl_iam_folders_list
url: /chainguard/chainctl/chainctl-docs/chainctl_iam_folders_list/
draft: false
tags: ["chainctl", "Reference", "Product"]
images: []
type: "article"
toc: true
---
## chainctl iam folders list

List folders under an organization.

```
chainctl iam folders list ORGANIZATION_NAME | ORGANIZATION_ID [--output=id|json|table|tree]
```

### Options

```
  -h, --help   help for list
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

* [chainctl iam folders](/chainguard/chainctl/chainctl-docs/chainctl_iam_folders/)	 - IAM folders interactions.

