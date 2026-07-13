const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function injectPath() {
  return path.join(__dirname, "..", "rtl", "inject.js");
}

function removePath() {
  return path.join(__dirname, "..", "rtl", "remove.js");
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  status.text = "$(symbol-text) Mahsaagent RTL";
  status.tooltip = "Copy RTL snippet for chat/markdown panels";
  status.command = "mahsaagent.copyRtlSnippet";
  status.show();
  context.subscriptions.push(status);

  context.subscriptions.push(
    vscode.commands.registerCommand("mahsaagent.copyRtlSnippet", async () => {
      try {
        const code = fs.readFileSync(injectPath(), "utf8");
        await vscode.env.clipboard.writeText(code);
        vscode.window.showInformationMessage(
          "Mahsaagent: RTL snippet copied. Paste in Developer Tools → Console."
        );
      } catch (err) {
        vscode.window.showErrorMessage(`Mahsaagent: ${err.message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mahsaagent.copyRtlRemove", async () => {
      try {
        const code = fs.readFileSync(removePath(), "utf8");
        await vscode.env.clipboard.writeText(code);
        vscode.window.showInformationMessage(
          "Mahsaagent: RTL remove snippet copied. Paste in Console to undo."
        );
      } catch (err) {
        vscode.window.showErrorMessage(`Mahsaagent: ${err.message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mahsaagent.showRtlHelp", () => {
      const doc = `
# Mahsaagent RTL

## اعمال
1. Command Palette → Mahsaagent: Copy RTL snippet
2. Help → Toggle Developer Tools → Console
3. Paste + Enter

## حذف
Mahsaagent: Copy RTL remove snippet → Console → Paste

بلوک‌های کد و Monaco همیشه LTR می‌مانند.
`.trim();
      const panel = vscode.window.createWebviewPanel(
        "mahsaagentRtlHelp",
        "Mahsaagent RTL",
        vscode.ViewColumn.Beside,
        {}
      );
      panel.webview.html = `<!DOCTYPE html><html lang="fa" dir="rtl"><body style="font-family: Vazirmatn, Tahoma, sans-serif; padding: 1.25rem; line-height: 1.8; white-space: pre-wrap;">${doc
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</body></html>`;
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
