---
date: 2024-06-04T22:20:27Z
title: "chainctl auth token"
slug: chainctl_auth_token
url: /chainguard/chainctl/chainctl-docs/chainctl_auth_token/
draft: false
tags: ["chainctl", "Reference", "Product"]
images: []
type: "article"
toc: true
---
## chainctl auth token

Print the local Chainguard Token.

```
chainctl auth token [flags]
```

### Options

```
  -h, --help   help for token
```

### Options inherited from parent commands

```
      --api string        The url of the Chainguard platform API. (default "https://console-api.enforce.dev")
      --audience string   The Chainguard token audience to request. (default "https://console-api.enforce.dev")
      --config string     A specific chainctl config file. Uses CHAINCTL_CONFIG environment variable if a file is not passed explicitly.
      --console string    The url of the Chainguard platform Console. (default "https://console.enforce.dev")
      --issuer string     The url of the Chainguard STS endpoint. (default "https://issuer.enforce.dev")
  -o, --output string     Output format. One of: ["", "json", "id", "table", "terse", "tree", "wide"]
  -v, --v int             Set the log verbosity level.
```

### SEE ALSO

* [chainctl auth](/chainguard/chainctl/chainctl-docs/chainctl_auth/)	 - Auth related commands for the Chainguard platform.
