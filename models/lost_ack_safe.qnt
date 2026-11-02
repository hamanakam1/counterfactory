module lost_ack_safe {
  import protocol(IDEMPOTENT = true).* from "./protocol"

  run lostAckTest = lostAck.expect(s.effects == 1 and safety)
  run lateRequestTest = lateRequest.expect(s.effects == 1 and s.knownDone)
  run recoveryTest = lostAck.then(reconcile)
    .expect(s.effects == 1 and s.knownDone and safety)
  run normalExecutionTest = init.then(acquire("A")).then(submit("A"))
    .then(commit("A")).then(acknowledge("A"))
    .expect(s.effects == 1 and s.knownDone)
  run neverInventSuccessTest = init.then(reconcile).fail()
  run cannotSubmitAfterCompletionTest = init.then(acquire("A"))
    .then(submit("A")).then(commit("A")).then(reconcile)
    .then(expire).then(acquire("B")).fail()
}
