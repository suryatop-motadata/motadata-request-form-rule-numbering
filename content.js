// ==UserScript==
// @name         Motadata – Rule Number Color by Execution
// @namespace    https://support.motadata.com/userscripts
// @version      1.1.0
// @description  Colors rule number based on Rule Execution On (Create/Edit/Create+Edit)
// @match        https://demo.motadataserviceops.com/admin/form-rules/request*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  console.log('✅ Motadata Rule Number Coloring Active');

  /* =========================
     COLOR ENUM (single source of truth)
     ========================= */
  const EXECUTION_COLOR = {
    'on create': 'green',
    'on edit': 'blue',
    'on create and edit': 'red'
  };

  /* =========================
     CSS INJECTION
     ========================= */
  function injectCSS() {
    if (document.getElementById('rule-number-style')) return;

    const style = document.createElement('style');
    style.id = 'rule-number-style';
    style.textContent = `
      .rule-no.green { color: #2e7d32; font-weight: 700; }
      .rule-no.blue  { color: #f3ef16ff; font-weight: 600; }
      .rule-no.red   { color: #d32f2f; font-weight: 700; }

      .edit-rule-no.green { color: #2e7d32; font-weight: 600; }
      .edit-rule-no.blue  { color: #f3ef16ff; font-weight: 600; }
      .edit-rule-no.red   { color: #d32f2f; font-weight: 600; }
    `;
    document.head.appendChild(style);
  }

  injectCSS();

  /* =========================
     LIST VIEW PROCESSING
     ========================= */

  function processListView() {
    document.querySelectorAll('tbody tr').forEach(row => {
      const nameCell = row.querySelector('td.resource-link.cursor-pointer');
      const execCell = row.querySelectorAll('td.text-ellipsis')[0];

      if (!nameCell || !execCell || nameCell.dataset.colored) return;

      const executionText = execCell.textContent.trim().toLowerCase();
      const colorClass = EXECUTION_COLOR[executionText];
      if (!colorClass) return;

      const text = nameCell.textContent.trim();
      const match = text.match(/^(\d+)\.\s*(.+)$/);
      if (!match) return;

      nameCell.innerHTML = `
        <span class="rule-no ${colorClass}">${match[1]}.</span> ${match[2]}
      `;
      nameCell.dataset.colored = 'true';
    });
  }
  /* =========================
   LIST VIEW – APPEND NEW RULE AT END
   ========================= */
// function processListView() {
//   const rows = Array.from(document.querySelectorAll('tbody tr'));

//   // Step 1: Collect existing numbers
//   const usedNumbers = new Set();

//   rows.forEach(row => {
//     const cell = row.querySelector('td.resource-link');
//     if (!cell) return;

//     const match = cell.textContent.trim().match(/^(\d+)\./);
//     if (match) {
//       usedNumbers.add(Number(match[1]));
//     }
//   });

//   const maxNumber = usedNumbers.size
//     ? Math.max(...usedNumbers)
//     : 0;

//   // Step 2: Fix only incorrect / new rows
//   rows.forEach(row => {
//     const nameCell = row.querySelector('td.resource-link.cursor-pointer');
//     const execCell = row.querySelectorAll('td.text-ellipsis')[0];
//     if (!nameCell || !execCell) return;

//     const executionText = execCell.textContent.trim().toLowerCase();
//     const colorClass = EXECUTION_COLOR[executionText];
//     if (!colorClass) return;

//     const text = nameCell.textContent.trim();
//     const match = text.match(/^(\d+)\.\s*(.+)$/);

//     // If number exists and is not duplicate → KEEP IT
//     if (match && usedNumbers.has(Number(match[1]))) {
//       nameCell.innerHTML = `
//         <span class="rule-no ${colorClass}">${match[1]}.</span> ${match[2]}
//       `;
//       return;
//     }

//     // Otherwise, this is a NEW rule → append at end
//     const ruleName = text.replace(/^\d+\.\s*/, '');
//     const newNumber = maxNumber + 1;

//     nameCell.innerHTML = `
//       <span class="rule-no ${colorClass}">${newNumber}.</span> ${ruleName}
//     `;

//     usedNumbers.add(newNumber);
//   });
// }
/* =========================
   LIST VIEW PROCESSING (FIXED)
   ========================= */
// function processListView() {
//   const rows = Array.from(document.querySelectorAll('tbody tr'));

//   // 1️⃣ Collect already-used numbers
//   const usedNumbers = new Set();

//   rows.forEach(row => {
//     const cell = row.querySelector('td.resource-link.cursor-pointer');
//     if (!cell) return;

//     const match = cell.textContent.trim().match(/^(\d+)\./);
//     if (match) {
//       usedNumbers.add(Number(match[1]));
//     }
//   });

//   let maxNumber = usedNumbers.size ? Math.max(...usedNumbers) : 0;

//   // 2️⃣ Process rows
//   rows.forEach(row => {
//     const nameCell = row.querySelector('td.resource-link.cursor-pointer');
//     const execCell = row.querySelectorAll('td.text-ellipsis')[0];

