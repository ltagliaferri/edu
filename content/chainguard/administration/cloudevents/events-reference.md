---
title : "Chainguard Enforce Events"
lead: ""
description: "Chainguard Enforce Events"
type: "article"
date: 2022-11-15T12:05:04
lastmod: 2023-11-14T00:08:05
draft: false
images: []
weight: 780
---

## Introduction

Chainguard Enforce generates and emits [CloudEvents](https://cloudevents.io/) based on actions that occur within a Chainguard account, such as registering a Kubernetes cluster or creating an IAM invitation. Enforce also emits events when workloads or policies are changed in a cluster.

See the [chainguard-dev/enforce-events](https://github.com/chainguard-dev/enforce-events) GitHub repository for two sample applications that demonstrate how to create Slack notifications, as well as how to open a GitHub issue from received events.

To subscribe to Enforce events for your account, use the `chainctl` command like this:

```
chainctl events subscriptions create –group $YOUR_GROUP https://<Your webhook URL>
```

Once you are subscribed to Chainguard Enforce events, you will start receiving HTTP POST requests. Each request has a common set of CloudEvent header fields, denoted by the `Ce-` prefix. The event body is encoded using JSON and will have two top-level keys, `actor` and `body`.

The `actor` field is the identity of the actor in your Enforce account that triggered the event, such as a team member or a Kubernetes cluster. The `body` field contains the specific data about the event, for example the response status for an invite creation request, or a cluster delete request.

## UIDP Identifiers

Each Enforce event includes a `Ce-Subject` header that contains a UIDP (UID Path) identifier. Identifiers follow POSIX directory semantics and components are separated by `/` delimiters. A UIDP is comprised of:

* A globally unique identifier (UID), consisting of 20 bytes, that are URL safe hex encoded. For example, account identities like `0475f6baca584a8964a6bce6b74dbe78dd8805b6`.

* One, or multiple `/` separated, scoped unique identifiers (SUID). An SUID is 8 bytes that are unique within a scope (like a group), and are URL safe hex encoded. The following is an example SUID: `b74ce966caf448d1`. SUIDs are used to identify every entity in Enforce, from groups, policies, Kubernetes cluster IDs, event subscriptions, to IAM invitations, roles and role-bindings.

Since Enforce groups can contain child groups, events in a child group will propagate to the parent and thus the UIDP will contain multiple group SUIDs, along with the entity SUID itself. For example, assuming the following components:

* An account UID of `0475f6baca584a8964a6bce6b74dbe78dd8805b6`
* A group SUID of `b74ce966caf448d1`
* A child of group `b74ce966caf448d1` with its own SUID of `dda9aab2d2d90f9e`
* An Enforce namespace admission event of type `Ce-Type: dev.chainguard.admission.namespace.v1` with an SUID `1a4b29ca6df80013`

The complete UIDP in the event's `Ce-Subject` header would be:

```
0475f6baca584a8964a6bce6b74dbe78dd8805b6/b74ce966caf448d1/dda9aab2d2d90f9e/1a4b29ca6df80013
```

An event like a policy validation with SUID of `bcb18b9a6f9f62b6` occurring in the top-level group with SUID `b74ce966caf448d1` would look like this:

```
0475f6baca584a8964a6bce6b74dbe78dd8805b6/b74ce966caf448d1/bcb18b9a6f9f62b6
```

## Authorization Header

Every Enforce event has a JWT formatted [OIDC ID token)(https://openid.net/specs/openid-connect-basic-1_0.html#IDToken) in its `Authorization` header. For authorization purposes, there are two important fields to validate:

1. Use the `iss` field to ensure that the issuer is Chainguard Enforce, specifically `https://issuer.enforce.dev`.
2. Use the `sub` field to check that the event matches your configured Enforce identity. For example, assuming a UIDP ID of `0475f6baca584a8964a6bce6b74dbe78dd8805b6`, the value will resemble the following: `webhook:0475f6baca584a8964a6bce6b74dbe78dd8805b6`. If the subscription is in a sub-group, then the value will have the corresponding group SUID appended to the path.

Validating these fields before processing the JWT token using a verification library can save resources, as well as alert about suspicious traffic, or misconfigured Enforce group settings.

## Events Reference

The following list of services and methods show example HTTP headers and bodies for public facing Enforce events.

## Service: Admission - Namespace
### Method: Created

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: k8s://namespace-UID
Ce-Specversion: 1.0
Ce-Subject: UIDP of the namespace
Ce-Time: 2023-11-14T00:08:05.782192203Z
Ce-Type: dev.chainguard.admission.namespace.v1
Content-Length: 282
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "change": "created",
    "enforcer_state": "state that policy enforcement is in for the namespace",
    "id": "UIDP of the Namespace (whose parent is the Cluster UIDP)",
    "name": "name of the namespace as it appears in the cluster"
  }
}
```
### Method: Updated

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: k8s://namespace-UID
Ce-Specversion: 1.0
Ce-Subject: UIDP of the namespace
Ce-Time: 2023-11-14T00:08:05.782398304Z
Ce-Type: dev.chainguard.admission.namespace.v1
Content-Length: 282
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "change": "updated",
    "enforcer_state": "state that policy enforcement is in for the namespace",
    "id": "UIDP of the namespace (whose parent is the cluster UIDP)",
    "name": "name of the namespace as it appears in the cluster"
  }
}
```
## Service: Enforce - Admission
### Method: Review

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: k8s://cluster-id
Ce-Specversion: 1.0
Ce-Subject: UIDP of cluster
Ce-Time: 2023-11-14T00:08:05.781943601Z
Ce-Type: dev.chainguard.admission.v1
Content-Length: 220
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "request": "see https://pkg.go.dev/k8s.io/api/admission/v1#AdmissionRequest",
    "response": "see https://pkg.go.dev/k8s.io/api/admission/v1#AdmissionResponse"
  }
}
```
## Service: Policy - Validation
### Method: Changed

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: k8s://cluster-id
Ce-Specversion: 1.0
Ce-Subject: image ID e.g. us.gcr.io/prod-enforce-fabc/chainctl@sha256:123abc...
Ce-Time: 2023-11-14T00:08:05.780793292Z
Ce-Type: dev.chainguard.policy.validation.changed.v1
Content-Length: 476
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "cluster_id": "cluster identifier",
    "image_id": "image ID e.g. us.gcr.io/prod-enforce-fabc/chainctl@sha256:123abc...",
    "last_seen": "2023-11-14T00:08:05.780541591Z",
    "policies": {
      "name of the evaluated policy": {
        "change": "Can be [Empty, \"new\", \"degraded\", \"improved\"]",
        "diagnostic": "holds any diagnostic messages surfaced during policy evaluation",
        "last_checked": "2023-11-14T00:08:05.780765292Z",
        "valid": false
      }
    }
  }
}
```
## Service: Registry - Pull
### Method: Pulled

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: cgr.dev
Ce-Specversion: 1.0
Ce-Subject: The identifier of the repository being pulled from
Ce-Time: 2023-11-14T00:08:05.782954608Z
Ce-Type: dev.chainguard.registry.pull.v1
Content-Length: 757
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "digest": "The digest of the image being pulled",
    "error": {
      "code": "The OCI distribution-spec error code",
      "message": "The error message",
      "status": 0
    },
    "location": "Location holds the detected approximate location of the client who pulled. For example, \"ColumbusOHUS\" or \"Minato City13JP",
    "method": "The method used to pull the image. One of: HEAD or GET",
    "repo_id": "The identifier of the repository being pulled from",
    "repository": "The identifier of the repository being pulled from",
    "tag": "The tag of the image being pulled",
    "type": "Type determines whether the object being pulled is a manifest or blob",
    "user_agent": "The user-agent of the client who pulled",
    "when": "2023-11-14T00:08:05.780575"
  }
}
```
## Service: Registry - Push
### Method: Pushed

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: cgr.dev
Ce-Specversion: 1.0
Ce-Subject: The identifier of the repository being pushed to
Ce-Time: 2023-11-14T00:08:05.782542805Z
Ce-Type: dev.chainguard.registry.push.v1
Content-Length: 687
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "digest": "The digest of the image being pushed",
    "error": {
      "code": "The OCI distribution-spec error code",
      "message": "The error message",
      "status": 0
    },
    "location": "Location holds the detected approximate location of the client who pushed. For example, \"ColumbusOHUS\" or \"Minato City13JP",
    "repo_id": "The identifier of the repository being pushed to",
    "repository": "The identifier of the repository being pushed to",
    "tag": "The tag of the image being pushed",
    "type": "Type determines whether the object being pushed is a manifest or blob",
    "user_agent": "The user-agent of the client who pushed",
    "when": "2023-11-14T00:08:05.780541"
  }
}
```
## Service: auth - Auth
### Method: Register

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/auth/v1/register
Ce-Specversion: 1.0
Ce-Subject: Chainguard UIDP
Ce-Time: 2023-11-14T00:08:05.790927367Z
Ce-Type: dev.chainguard.api.auth.registered.v1
Content-Length: 154
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "group": "the group this identity has joined by invitation",
    "identity": "Chainguard UIDP"
  }
}
```
## Service: events - Subscriptions
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/events/v1/subscriptions
Ce-Specversion: 1.0
Ce-Subject: UIDP identifier of the subscription
Ce-Time: 2023-11-14T00:08:05.785462027Z
Ce-Type: dev.chainguard.api.events.subscription.created.v1
Content-Length: 152
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP identifier of the subscription",
    "sink": "Webhook endpoint (http/https URL)"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/events/v1/subscriptions
Ce-Specversion: 1.0
Ce-Subject: UIDP identifier of the subscription to delete
Ce-Time: 2023-11-14T00:08:05.785651428Z
Ce-Type: dev.chainguard.api.events.subscription.deleted.v1
Content-Length: 119
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP identifier of the subscription to delete"
  }
}
```
## Service: iam - GroupAccountAssociations
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/account_associations
Ce-Specversion: 1.0
Ce-Subject: UIDP with which this account information is associated
Ce-Time: 2023-11-14T00:08:05.78587103Z
Ce-Type: dev.chainguard.api.iam.account_associations.created.v1
Content-Length: 385
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "amazon": {
      "account": "Amazon account ID (if applicable)"
    },
    "description": "description of this association",
    "google": {
      "project_id": "Google Cloud Project ID (if applicable)",
      "project_number": "Google Cloud Project Number (if applicable)"
    },
    "group": "UIDP with which this account information is associated",
    "name": "group name"
  }
}
```
### Method: Update

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/account_associations
Ce-Specversion: 1.0
Ce-Subject: UIDP with which this account information is associated
Ce-Time: 2023-11-14T00:08:05.786188232Z
Ce-Type: dev.chainguard.api.iam.account_associations.updated.v1
Content-Length: 336
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "amazon": {
      "account": "amazon account if applicable"
    },
    "description": "group description",
    "google": {
      "project_id": "project id if applicable",
      "project_number": "project number if applicable"
    },
    "group": "UIDP with which this account information is associated",
    "name": "group name"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/account_associations
Ce-Specversion: 1.0
Ce-Subject: UIDP of the group whose associations will be deleted
Ce-Time: 2023-11-14T00:08:05.786405934Z
Ce-Type: dev.chainguard.api.iam.account_associations.deleted.v1
Content-Length: 129
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "group": "UIDP of the group whose associations will be deleted"
  }
}
```
## Service: iam - GroupInvites
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/group_invites
Ce-Specversion: 1.0
Ce-Subject: group UIDP under which this invite resides
Ce-Time: 2023-11-14T00:08:05.794320792Z
Ce-Type: dev.chainguard.api.iam.group_invite.created.v1
Content-Length: 145
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "expiration": {
      "seconds": 100
    },
    "id": "group UIDP under which this invite resides"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/group_invites
