---
---

Provide focused onboarding around a core-only example where one save coordinates
two independent controls. Link runnable instructions and canonical documentation
from the package READMEs, retaining detailed reference in expandable sections.
Clarify scope matching, execution lifetime and when local state is sufficient.
Build core before typechecking the example so clean-checkout verification resolves
the package's public declarations without relying on existing build output.
Include the example's rendered workflow tests in recursive CI coverage checks.
Resolve core's public source entry in example tests so standalone tests work
without build output. Build core before root recursive test commands, preserving
parallel workspace testing without depending on a particular example package.
These documentation and private-example changes do not alter runtime behavior or
public APIs; no package release is required.
