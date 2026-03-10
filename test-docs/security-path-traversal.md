# Security / Path Traversal Test

This document verifies local path traversal hardening for include and image paths.
Expected result:
- Includes that escape the workspace/document root are blocked
- Image file paths that escape the allowed root are blocked in PDF export
- Normal in-root includes and images continue to work

## Include Traversal (must be blocked)

:[passwd](../../../../etc/passwd)
:[dotenv](../../.env)
:[ssh](../../.ssh/id_rsa)

## Image Traversal (must be blocked for PDF export)

![](../../../../etc/passwd)
![](/etc/hosts)

## Legitimate Include/Image (should still work)

:[table](./tables.md)

![Local icon](../images/icon.png)