Ce-Specversion: 1.0
Ce-Subject: UIDP of the record
Ce-Time: 2023-11-14T00:08:05.794567194Z
Ce-Type: dev.chainguard.api.iam.group_invite.deleted.v1
Content-Length: 92
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP of the record"
  }
}
```
## Service: iam - Groups
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/groups
Ce-Specversion: 1.0
Ce-Subject: group UIDP under which this group resides
Ce-Time: 2023-11-14T00:08:05.78994356Z
Ce-Type: dev.chainguard.api.iam.group.created.v1
Content-Length: 169
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "description": "group description",
    "id": "group UIDP under which this group resides",
    "name": "group name"
  }
}
```
### Method: Update

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/groups
Ce-Specversion: 1.0
Ce-Subject: group UIDP under which this group resides
Ce-Time: 2023-11-14T00:08:05.790192662Z
Ce-Type: dev.chainguard.api.iam.group.updated.v1
Content-Length: 169
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "description": "group description",
    "id": "group UIDP under which this group resides",
    "name": "group name"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/groups
Ce-Specversion: 1.0
Ce-Subject: UIDP of the record
Ce-Time: 2023-11-14T00:08:05.790447963Z
Ce-Type: dev.chainguard.api.iam.group.deleted.v1
Content-Length: 92
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP of the record"
  }
}
```
## Service: iam - Identities
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/identities
Ce-Specversion: 1.0
Ce-Subject: UIDP of identity
Ce-Time: 2023-11-14T00:08:05.784725421Z
Ce-Type: dev.chainguard.api.iam.identity.created.v1
Content-Length: 329
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "identity": {
      "Relationship": null,
      "description": "The human readable description of identity",
      "id": "The unique identifier of this specific identity",
      "name": "The human readable name of identity"
    },
    "parent_id": "The Group UIDP path under which the new Identity resides"
  }
}
```
### Method: Update

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/identities
Ce-Specversion: 1.0
Ce-Subject: The unique identifier of this specific identity
Ce-Time: 2023-11-14T00:08:05.784949123Z
Ce-Type: dev.chainguard.api.iam.identity.updated.v1
Content-Length: 245
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "Relationship": null,
    "description": "The human readable description of identity",
    "id": "The unique identifier of this specific identity",
    "name": "The human readable name of identity"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/identities
