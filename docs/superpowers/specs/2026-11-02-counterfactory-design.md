# Counterfactory v0.1 design

## Intent
Publish a standalone open source library of executable agent-workflow failure models. The first slice is lost acknowledgement and duplicate execution, expressed in Quint, with a broken model, a corrected model, a saved counterexample, automated verification, and a practical guide.

## Design
One shared finite transition system represents two workers, one logical action, a lease, an asynchronous service request per worker, acknowledgements that can disappear, and durable reconciliation. Two module instances differ only in whether the service atomically deduplicates the stable action identity. Leases coordinate work; they do not cancel pending requests or fence service effects.

Safety: at most one external effect. Additional invariants cover state validity and evidence for recorded completion. Recovery: once an effect exists, fair reconciliation eventually records completion. Deterministic witnesses must exercise real execution and recovery so idle behavior cannot be the only passing behavior.

Service-side deduplication is an explicit assumption. Reconciliation alone is insufficient while an old request may still arrive. The model abstracts one stable action ID, durable service records, atomic deduplication plus effect, and truthful reconciliation; it does not establish that a real provider implements those guarantees.

## Approaches
A Quint model library keeps the project independently reusable. A separate implementation simulator would duplicate semantics and weaken the connection between demonstration and model; v0.1 derives the demo from an actual Quint trace. A web application and production adapters are deferred. Node is only tooling around Quint. TLC checks the finite graph; simulation and deterministic runs give quick feedback.

## Delivery
Apache-2.0 source, locked Quint 0.33.1 dependency, Node >=22 tooling, Java >=17 for TLC, public GitHub repository under the authenticated owner, CI, annotated v0.1.0 tag, source/evidence archive and SHA-256 manifest, downloaded release readback. No paid resources, private source-derived fixtures, production credentials, or real external operations are required by the models. The CLI performs local model operations only.

## Scope and limitations
Two workers each submit at most once. Failure schedules include late requests, lease expiry, dropped acknowledgements, and takeover. No crash-corrupted durable store, key eviction, multi-key collision, lease fencing protocol, or production integration. Model checks establish properties of this finite abstraction; implementation conformance remains future work.

## Builder decisions
Lost acknowledgement provides a compact, recognizable first failure. The correction combines a stable action identity, service-side atomic deduplication, and reconciliation. The finite scope and explicit dependency versions make the initial result reproducible.
