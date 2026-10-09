---
---

Provide focused onboarding around a core-only example where one save coordinates
two independent controls. Link runnable instructions and canonical documentation
from the package READMEs, retaining detailed reference in expandable sections.
Clarify scope matching, execution lifetime and when local state is sufficient.
Build core before typechecking the example so clean-checkout verification resolves
the package's public declarations without relying on existing build output.
These documentation and private-example changes do not alter runtime behavior or
public APIs; no package release is required.