//     if (!nameCell || !execCell) return;

//     const executionText = execCell.textContent.trim().toLowerCase();
//     const colorClass = EXECUTION_COLOR[executionText];
//     if (!colorClass) return;

//     const rawText = nameCell.textContent.trim();
//     const match = rawText.match(/^(\d+)\.\s*(.+)$/);

//     // ✅ Existing rule → keep its number
//     if (match && usedNumbers.has(Number(match[1]))) {
//       nameCell.innerHTML = `
//         <span class="rule-no ${colorClass}">${match[1]}.</span> ${match[2]}
//       `;
//       return;
//     }

//     // ✅ New rule → append at end
//     const ruleName = rawText.replace(/^\d+\.\s*/, '');
//     maxNumber += 1;

//     nameCell.innerHTML = `
//       <span class="rule-no ${colorClass}">${maxNumber}.</span> ${ruleName}
//     `;

//     usedNumbers.add(maxNumber);
//   });
// }


  /* =========================
     EDIT VIEW PROCESSING
     ========================= */
  function processEditView() {
    const label = document.querySelector('.ant-form-item-label label');
    const input = document.querySelector('#name-input');
    if (!label || !input) return;
    if (label.querySelector('.edit-rule-no')) return;

    const ruleName = input.value.trim();
    if (!ruleName) return;

    const rows = Array.from(
      document.querySelectorAll('tbody tr')
    );

    const row = rows.find(r =>
      r.querySelector('td.resource-link')?.textContent.includes(ruleName)
    );
    if (!row) return;

    const execCell = row.querySelectorAll('td.text-ellipsis')[0];
    if (!execCell) return;

    const executionText = execCell.textContent.trim().toLowerCase();
    const colorClass = EXECUTION_COLOR[executionText];
    if (!colorClass) return;

    const index = rows.indexOf(row) + 1;

    const span = document.createElement('span');
    span.className = `edit-rule-no ${colorClass}`;
    span.textContent = ` (Rule #${index})`;

    label.appendChild(span);
  }

  /* =========================
     SPA OBSERVER
     ========================= */
  const observer = new MutationObserver(() => {
    processListView();
    processEditView();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  processListView();
})();
/* =====================================================
   MOTADATA – COLOR "Name" LABEL (SAFE)
   ===================================================== */

console.log('Motadata Name Label Coloring Active');

function colorNameLabelRed() {
  const label = document.querySelector(
    'label.ant-form-item-required.ant-form-item-no-colon[title="Name"]'
  );

  if (!label) return;

  // Prevent re-applying styles
  if (label.dataset.colored) return;

  label.style.color = '#d32f2f'; // red
  label.style.fontWeight = '600';

  label.dataset.colored = 'true';
}

/* -----------------------------------------------------
   Vue-safe observer (drawer + re-render safe)
----------------------------------------------------- */
const observer = new MutationObserver(() => {
  colorNameLabelRed();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
// ===============================
// Motadata Rule Number → Edit Page
// ===============================
(() => {
  'use strict';

  console.log('✅ Motadata Rule Number Injector Active');

  // -------------------------------
  // Helper: get rule map from list
  // -------------------------------
  function getRuleNumberMap() {
    const map = new Map();

    document.querySelectorAll('tbody tr').forEach(row => {
      const numberSpan = row.querySelector('.rule-no');
      const nameCell = row.querySelector('.resource-link');

      if (!numberSpan || !nameCell) return;

      const ruleNumber = numberSpan.textContent.trim(); // "1."
      const ruleName = nameCell.textContent
        .replace(ruleNumber, '')
        .trim();

      if (ruleName) {
        map.set(ruleName, ruleNumber);
      }
    });

    return map;
  }

  // -------------------------------
  // Inject number into Name label
  // -------------------------------
  function injectNumberIntoEdit() {
    const label = document.querySelector(
      'label.ant-form-item-required[title="Name"]'
    );

    if (!label) return;
    if (label.querySelector('.edit-rule-no')) return;

    // Read rule name safely (NO .trim() on undefined)
    const nameInput = document.querySelector(
      '#name-input input, #name-input textarea'
    );

    if (!nameInput || typeof nameInput.value !== 'string') return;

    const ruleName = nameInput.value.trim();
    if (!ruleName) return;

    const ruleMap = getRuleNumberMap();
    const ruleNumber = ruleMap.get(ruleName);
    if (!ruleNumber) return;

    // Create badge
    const badge = document.createElement('span');
    badge.className = 'edit-rule-no';
    badge.textContent = ` ${ruleNumber}`;
    badge.style.marginLeft = '6px';
    badge.style.fontWeight = '600';
    badge.style.color = label.style.color || '#d32f2f';

    label.appendChild(badge);
  }

  // -------------------------------
  // Observe SPA changes
  // -------------------------------
  const observer = new MutationObserver(() => {
    injectNumberIntoEdit();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  setTimeout(injectNumberIntoEdit, 800);
})();

//problem - use case - Solution 