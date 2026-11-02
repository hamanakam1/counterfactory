// One logical action. A and B each submit at most one request for its stable ID.
module protocol {
  const IDEMPOTENT: bool
  pure val workers = Set("A", "B")
  type State = {
    owner: str,
    submitted: Set[str],
    pending: Set[str],
    replies: Set[str],
    effects: int,
    knownDone: bool,
    event: str,
  }
  var s: State

  action init = s' = {
    owner: "", submitted: Set(), pending: Set(), replies: Set(),
    effects: 0, knownDone: false, event: "init",
  }

  action acquire(w: str): bool = all {
    workers.contains(w), s.owner == "", not(s.knownDone),
    not(s.submitted.contains(w)),
    s' = { ...s, owner: w, event: if (w == "A") "acquire A" else "acquire B" },
  }

  action submit(w: str): bool = all {
    s.owner == w, not(s.knownDone), not(s.submitted.contains(w)),
    s' = { ...s, submitted: s.submitted.union(Set(w)),
      pending: s.pending.union(Set(w)), event: if (w == "A") "submit A" else "submit B" },
  }

  // Commit can occur after lease expiry or another worker's acknowledgement.
  // IDEMPOTENT abstracts atomic durable deduplication + effect at the service.
  action commit(w: str): bool = all {
    s.pending.contains(w),
    s' = { ...s, pending: s.pending.exclude(Set(w)),
      replies: s.replies.union(Set(w)),
      effects: if (IDEMPOTENT and s.effects > 0) s.effects else s.effects + 1,
      event: if (w == "A") "commit A" else "commit B" },
  }

  action lose(w: str): bool = all {
    s.replies.contains(w),
    s' = { ...s, replies: s.replies.exclude(Set(w)), event: if (w == "A") "lose ack A" else "lose ack B" },
  }

  action acknowledge(w: str): bool = all {
    s.replies.contains(w),
    s' = { ...s, knownDone: true, replies: s.replies.exclude(Set(w)),
      event: if (w == "A") "acknowledge A" else "acknowledge B" },
  }

  // A lease does not cancel service requests already submitted by its owner.
  action expire = all {
    s.owner != "", s' = { ...s, owner: "", event: "expire lease" },
  }

  // A truthful, durable lookup by the same action ID. Never invents success.
  action reconcile = all {
    not(s.knownDone), s.effects > 0,
    s' = { ...s, knownDone: true, event: "reconcile" },
  }

  action step = any {
    acquire("A"), acquire("B"), submit("A"), submit("B"),
    commit("A"), commit("B"), lose("A"), lose("B"),
    acknowledge("A"), acknowledge("B"), expire, reconcile, s' = s,
  }

  val safety = s.effects <= 1
  val completionSound = s.knownDone implies s.effects > 0
  val stateValid = all {
    Set("", "A", "B").contains(s.owner),
    s.submitted.subseteq(workers), s.pending.subseteq(s.submitted),
    s.replies.subseteq(s.submitted), s.pending.intersect(s.replies) == Set(),
    s.effects >= 0, s.effects <= s.submitted.size(),
  }

  // Conditional recovery, not unconditional scheduling or network liveness.
  temporal recovery = weakFair(reconcile, s) implies
    always((s.effects > 0) implies eventually(s.knownDone))

  // Negative control: the scheduler may stutter forever after a lost reply.
  temporal unconditionalRecovery =
    always((s.effects > 0) implies eventually(s.knownDone))

  run lostAck = init.then(acquire("A")).then(submit("A"))
    .then(commit("A")).then(lose("A")).then(expire)
    .then(acquire("B")).then(submit("B")).then(commit("B"))

  run lateRequest = init.then(acquire("A")).then(submit("A"))
    .then(expire).then(acquire("B")).then(submit("B"))
    .then(commit("B")).then(acknowledge("B")).then(commit("A"))
}
