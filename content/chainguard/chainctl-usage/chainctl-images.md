---
title: "chainctl images"
lead: ""
description: "chainctl images basics"
type: "article"
date: 2025-03-06T08:49:15+00:00
lastmod: 2025-03-06T08:49:15+00:00
draft: false
tags: ["chainctl", "images", "Product"]
images: []
weight: 070
---

This page presents some of the more commonly used `chainctl images` commands. For a full reference of all commands with details and switches, see [chainctl Reference](/chainguard/chainctl/).


## List chainctl images

To see which Chainguard Containers are available to your account, use:

```shell
chainctl images list
```

Be warned, that list may take a while to generate and is likely to scroll past quickly in your command line terminal. You may prefer to direct the output into a file.


## List chainctl images repos

For a list of image repositories available to your account, use:

```shell
chainctl images repos list
```


## Examine chainctl images history

To examine the history of an image tag in chainctl, use [chainctl images history](/chainguard/chainctl-usage/chainctl-images-history/).


## Compare chainctl images

This useful command enables you to compare two Chainguard images. To use it, enter:

```shell
chainctl images diff $FROM_IMAGE $TO_IMAGE
```

There is a full docs page on this command. See <ins>[How To Compare Chainguard Containers with chainctl](/chainguard/chainguard-images/how-to-use/comparing-images/)</ins> to learn more.
