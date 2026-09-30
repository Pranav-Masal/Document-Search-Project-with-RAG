const $ = (selector) => document.querySelector(selector);

const fileInput = $("#fileInput");
const dropzone = $("#dropzone");
const uploadProgress = $("#uploadProgress");
const documentList = $("#documentList");
const conversation = $("#conversation");
const queryForm = $("#queryForm");
const queryInput = $("#queryInput");
const askBtn = $("#askBtn");
const systemStatus = $("#systemStatus");


/* =========================
   UTILITIES
========================= */

function toast(message, error = false) {
  const item = document.createElement("div");

  item.className = `toast ${error ? "error" : ""}`;
  item.textContent = message;

  $("#toastContainer").appendChild(item);

  setTimeout(() => item.remove(), 3800);
}


function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}


/* =========================
   SIMPLE MARKDOWN RENDERER
========================= */

function renderMarkdown(text = "") {

  let html = escapeHtml(text);

  // Headings
  html = html.replace(
    /^### (.+)$/gm,
    "<h4>$1</h4>"
  );

  html = html.replace(
    /^## (.+)$/gm,
    "<h3>$1</h3>"
  );

  html = html.replace(
    /^# (.+)$/gm,
    "<h2>$1</h2>"
  );

  // Bold
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );

  // Bullet points
  html = html.replace(
    /^[\-\*] (.+)$/gm,
    "<li>$1</li>"
  );

  // Wrap consecutive list items
  html = html.replace(
    /((?:<li>.*<\/li>\s*)+)/g,
    "<ul>$1</ul>"
  );

  // Numbered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    "<li>$1</li>"
  );

  // Convert remaining line breaks
  html = html.replace(/\n{2,}/g, "</p><p>");
  html = html.replace(/\n/g, "<br>");

  return `<p>${html}</p>`;
}


async function readError(response) {
  try {
    const data = await response.json();
    return data.detail || "Something went wrong.";
  } catch {
    return `Request failed (${response.status}).`;
  }
}


/* =========================
   DOCUMENT MANAGEMENT
========================= */

async function refreshDocuments() {

  try {

    const response = await fetch("/api/documents");

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const data = await response.json();

    documentList.innerHTML = "";

    if (!data.documents.length) {

      documentList.innerHTML = `
        <div class="empty-state">
          No documents indexed yet.
        </div>
      `;
    }

    data.documents.forEach((doc) => {

      const row = document.createElement("div");

      row.className = "document-item";

      row.innerHTML = `
        <div class="file-icon">
          ${doc.name.split(".").pop().toUpperCase()}
        </div>

        <div class="doc-info">

          <strong title="${escapeHtml(doc.name)}">
            ${escapeHtml(doc.name)}
          </strong>

          <span>
            ${doc.chunks} indexed chunks
          </span>

        </div>

        <button
          class="delete-btn"
          title="Delete document"
        >
          ×
        </button>
      `;

      row
        .querySelector(".delete-btn")
        .addEventListener(
          "click",
          () => deleteDocument(doc.name)
        );

      documentList.appendChild(row);
    });


    const health = await fetch("/api/health")
      .then((r) => r.json());

    $("#docCount").textContent = health.documents;
    $("#chunkCount").textContent = health.chunks;

    systemStatus.textContent =
      health.groq_configured
        ? "Groq connected"
        : "Add Groq key";

  } catch (error) {

    toast(error.message, true);

  }
}


