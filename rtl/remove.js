/**
 * Remove Mahsaagent RTL styles from the editor document.
 * Paste into Developer Tools → Console.
 */
(function mahsaagentRtlRemove() {
  const el = document.getElementById("mahsaagent-rtl-style");
  if (el) {
    el.remove();
    console.log(
      "%c Mahsaagent RTL removed ",
      "background:#b45309;color:#fff;font-size:13px;padding:4px 8px;border-radius:4px;"
    );
  } else {
    console.log("Mahsaagent RTL style not found.");
  }
})();
