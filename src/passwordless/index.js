import Immutable from 'immutable';
import * as l from '../lock/index';

function setResendStatus(m, value) {
  // TODO: check value
  return m.set("resendStatus", value);
}

export function setResendSuccess(m) {
  return setResendStatus(m, "success");
}

export function resendSuccess(m) {
  return resendStatus(m) == "success";
}

export function setResendFailed(m) {
  return setResendStatus(m, "failed");
}

export function resendFailed(m) {
  return resendStatus(m) == "failed";
}

export function resendOngoing(m) {
  return resendStatus(m) == "ongoing";
}

export function resend(m) {
  if (resendAvailable(m)) {
    return setResendStatus(m, "ongoing");
  } else {
    return m;
  }
}

function resendStatus(m) {
  return m.get("resendStatus", "waiting");
}

export function resendAvailable(m) {
  return resendStatus(m) == "waiting" || resendStatus(m) == "failed";
}

export function reset(m, clearCred = true) {
  let keys = Immutable.fromJS(
    ["passwordlessStarted", "resendStatus", "selectingLocation"]
  );

  if (clearCred) {
    keys = keys.push("cred");
  }

  m = keys.reduce((r, v) => r.remove(v), m);

  return l.clearGlobalError(m);
}

export function send(m) {
  return m.getIn(["modeOptions", "send"], "link");
}

export function isSendLink(m) {
  return send(m) === "link";
}

export function close(m) {
  return reset(l.close(m));
}

export function setSelectingLocation(m, value) {
  return m.set("selectingLocation", !!value);
}

export function selectingLocation(m) {
  return m.get("selectingLocation", false);
}

export function setPasswordlessStarted(m, value) {
  return m.set("passwordlessStarted", value);
}

export function passwordlessStarted(m) {
  return m.get("passwordlessStarted", false);
}

export function setSignedIn(m, value) {
  return m.set("signedIn", value);
}

export function signedIn(m) {
  return m.get("signedIn", false);
}