Ce-Specversion: 1.0
Ce-Subject: UIDP of the record
Ce-Time: 2023-11-14T00:08:05.785189125Z
Ce-Type: dev.chainguard.api.iam.identity.deleted.v1
Content-Length: 92
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP of the record"
  }
}
```
## Service: iam - IdentityProviders
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/identityProviders
Ce-Specversion: 1.0
Ce-Subject: UIDP of identity provider
Ce-Time: 2023-11-14T00:08:05.783775414Z
Ce-Type: dev.chainguard.api.iam.identity_providers.created.v1
Content-Length: 378
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "identity_provider": {
      "Configuration": null,
      "description": "The human readable description of identity provider",
      "id": "The UIDP of the IAM group to nest this identity provider under",
      "name": "The human readable name of identity provider"
    },
    "parent_id": "The UIDP of the IAM group to nest this identity provider under"
  }
}
```
### Method: Update

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/identityProviders
Ce-Specversion: 1.0
Ce-Subject: The UIDP of the IAM group to nest this identity provider under
Ce-Time: 2023-11-14T00:08:05.784178717Z
Ce-Type: dev.chainguard.api.iam.identity_providers.updated.v1
Content-Length: 279
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "Configuration": null,
    "description": "The human readable description of identity provider",
    "id": "The UIDP of the IAM group to nest this identity provider under",
    "name": "The human readable name of identity provider"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/identityProviders