async function deleteDocument(name) {

  if (
    !confirm(
      `Delete "${name}" from the knowledge base?`
    )
  ) {
    return;
  }

  try {

    const response = await fetch(
      `/api/documents/${encodeURIComponent(name)}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    toast("Document removed.");

    await refreshDocuments();

  } catch (error) {

    toast(error.message, true);

  }
}


/* =========================
   FILE UPLOAD
========================= */

async function uploadFile(file) {

  if (!file) return;

  uploadProgress.classList.remove("hidden");

  $("#uploadText").textContent =
    `Indexing ${file.name}…`;

  const form = new FormData();

  form.append("file", file);

  try {

    const response = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: form
      }
    );

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const data = await response.json();

    toast(
      `${data.filename} indexed successfully.`
    );

    await refreshDocuments();

  } catch (error) {

    toast(error.message, true);

  } finally {

    uploadProgress.classList.add("hidden");

    fileInput.value = "";
  }
}


/* =========================
   SOURCE DISPLAY
========================= */

function renderSources(sources = []) {

  if (!sources.length) {
    return "";
  }

  return `
    <details class="sources-panel">

      <summary>

        <span class="sources-title">
          <span class="source-icon">◉</span>
          Sources
        </span>

        <span class="source-count">
          ${sources.length} relevant sections
        </span>

      </summary>

      <div class="sources-list">

        ${sources.map((source, index) => {

          const score =
            Math.round(
              Number(source.score) * 100
            );

          return `
            <div class="source-card">

              <div class="source-top">

                <div class="source-name">
                  <span class="document-icon">▤</span>

                  <strong>
                    ${escapeHtml(source.source)}
                  </strong>
                </div>

                <span class="source-number">
                  ${index + 1}
                </span>

              </div>

              <div class="source-meta">

                <span>
                  Retrieved section ${source.chunk}
                </span>

                <span>
                  Relevance ${score}%
                </span>

              </div>

              <div class="source-preview">
                ${escapeHtml(
                  source.text.slice(0, 300)
                )}
                ${source.text.length > 300 ? "…" : ""}
              </div>

            </div>
          `;

        }).join("")}

      </div>

    </details>
  `;
}


/* =========================
   CHAT MESSAGE
========================= */

function addMessage(
  role,
  content,
  sources = []
) {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    `message ${role}`;

  if (role === "user") {

    wrapper.innerHTML = `
      <div class="message-content">

        <div class="bubble user-bubble">
          ${escapeHtml(content)}
        </div>

        <div class="message-meta">
          You
        </div>

      </div>
    `;

  } else {

    wrapper.innerHTML = `
      <div class="message-content assistant-content">

        <div class="assistant-label">
          <span class="assistant-avatar">N</span>
          <span>DocuSCAN</span>
        </div>

        <div class="bubble assistant-bubble">

          <div class="answer-content">
            ${renderMarkdown(content)}
          </div>

        </div>

        ${renderSources(sources)}

        <div class="message-meta">
          AI-generated answer based on uploaded documents
        </div>

      </div>
    `;
  }

  conversation.appendChild(wrapper);

  conversation.scrollTop =
    conversation.scrollHeight;
}


/* =========================
   TYPING INDICATOR
========================= */

function showTyping() {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "message assistant";

  wrapper.id =
    "typingMessage";

  wrapper.innerHTML = `
    <div class="message-content">

      <div class="assistant-label">
        <span class="assistant-avatar">N</span>
        <span>DocuSCAN</span>
      </div>

      <div class="bubble assistant-bubble">

        <div class="typing">

          <i></i>
          <i></i>
          <i></i>

        </div>

      </div>

    </div>
  `;

  conversation.appendChild(wrapper);

  conversation.scrollTop =
    conversation.scrollHeight;
}


/* =========================
   ASK QUESTION
========================= */

async function askQuestion(question) {

  const clean =
    question.trim();

  if (!clean) return;

  addMessage(
    "user",
    clean
  );

  queryInput.value = "";

  queryInput.style.height =
    "auto";

  askBtn.disabled = true;

  showTyping();

  try {

    const response =
      await fetch(
        `/api/search?query=${encodeURIComponent(clean)}`,
        {
          method: "POST"
        }
      );

    if (!response.ok) {
      throw new Error(
        await readError(response)
      );
    }

    const data =
      await response.json();

    $("#typingMessage")?.remove();

    addMessage(
      "assistant",
      data.answer,
      data.sources
    );

  } catch (error) {

    $("#typingMessage")?.remove();

    addMessage(
      "assistant",
      `### Something went wrong\n\n${error.message}`
    );

    toast(
      error.message,
      true
    );

  } finally {

    askBtn.disabled = false;

    queryInput.focus();
  }
}


/* =========================
   DRAG & DROP
========================= */

fileInput.addEventListener(
  "change",
  (event) => {
    uploadFile(
      event.target.files[0]
    );
  }
);


["dragenter", "dragover"]
.forEach((eventName) => {

  dropzone.addEventListener(
    eventName,
    (event) => {

      event.preventDefault();

      dropzone.classList.add(
        "dragover"
      );

    }
  );

});


["dragleave", "drop"]
.forEach((eventName) => {

  dropzone.addEventListener(
    eventName,
    (event) => {

      event.preventDefault();

      dropzone.classList.remove(
        "dragover"
      );

    }
  );

});


dropzone.addEventListener(
  "drop",
  (event) => {

    uploadFile(
      event.dataTransfer.files[0]
    );

  }
);


/* =========================
   UI EVENTS
========================= */

$("#refreshBtn")
  .addEventListener(
    "click",
    refreshDocuments
  );


queryForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    askQuestion(
      queryInput.value
    );

  }
);


queryInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      queryForm.requestSubmit();

    }

  }
);


queryInput.addEventListener(
  "input",
  () => {

    queryInput.style.height =
      "auto";

    queryInput.style.height =
      `${Math.min(
        queryInput.scrollHeight,
        130
      )}px`;

  }
);


document
  .querySelectorAll("[data-question]")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        askQuestion(
          button.dataset.question
        );

      }
    );

  });


/* =========================
   INITIAL LOAD
========================= */

refreshDocuments();