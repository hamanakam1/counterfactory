module lost_ack_unsafe {
  import protocol(IDEMPOTENT = false).* from "./protocol"

  // A deterministic selection of real protocol actions for the public demo.
  // Full exploration uses step, not this deliberately selected schedule.
  action lostAckStep = any {
    all { s.event == "init", acquire("A") },
    all { s.event == "acquire A", submit("A") },
    all { s.event == "submit A", commit("A") },
    all { s.event == "commit A", lose("A") },
    all { s.event == "lose ack A", expire },
    all { s.event == "expire lease", acquire("B") },
    all { s.event == "acquire B", submit("B") },
    all { s.event == "submit B", commit("B") },
  }

  run duplicatesTest = lostAck.expect(s.effects == 2 and not(safety))
  run lateRequestDuplicatesTest = lateRequest.expect(s.effects == 2)
  run neverInventSuccessTest = init.then(reconcile).fail()
}
