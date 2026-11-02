# Lost acknowledgement: model and assumptions

## Scope

The model represents one logical action with a fixed identity, workers A and B, one current lease owner, submitted requests, pending service requests, undelivered replies, an external effect count, and shared durable knowledge of completion. Each worker submits at most once. Event labels aid trace reading and are part of the finite state.

An empty lease owner allows either eligible worker to acquire the task. Submission adds an asynchronous service request. Commit consumes a pending request and produces a reply. Losing a reply consumes the reply without changing the external effect. Expiry clears lease ownership but leaves service requests alone. An acknowledgement or successful reconciliation records completion.

The service commit operation accepts a request even after its worker's lease expires. It can also accept an old request after another worker has recorded completion. This exposes a failure that a synchronous or lease-cancelling abstraction would hide.

## Unsafe and corrected instances

`IDEMPOTENT = false` increments the effect count on every service commit. `IDEMPOTENT = true` permits the first effect and returns the existing outcome for later requests using the same logical action identity. Both instances can lose replies and change owners.

The model does not implement a deduplication store. It assumes a service contract: the deduplication record and effect are durable and atomic, the identity does not change across takeover, and the record remains available throughout this scenario. A key in a client log or a non-atomic check-before-write does not satisfy that contract. A worker lease is not a service fencing token.

## Recovery and progress

`reconcile` is enabled when an effect exists but completion has not been recorded. Its lookup is modeled as truthful and available. With weak fairness, an action that stays enabled eventually executes. Therefore, fair reconciliation eventually records an existing effect.

Without fairness, the scheduler may stutter forever and never reconcile. TLC checks this negative control and must find a temporal violation. We do not claim unconditional network availability, scheduler fairness, that any particular worker eventually acquires a lease, or that a submitted request eventually commits. The named execution and recovery runs show reachable productive behavior; the temporal check establishes conditional recovery across all modeled behaviors.

## Properties

- `safety`: at most one effect per logical action.
- `completionSound`: recorded completion implies an external effect exists.
- `stateValid`: owners and sets stay in scope, pending requests and replies belong to submissions, and effect counts stay between zero and the submission count.
- `recovery`: under weak fairness of reconciliation, a committed effect is eventually recorded.
- `unconditionalRecovery`: the deliberately false version with no fairness premise.

## Outside this abstraction

More than two workers, repeated submissions by the same worker, different logical actions, identity collisions, key eviction, service crashes between non-atomic writes, corrupted durable state, dishonest lookups, authorization, and real provider behavior are outside v0.1. A finite exhaustive result does not generalize automatically to those cases.

To extend the model, change one assumption at a time and preserve at least one negative control. Keep the checks tied to the new scope rather than carrying the old state count forward.