Ce-Specversion: 1.0
Ce-Subject: UIDP of the IdP
Ce-Time: 2023-11-14T00:08:05.784376519Z
Ce-Type: dev.chainguard.api.iam.identity_providers.deleted.v1
Content-Length: 89
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP of the IdP"
  }
}
```
## Service: iam - Policies
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/policies
Ce-Specversion: 1.0
Ce-Subject: UIDP of policy
Ce-Time: 2023-11-14T00:08:05.795013497Z
Ce-Type: dev.chainguard.api.iam.policy.created.v1
Content-Length: 286
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "parent_id": "Group UIDP path under which the new policy is associated",
    "policy": {
      "description": "description of the policy",
      "document": "YAML encoded policy document",
      "id": "UIDP of the policy",
      "name": "name of the policy"
    }
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/policies
Ce-Specversion: 1.0
Ce-Subject: UIDP of the policy
Ce-Time: 2023-11-14T00:08:05.7953813Z
Ce-Type: dev.chainguard.api.iam.policy.deleted.v1
Content-Length: 92
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP of the policy"
  }
}
```
### Method: Update

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/policies
Ce-Specversion: 1.0
Ce-Subject: UIDP of the policy
Ce-Time: 2023-11-14T00:08:05.795617302Z
Ce-Type: dev.chainguard.api.iam.policy.updated.v1
Content-Length: 204
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "description": "description of the policy",
    "document": "YAML encoded policy document",
    "id": "UIDP of the policy",
    "name": "name of the policy"
  }
}
```
### Method: ActivateVersion

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/policyVersions
Ce-Specversion: 1.0
Ce-Subject: UIDP of the policy version
Ce-Time: 2023-11-14T00:08:05.795824303Z
Ce-Type: dev.chainguard.api.iam.policy.version.activated.v1
Content-Length: 108
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "version_id": "UIDP of the policy version"
  }
}
```
## Service: iam - RoleBindings
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/rolebindings
Ce-Specversion: 1.0
Ce-Subject: UIDP of the Role to bind
Ce-Time: 2023-11-14T00:08:05.791535971Z
Ce-Type: dev.chainguard.api.iam.rolebindings.created.v1
Content-Length: 261
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "parent": "The Group UIDP path under which the new RoleBinding resides",
    "role_binding": {
      "id": "UID of this role binding",
      "identity": "UID of the Identity to bind",
      "role": "UIDP of the Role to bind"
    }
  }
}
```
### Method: Update

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/rolebindings
Ce-Specversion: 1.0
Ce-Subject: UID of this role binding
Ce-Time: 2023-11-14T00:08:05.791880474Z
Ce-Type: dev.chainguard.api.iam.rolebindings.updated.v1
Content-Length: 173
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UID of this role binding",
    "identity": "UID of the Identity to bind",
    "role": "UIDP of the Role to bind"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/iam/v1/rolebindings
Ce-Specversion: 1.0
Ce-Subject: UID of the record
Ce-Time: 2023-11-14T00:08:05.792160476Z
Ce-Type: dev.chainguard.api.iam.rolebindings.deleted.v1
Content-Length: 91
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UID of the record"
  }
}
```
## Service: registry - Registry
### Method: CreateRepo

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/registry/v1/repos
Ce-Specversion: 1.0
Ce-Subject: The identifier of this specific repository
Ce-Time: 2023-11-14T00:08:05.79263398Z
Ce-Type: dev.chainguard.api.platform.registry.repo.created.v1
Content-Length: 179
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "The identifier of this specific repository",
    "name": "The name is the human-readable name of the repository"
  }
}
```
### Method: UpdateRepo

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/registry/v1/repos
Ce-Specversion: 1.0
Ce-Subject: The identifier of this specific repository
Ce-Time: 2023-11-14T00:08:05.792947682Z
Ce-Type: dev.chainguard.api.platform.registry.repo.updated.v1
Content-Length: 179
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "The identifier of this specific repository",
    "name": "The name is the human-readable name of the repository"
  }
}
```
### Method: DeleteRepo

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/registry/v1/repos
Ce-Specversion: 1.0
Ce-Subject: The identifier of this specific repository
Ce-Time: 2023-11-14T00:08:05.793154683Z
Ce-Type: dev.chainguard.api.platform.registry.repo.deleted.v1
Content-Length: 116
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "The identifier of this specific repository"
  }
}
```
### Method: CreateTag

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/registry/v1/tags
Ce-Specversion: 1.0
Ce-Subject: The identifier of this specific tag
Ce-Time: 2023-11-14T00:08:05.793476586Z
Ce-Type: dev.chainguard.api.platform.registry.tag.created.v1
Content-Length: 197
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "digest": "The digest of the manifest with this tag",
    "id": "The identifier of this specific tag",
    "name": "The unique name of the tag"
  }
}
```
### Method: UpdateTag

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/registry/v1/tags
Ce-Specversion: 1.0
Ce-Subject: The identifier of this specific tag
Ce-Time: 2023-11-14T00:08:05.793748188Z
Ce-Type: dev.chainguard.api.platform.registry.tag.updated.v1
Content-Length: 197
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "digest": "The digest of the manifest with this tag",
    "id": "The identifier of this specific tag",
    "name": "The unique name of the tag"
  }
}
```
### Method: DeleteTag

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/registry/v1/tags
Ce-Specversion: 1.0
Ce-Subject: The identifier of this specific tag
Ce-Time: 2023-11-14T00:08:05.793975989Z
Ce-Type: dev.chainguard.api.platform.registry.tag.deleted.v1
Content-Length: 109
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "The identifier of this specific tag"
  }
}
```
## Service: tenant - Clusters
### Method: Create

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/tenant/v1/clusters
Ce-Specversion: 1.0
Ce-Subject: Cluster UIDP under which this cluster resides
Ce-Time: 2023-11-14T00:08:05.786788737Z
Ce-Type: dev.chainguard.api.tenant.cluster.created.v1
Content-Length: 1735
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "cluster": {
      "activity": {
        "example activity": {
          "controller_name": "the name of the Controller CRD which was the source of this activity on the tenant cluster",
          "last_seen": {
            "nanos": 780540491,
            "seconds": 1699920485
          },
          "namespace": "the namespace in which the source of this cluster activity lives",
          "spec_hash": "the hash of the Controller or Webhook CRD's spec",
          "webhook_name": "the name of the Webhook CRD which was the source of this activity on the tenant cluster"
        }
      },
      "agent_version": "the version of the Chainguard agent last reported by the cluster",
      "auth_info": {
        "client_certificate_data": "Y29udGFpbnMgUEVNLWVuY29kZWQgZGF0YSBmcm9tIGEgY2xpZW50IGNlcnQgZmlsZSBmb3IgVExT",
        "client_key_data": "Y29udGFpbnMgUEVNLWVuY29kZWQgZGF0YSBmcm9tIGEgY2xpZW50IGtleSBmaWxlIGZvciBUTFM="
      },
      "description": "a short description of this cluster",
      "group": {
        "description": "human readable description of group",
        "id": "group UIDP under which this group resides",
        "name": "human readable name of group"
      },
      "id": "Cluster UIDP under which this cluster resides",
      "info": {
        "CertificateAuthorityData": "Y29udGFpbnMgUEVNLWVuY29kZWQgY2VydGlmaWNhdGUgYXV0aG9yaXR5IGNlcnRpZmljYXRlcw==",
        "server": "address of the kubernetes cluster (https://hostname:port)"
      },
      "issuer": "the identity issuer tied to this cluster",
      "last_seen": {
        "nanos": 780540291,
        "seconds": 1699920485
      },
      "managed_name": "unique name assigned to this cluster's managed agent",
      "name": "name of the cluster",
      "registered": {
        "nanos": 780539691,
        "seconds": 1699920485
      },
      "remote_id": "the remote ID of this cluster",
      "status": {
        "message": "message",
        "reason": "reason"
      },
      "version": "the Kubernetes version last reported by the cluster"
    },
    "parent_id": "Parent group under which this cluster resides"
  }
}
```
### Method: Delete

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/tenant/v1/clusters
Ce-Specversion: 1.0
Ce-Subject: UIDP of the record
Ce-Time: 2023-11-14T00:08:05.788950852Z
Ce-Type: dev.chainguard.api.tenant.cluster.deleted.v1
Content-Length: 92
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "id": "UIDP of the record"
  }
}
```
### Method: Update

