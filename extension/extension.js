const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function rtlFile(name) {
  const candidates = [
    path.join(__dirname, "rtl", name),
    path.join(__dirname, "..", "rtl", name),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function injectPath() {
  return rtlFile("inject.js");
}

function removePath() {
  return rtlFile("remove.js");
}

function cliPath() {
  return path.join(__dirname, "..", "dist", "index.js");
}

function runCli(args) {
  return new Promise((resolve, reject) => {
    const bin = cliPath();
    if (!fs.existsSync(bin)) {
      reject(new Error("dist/index.js missing — run npm run build in mahsaagent root"));
      return;
    }
    execFile(process.execPath, [bin, ...args], { encoding: "utf8", maxBuffer: 2_000_000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout.trim());
    });
  });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  status.text = "$(symbol-text) Mahsa";
  status.tooltip = "Mahsaagent: RTL + Jalali helpers";
  status.command = "mahsaagent.showPanel";
  status.show();
  context.subscriptions.push(status);

  const copy = async (filePath, okMsg) => {
    try {
      const code = fs.readFileSync(filePath, "utf8");
      await vscode.env.clipboard.writeText(code);
      vscode.window.showInformationMessage(okMsg);
    } catch (err) {
      vscode.window.showErrorMessage(`Mahsaagent: ${err.message}`);
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("mahsaagent.copyRtlSnippet", () =>
      copy(injectPath(), "RTL snippet copied — paste in Developer Tools → Console.")
    ),
    vscode.commands.registerCommand("mahsaagent.copyRtlRemove", () =>
      copy(removePath(), "RTL remove snippet copied.")
    ),
    vscode.commands.registerCommand("mahsaagent.insertJalaliToday", async () => {
      try {
        const out = await runCli(["today", "--en"]);
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          await vscode.env.clipboard.writeText(out);
          vscode.window.showInformationMessage("Jalali today copied to clipboard.");
          return;
        }
        await editor.edit((eb) => eb.insert(editor.selection.active, out.split("\n")[0] || out));
      } catch (err) {
        vscode.window.showErrorMessage(`Mahsaagent: ${err.message}`);
      }
    }),
    vscode.commands.registerCommand("mahsaagent.polishSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage("Select Persian text first.");
        return;
      }
      const text = editor.document.getText(editor.selection);
      try {
        const out = await runCli(["polish", text]);
        await editor.edit((eb) => eb.replace(editor.selection, out));
      } catch (err) {
        vscode.window.showErrorMessage(`Mahsaagent: ${err.message}`);
      }
    }),
    vscode.commands.registerCommand("mahsaagent.validateSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage("Select a value (national id / sheba / mobile / …).");
        return;
      }
      const value = editor.document.getText(editor.selection).trim();
      const kind = await vscode.window.showQuickPick(
        ["national_id", "sheba", "card", "mobile", "postal_code", "legal_id"],
        { placeHolder: "Validation kind" }
      );
      if (!kind) return;
      try {
        const out = await runCli(["validate", kind, value]);
        const doc = await vscode.workspace.openTextDocument({ content: out, language: "json" });
        await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
      } catch (err) {
        vscode.window.showErrorMessage(`Mahsaagent: ${err.message}`);
      }
    }),
    vscode.commands.registerCommand("mahsaagent.showPanel", () => {
      const panel = vscode.window.createWebviewPanel(
        "mahsaagentPanel",
        "Mahsaagent",
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );
      panel.webview.html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Vazirmatn, Tahoma, sans-serif; padding: 1.25rem; line-height: 1.85; background: #0f1419; color: #e7ecf1; }
  h1 { font-size: 1.35rem; margin: 0 0 .5rem; }
  p { opacity: .85; margin: 0 0 1rem; }
  button { display: block; width: 100%; margin: .4rem 0; padding: .65rem .9rem; border: 0; border-radius: 8px;
    background: #1e3a2f; color: #d8f3e4; font: inherit; cursor: pointer; text-align: right; }
  button:hover { background: #274a3c; }
  code { background: #1a222b; padding: .1rem .35rem; border-radius: 4px; }
</style>
</head>
<body>
  <h1>Mahsaagent</h1>
  <p>ابزارهای فارسی داخل ادیتور — RTL، تاریخ شمسی، اعتبارسنجی و پرداخت متن.</p>
  <button data-cmd="mahsaagent.copyRtlSnippet">کپی اسکریپت RTL</button>
  <button data-cmd="mahsaagent.copyRtlRemove">کپی حذف RTL</button>
  <button data-cmd="mahsaagent.insertJalaliToday">درج امروز شمسی</button>
  <button data-cmd="mahsaagent.polishSelection">پرداخت متن انتخاب‌شده</button>
  <button data-cmd="mahsaagent.validateSelection">اعتبارسنجی انتخاب</button>
  <p style="margin-top:1.25rem;font-size:.9rem;opacity:.7">CLI: <code>npx mahsaagent doctor</code></p>
  <script>
    const vscode = acquireVsCodeApi();
    for (const b of document.querySelectorAll('button[data-cmd]')) {
      b.addEventListener('click', () => vscode.postMessage({ command: b.dataset.cmd }));
    }
  </script>
</body>
</html>`;
      panel.webview.onDidReceiveMessage((msg) => {
        if (msg?.command) vscode.commands.executeCommand(msg.command);
      });
    }),
    vscode.commands.registerCommand("mahsaagent.showRtlHelp", () => {
      vscode.commands.executeCommand("mahsaagent.showPanel");
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
