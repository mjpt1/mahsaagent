/**
 * Mahsaagent RTL for Cursor (incl. Glass layout).
 *
 * HOW TO APPLY:
 * 1. Help → Toggle Developer Tools → Console
 * 2. Type: allow pasting
 * 3. Press Enter
 * 4. Paste this file and press Enter
 *
 * You should see: Mahsaagent RTL applied
 */
(function mahsaagentRtl() {
  const STYLE_ID = "mahsaagent-rtl-style";
  document.getElementById(STYLE_ID)?.remove();

  const CSS = `
/* —— chat / composer / glass —— */
.markdown-root,
.anysphere-markdown-container-root,
.markdown-section,
.composer-message-group,
[data-message-kind="assistant"] .markdown-root,
[data-message-kind="human"] .markdown-root,
.composer-human-message,
.composer-human-message-container,
.human-message-with-todos-wrapper,
.aislash-editor-input,
.aislash-editor-input-readonly,
[contenteditable="true"].aislash-editor-input,
.todo-list-container,
.ui-todo-list,
.todo-list,
.ui-todo-item,
.ui-todo-item__label,
.ui-todo-item__content,
#composer-toolbar-section,
.composer-questionnaire-toolbar,
.composer-questionnaire-toolbar-header,
.composer-questionnaire-toolbar-question-label,
.composer-questionnaire-toolbar-option,
.composer-questionnaire-toolbar-freeform-input,
.ui-step-group-header,
.ui-collapsible-header,
.composer-tool-former-message,
.tool-summary-hover-target,
[class*="composer-human"],
[class*="ComposerHuman"],
[class*="markdown-root"],
[class*="MarkdownRoot"],
[class*="agent-message"],
[class*="AgentMessage"],
[class*="chat-message"],
[class*="ChatMessage"] {
  direction: rtl !important;
  text-align: right !important;
}

.aislash-editor-placeholder,
[data-placeholder],
[class*="placeholder"] {
  direction: rtl !important;
  text-align: right !important;
  right: 15px !important;
  left: auto !important;
}

.markdown-root ul,
.markdown-root ol,
.markdown-section ul,
.markdown-section ol,
.list-disc,
.list-inside,
[data-streamdown="unordered-list"],
[data-streamdown="ordered-list"],
.ui-todo-list,
.todo-list {
  padding-right: 20px !important;
  padding-left: 0 !important;
  direction: rtl !important;
  text-align: right !important;
}

.ui-todo-item__indicator,
.todo-indicator-container {
  margin-left: 8px !important;
  margin-right: 0 !important;
}

.markdown-table-container {
  direction: ltr !important;
  overflow-x: auto !important;
  max-width: 100% !important;
  display: block !important;
}
table.markdown-table {
  direction: rtl !important;
  width: max-content !important;
  min-width: 100% !important;
  border-collapse: collapse !important;
}
.markdown-table th,
.markdown-table td {
  text-align: right !important;
}

/* keep code / editor LTR */
code,
pre,
.markdown-code-outer-container,
.cursor-code-block-content,
.composer-code-block-content,
.monaco-editor,
.ui-code-block,
.ui-default-code,
.composer-message-codeblock,
.markdown-root code,
.markdown-section code,
.terminal,
.xterm,
[class*="code-block"],
[class*="CodeBlock"] {
  direction: ltr !important;
  text-align: left !important;
  unicode-bidi: plaintext !important;
}
`;

  const style = document.createElement("style");
  style.id = STYLE_ID;

  // Avoid Trusted Types / CSP issues: never assign script; use text node for CSS
  try {
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      const policy =
        window.trustedTypes.createPolicy("mahsaagent-rtl-" + Date.now(), {
          createHTML: (s) => s,
        });
      // style tags accept HTML policy in some Chromium builds
      style.innerHTML = policy.createHTML(CSS);
    } else {
      style.appendChild(document.createTextNode(CSS));
    }
  } catch (_) {
    style.appendChild(document.createTextNode(CSS));
  }

  (document.head || document.documentElement).appendChild(style);
  console.log(
    "%c Mahsaagent RTL applied ",
    "background:#0f766e;color:#fff;font-size:13px;padding:4px 8px;border-radius:4px;"
  );
})();