#### Example HTTP Headers

```
POST / HTTP/1.1
Host: console-api.enforce.dev
Accept-Encoding: gzip
Authorization: Bearer oidctoken
Ce-Audience: customer
Ce-Group: UID of parent group
Ce-Id: cloudevent generated UUID
Ce-Source: https://console-api.enforce.dev/tenant/v1/clusters
Ce-Specversion: 1.0
Ce-Subject: Cluster UIDP under which this cluster resides
Ce-Time: 2023-11-14T00:08:05.789298955Z
Ce-Type: dev.chainguard.api.tenant.cluster.updated.v1
Content-Length: 1663
Content-Type: application/json
User-Agent: Chainguard Enforce

```

#### Example HTTP Body

```json
{
  "actor": {
    "subject": "identity that triggered the event"
  },
  "body": {
    "activity": {
      "example activity": {
        "controller_name": "the name of the Controller CRD which was the source of this activity on the tenant cluster",
        "last_seen": {
          "nanos": 780541291,
          "seconds": 1699920485
        },
        "namespace": "the namespace in which the source of this cluster activity lives",
        "spec_hash": "the hash of the Controller or Webhook CRD's spec",
        "webhook_name": "the name of the Webhook CRD which was the source of this activity on the tenant cluster"
      }
    },
    "agent_version": "the version of the Chainguard agent last reported by the cluster",
    "auth_info": {
      "client_certificate_data": "Y29udGFpbnMgUEVNLWVuY29kZWQgZGF0YSBmcm9tIGEgY2xpZW50IGNlcnQgZmlsZSBmb3IgVExT",
      "client_key_data": "Y29udGFpbnMgUEVNLWVuY29kZWQgZGF0YSBmcm9tIGEgY2xpZW50IGtleSBmaWxlIGZvciBUTFM="
    },
    "description": "a short description of this cluster",
    "group": {
      "description": "human readable description of group",
      "id": "group UIDP under which this group resides",
      "name": "human readable name of group"
    },
    "id": "Cluster UIDP under which this cluster resides",
    "info": {
      "CertificateAuthorityData": "Y29udGFpbnMgUEVNLWVuY29kZWQgY2VydGlmaWNhdGUgYXV0aG9yaXR5IGNlcnRpZmljYXRlcw==",
      "server": "address of the kubernetes cluster (https://hostname:port)"
    },
    "issuer": "the identity issuer tied to this cluster",
    "last_seen": {
      "nanos": 780541191,
      "seconds": 1699920485
    },
    "managed_name": "unique name assigned to this cluster's managed agent",
    "name": "name of the cluster",
    "registered": {
      "nanos": 780541091,
      "seconds": 1699920485
    },
    "remote_id": "the remote ID of this cluster",
    "status": {
      "message": "message",
      "reason": "reason"
    },
    "version": "the Kubernetes version last reported by the cluster"
  }
}
```