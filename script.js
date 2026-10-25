const pages = {
  home: null, // set dynamically by greeting
  reports: "Scan / Upload Report",
  medicines: "Medicine Reminders",
  folder: "Health Folder",
  emergency: "Emergency Help",
  profile: "My Health Profile"
};

const TIPS = [
  { title: "Small steps add up.", body: "Keep your reports organized, follow instructions from your healthcare professional, and bring questions about results to your next appointment." },
  { title: "Stay hydrated.", body: "Water supports energy, focus, and many everyday body functions. Aim for steady intake across the day unless your clinician advises otherwise." },
  { title: "Sleep is medicine.", body: "Consistent sleep helps recovery, mood, and focus. A regular bedtime routine often helps more than one late night catch-up." },
  { title: "Move a little every day.", body: "Even short walks count. Build activity that fits your schedule and any limits set by your healthcare professional." },
  { title: "Know your numbers.", body: "Understanding your own baseline results makes follow-up visits more useful. Save reports and note questions for your clinician." }
];

let medicines = [
  { id: 1, name: "Paracetamol 500mg", dose: "1 tablet · After food", time: "20:00", taken: false },
  { id: 2, name: "Vitamin D3 1000 IU", dose: "1 capsule · After food", time: "09:00", taken: true },
  { id: 3, name: "Metformin 500mg", dose: "1 tablet · After food", time: "21:00", taken: false },
  { id: 4, name: "Aspirin 75mg", dose: "1 tablet · Morning", time: "08:00", taken: false }
];

let reports = [
  { id: 1, name: "Complete Blood Count (CBC)", date: "12 Aug 2026", type: "Lab report", demo: true },
  { id: 2, name: "X-Ray Report", date: "05 Aug 2026", type: "Imaging report", demo: true },
  { id: 3, name: "Prescription", date: "02 Aug 2026", type: "Prescription", demo: true }
];

let contacts = [
  { id: 1, name: "Family contact (demo)", phone: "Add verified number", relation: "Family" },
  { id: 2, name: "Local emergency service", phone: "Verify local number", relation: "Emergency" }
];

let primaryEmergencyPhone = "";

let selectedFile = null;
const now = new Date();

/* ---------- Persistence ---------- */
function persistDemo() {
  try {
    localStorage.setItem("selfdoc_medicines_v1", JSON.stringify(medicines));
    localStorage.setItem("selfdoc_reports_v1", JSON.stringify(reports));
    localStorage.setItem("selfdoc_contacts_v1", JSON.stringify(contacts));
    localStorage.setItem("selfdoc_emergency_phone_v1", primaryEmergencyPhone || "");
    const profile = {
      name: document.getElementById("nameField")?.value || "Harshil Kumar",
      email: document.getElementById("emailField")?.value || "",
      dob: document.getElementById("dobField")?.value || ""
    };
    localStorage.setItem("selfdoc_profile_v1", JSON.stringify(profile));
  } catch (e) {}
}

function restoreDemo() {
  try {
    const m = localStorage.getItem("selfdoc_medicines_v1");
    const r = localStorage.getItem("selfdoc_reports_v1");
    const c = localStorage.getItem("selfdoc_contacts_v1");
    const p = localStorage.getItem("selfdoc_profile_v1");
    const ep = localStorage.getItem("selfdoc_emergency_phone_v1");
    if (m) medicines = JSON.parse(m);
    if (r) reports = JSON.parse(r);
    if (c) contacts = JSON.parse(c);
    if (ep) primaryEmergencyPhone = ep;
    if (p) {
      const v = JSON.parse(p);
      const nameField = document.getElementById("nameField");
      const emailField = document.getElementById("emailField");
      const dobField = document.getElementById("dobField");
      if (nameField) nameField.value = v.name || "Harshil Kumar";
      if (emailField) emailField.value = v.email || "";
      if (dobField) dobField.value = v.dob || "";
      applyProfileName(v.name || "Harshil Kumar");
    }
  } catch (e) {}
}

function resetDemoData() {
  if (!confirm("Clear all demo medicines, reports, contacts, and profile saved in this browser?")) return;
  localStorage.removeItem("selfdoc_medicines_v1");
  localStorage.removeItem("selfdoc_reports_v1");
  localStorage.removeItem("selfdoc_contacts_v1");
  localStorage.removeItem("selfdoc_profile_v1");
  localStorage.removeItem("selfdoc_emergency_phone_v1");
  location.reload();
}

/* ---------- Navigation & greeting ---------- */
function greetingForHour(h) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function applyProfileName(name) {
  const safe = name || "Harshil Kumar";
  const profileName = document.getElementById("profileName");
  const sidebarName = document.getElementById("sidebarName");
  if (profileName) profileName.textContent = safe;
  if (sidebarName) sidebarName.textContent = safe;
  const first = safe.split(/\s+/)[0] || "there";
  pages.home = `${greetingForHour(now.getHours())}, ${first} 👋`;
  const heading = document.getElementById("pageHeading");
  if (heading && document.getElementById("page-home")?.classList.contains("active")) {
    heading.textContent = pages.home;
  }
}

function navigate(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.querySelectorAll("[data-page]").forEach((b) =>
    b.classList.toggle("active", b.dataset.page === page)
  );
  const title = pages[page] || "SelfDoc AI";
  document.getElementById("pageHeading").textContent = title;
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (page === "medicines") renderMedicines();
  if (page === "folder") renderReports();
  if (page === "home") renderHome();
  if (page === "emergency") {
    updateEmergencyUI();
    renderContacts();
  }
}

document.querySelectorAll("[data-page]").forEach((b) =>
  b.addEventListener("click", () => navigate(b.dataset.page))
);

document.getElementById("eyebrow").textContent = now
  .toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
  .toUpperCase();

/* ---------- Helpers ---------- */
function fmtTime(t) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function profileCompleteness() {
  const name = (document.getElementById("nameField")?.value || "").trim();
  const email = (document.getElementById("emailField")?.value || "").trim();
  const dob = (document.getElementById("dobField")?.value || "").trim();
  let score = 40; // base for having a name slot
  if (name && name !== "Harshil Kumar") score += 20;
  else if (name) score += 15;
  if (email) score += 25;
  if (dob) score += 20;
  return Math.min(100, score);
}

/* ---------- Home ---------- */
function renderHome() {
  const due = medicines.filter((m) => !m.taken).sort((a, b) => a.time.localeCompare(b.time));
  document.getElementById("medicineCount").textContent = due.length;
  document.getElementById("medicineSub").textContent = due.length
    ? `${due.length} dose${due.length === 1 ? "" : "s"} not marked taken`
    : "All demo doses marked taken";
  document.getElementById("nextReminder").textContent = due.length ? fmtTime(due[0].time) : "All done";
  document.getElementById("reportCount").textContent = reports.length;

  const pct = profileCompleteness();
  document.getElementById("profilePct").textContent = pct + "%";
  document.getElementById("profilePctSub").textContent =
    pct >= 100 ? "Profile looks complete" : "Complete your profile";

  document.getElementById("homeMeds").innerHTML = medicines
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3)
    .map(
      (m) => `<div class="med-row">
        <div class="pill-icon" aria-hidden="true">💊</div>
        <div class="row-main"><b>${esc(m.name)}</b><small>${esc(m.dose)} · ${fmtTime(m.time)}</small></div>
        <span class="status ${m.taken ? "" : "low"}">${m.taken ? "✓ Taken" : "Pending"}</span>
      </div>`
    )
    .join("");

  // rotate tip by day of year
  const day = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(now.getFullYear(), 0, 0)) /
      86400000
  );
  const tip = TIPS[day % TIPS.length];
  const tipEl = document.getElementById("healthTip");
  if (tipEl) tipEl.innerHTML = `<b>${esc(tip.title)}</b><br>${esc(tip.body)}`;
}

/* ---------- Medicines ---------- */
function renderMedicines() {
  const q = (document.getElementById("medSearch")?.value || "").toLowerCase();
  const list = medicines
    .filter((m) => m.name.toLowerCase().includes(q))
    .sort((a, b) => a.time.localeCompare(b.time));

  document.getElementById("medicineList").innerHTML = list.length
    ? list
        .map(
          (m) => `<div class="medicine-card">
            <div class="pill-icon" aria-hidden="true">💊</div>
            <div class="row-main">
              <b>${esc(m.name)}</b>
              <small>${esc(m.dose)}</small>
              <small>Reminder: ${fmtTime(m.time)}</small>
            </div>
            <button class="taken ${m.taken ? "done" : ""}" type="button" onclick="toggleTaken(${m.id})">
              ${m.taken ? "✓ Taken" : "Mark taken"}
            </button>
          </div>`
        )
        .join("")
    : `<div class="panel empty">No medicines match your search.</div>`;
  renderHome();
}

function toggleTaken(id) {
  const m = medicines.find((x) => x.id === id);
  if (m) {
    m.taken = !m.taken;
    renderMedicines();
    persistDemo();
    toast(m.taken ? "Marked as taken in this demo" : "Marked as pending");
  }
}

/* ---------- Reports ---------- */
function renderReports() {
  const q = (document.getElementById("reportSearch")?.value || "").toLowerCase();
  const list = reports.filter((r) => r.name.toLowerCase().includes(q));
  document.getElementById("folderCount").textContent =
    `${reports.length} report${reports.length === 1 ? "" : "s"}`;
  document.getElementById("reportList").innerHTML = list.length
    ? list
        .map((r) => {
          const icon = r.type.includes("Imaging")
            ? "🩻"
            : r.type.includes("Prescription")
              ? "💊"
              : "📄";
          return `<div class="report-row">
            <div class="file-icon" aria-hidden="true">${icon}</div>
            <div class="row-main">
              <b>${esc(r.name)}</b>
              <small>${esc(r.date)} · ${esc(r.type)}${r.demo ? " · Demo entry" : ""}</small>
            </div>
            <button class="secondary" type="button" onclick="removeReport(${r.id})">Remove</button>
          </div>`;
        })
        .join("")
    : `<div class="empty">No reports found. Upload a report to add a demo entry.</div>`;
}

function removeReport(id) {
  if (!confirm("Remove this report from the demo folder?")) return;
  reports = reports.filter((r) => r.id !== id);
  renderReports();
  renderHome();
  persistDemo();
  toast("Report removed from this demo list");
}

/* ---------- Emergency call ---------- */
function normalizePhone(raw) {
  return String(raw || "").trim();
}

function isCallablePhone(phone) {
  const cleaned = normalizePhone(phone).replace(/[^\d+]/g, "");
  // At least 2–3 digits so placeholders like "Add verified number" are rejected
  const digits = cleaned.replace(/\D/g, "");
  return digits.length >= 2 && digits.length <= 15;
}

function updateEmergencyUI() {
  const input = document.getElementById("primaryEmergencyPhone");
  const label = document.getElementById("emergencyNumLabel");
  const status = document.getElementById("primaryStatus");
  const btn = document.getElementById("emergencyCallBtn");
  if (input) input.value = primaryEmergencyPhone || "";
  const has = isCallablePhone(primaryEmergencyPhone);
  if (label) {
    label.textContent = has
      ? `Primary: ${primaryEmergencyPhone}`
      : "Set a number below";
  }
  if (status) {
    status.textContent = has ? "Ready" : "Not set";
    status.classList.toggle("low", !has);
  }
  if (btn) {
    btn.disabled = false;
    btn.title = has
      ? `Call ${primaryEmergencyPhone}`
      : "Set a primary emergency number first";
  }
}

function savePrimaryEmergency() {
  const input = document.getElementById("primaryEmergencyPhone");
  const val = normalizePhone(input?.value);
  if (!val) {
    toast("Enter an emergency number first");
    return;
  }
  if (!isCallablePhone(val)) {
    toast("Enter a valid phone number (digits only)");
    return;
  }
  primaryEmergencyPhone = val;
  persistDemo();
  updateEmergencyUI();
  toast("Primary emergency number saved");
}

function placeEmergencyCall() {
  if (!isCallablePhone(primaryEmergencyPhone)) {
    toast("Set a verified local emergency number first");
    const input = document.getElementById("primaryEmergencyPhone");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }
  const num = primaryEmergencyPhone;
  const ok = confirm(
    `Call emergency number ${num}?\n\nThis will open your device dialer. Only continue if this is a real emergency and the number is correct for your location.`
  );
  if (!ok) return;
  // Open system dialer (mobile) / telephony handler (desktop if available)
  window.location.href = "tel:" + encodeURIComponent(num.replace(/\s+/g, ""));
  toast("Opening dialer…");
}

function callContact(id) {
  const c = contacts.find((x) => x.id === id);
  if (!c) return;
  if (!isCallablePhone(c.phone)) {
    toast("This contact has no valid phone number. Edit or add a real number.");
    return;
  }
  const ok = confirm(`Call ${c.name} at ${c.phone}?`);
  if (!ok) return;
  window.location.href = "tel:" + encodeURIComponent(c.phone.replace(/\s+/g, ""));
  toast("Opening dialer…");
}

function setPrimaryFromContact(id) {
  const c = contacts.find((x) => x.id === id);
  if (!c || !isCallablePhone(c.phone)) {
    toast("Contact needs a valid phone number first");
    return;
  }
  primaryEmergencyPhone = normalizePhone(c.phone);
  persistDemo();
  updateEmergencyUI();
  toast(`Primary emergency set to ${c.phone}`);
}

/* ---------- Contacts ---------- */
function renderContacts() {
  document.getElementById("contactList").innerHTML = contacts.length
    ? contacts
        .map((c) => {
          const canCall = isCallablePhone(c.phone);
          return `<div class="contact-row">
        <div class="avatar" aria-hidden="true">👤</div>
        <div class="row-main">
          <b>${esc(c.name)}</b>
          <small>${esc(c.relation)} · ${esc(c.phone)}</small>
        </div>
        <div class="contact-actions">
          ${
            canCall
              ? `<button class="danger call-btn" type="button" onclick="callContact(${c.id})" title="Call">☎ Call</button>
                 <button class="secondary" type="button" onclick="setPrimaryFromContact(${c.id})" title="Set as primary emergency">★ Primary</button>`
              : `<button class="secondary" type="button" disabled title="No valid number">No number</button>`
          }
          <button class="secondary" type="button" onclick="removeContact(${c.id})">Remove</button>
        </div>
      </div>`;
        })
        .join("")
    : `<div class="empty">No contacts yet. Add a family member or local emergency service.</div>`;
}

function removeContact(id) {
  if (!confirm("Remove this contact?")) return;
  contacts = contacts.filter((c) => c.id !== id);
  renderContacts();
  persistDemo();
  toast("Contact removed");
}

/* ---------- Modals ---------- */
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.add("show");
  const first = el.querySelector("input");
  if (first) setTimeout(() => first.focus(), 50);
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.show").forEach((m) => m.classList.remove("show"));
  }
});

document.getElementById("medicineForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  medicines.push({
    id: Date.now(),
    name: f.get("name").trim(),
    dose: f.get("dose").trim() || "Follow your prescription",
    time: f.get("time"),
    taken: false
  });
  e.target.reset();
  document.getElementById("medTime").value = "20:00";
  closeModal("medicineModal");
  renderMedicines();
  persistDemo();
  toast("Medicine added to demo list");
});

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  contacts.push({
    id: Date.now(),
    name: f.get("name").trim(),
    phone: f.get("phone").trim(),
    relation: f.get("relation").trim() || "Contact"
  });
  e.target.reset();
  closeModal("contactModal");
  renderContacts();
  persistDemo();
  toast("Contact saved in this demo");
});

/* ---------- File upload + OCR / PDF ---------- */
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

function handleFile(f) {
  if (!f) return;
  selectedFile = f;
  document.getElementById("fileName").textContent = f.name;
  document.getElementById("fileSize").textContent =
    `${(f.size / 1024).toFixed(0)} KB · Selected on this device`;

  const preview = document.getElementById("filePreview");
  const icon = document.getElementById("fileIcon");
  const existingThumb = document.getElementById("thumb");

  if (f.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.alt = "Selected report preview";
    img.id = "thumb";
    img.src = URL.createObjectURL(f);
    if (existingThumb) existingThumb.replaceWith(img);
    else if (icon) icon.replaceWith(img);
  } else {
    if (existingThumb) {
      const newIcon = document.createElement("div");
      newIcon.className = "file-icon";
      newIcon.id = "fileIcon";
      newIcon.setAttribute("aria-hidden", "true");
      newIcon.textContent = "📄";
      existingThumb.replaceWith(newIcon);
    } else if (icon) {
      icon.textContent = "📄";
    }
  }
  preview.classList.add("show");
  toast("File selected. This demo does not upload it to a server.");
}

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

dropzone.addEventListener("click", (e) => {
  if (e.target.closest("button")) return;
  fileInput.click();
});

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

["dragenter", "dragover"].forEach((ev) => {
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((ev) => {
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
  });
});

dropzone.addEventListener("drop", (e) => {
  const f = e.dataTransfer.files?.[0];
  if (f) handleFile(f);
});

function clearFile() {
  selectedFile = null;
  fileInput.value = "";
  document.getElementById("filePreview").classList.remove("show");
  const old = document.getElementById("thumb");
  if (old) {
    const icon = document.createElement("div");
    icon.className = "file-icon";
    icon.id = "fileIcon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "📄";
    old.replaceWith(icon);
  }
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) throw new Error("PDF.js not loaded");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const maxPages = Math.min(pdf.numPages, 5);
  const parts = [];
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it) => it.str).join(" ");
    if (text.trim()) parts.push(`--- Page ${i} ---\n${text.trim()}`);
  }
  return parts.join("\n\n") || "";
}

async function showExplanation() {
  const results = document.getElementById("results");
  const out = document.getElementById("ocrOutput");
  const banner = document.getElementById("resultBanner");
  const status = document.getElementById("resultStatus");

  results.classList.add("show");
  results.scrollIntoView({ behavior: "smooth", block: "nearest" });

  if (!selectedFile) {
    out.style.display = "none";
    status.textContent = "Demo data";
    banner.innerHTML =
      "<b>Example only:</b> The table below contains fictional sample values. Upload an image or text PDF to try extraction. AI interpretation is not connected in this frontend.";
    toast("Showing fictional sample results");
    return;
  }

  const isImage = selectedFile.type.startsWith("image/");
  const isPdf =
    selectedFile.type === "application/pdf" ||
    selectedFile.name.toLowerCase().endsWith(".pdf");

  if (isImage) {
    if (!window.Tesseract) {
      banner.textContent =
        "OCR library could not load. Check your internet connection, or use the sample explanation below.";
      toast("OCR library unavailable");
      return;
    }
    banner.innerHTML =
      "<b>Working:</b> Reading text from your selected image in your browser. This may take a little while.";
    status.textContent = "Reading image…";
    out.style.display = "block";
    out.textContent = "Preparing OCR…";

    try {
      const worker = await Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            out.textContent = "Reading image… " + Math.round((m.progress || 0) * 100) + "%";
          }
        }
      });
      const result = await worker.recognize(selectedFile);
      await worker.terminate();
      const text = (result.data.text || "").trim();
      out.textContent = text || "No readable text was detected. Try a clearer, well-lit image.";
      banner.innerHTML =
        "<b>OCR complete:</b> Text below was extracted from your selected image. It has not been medically verified, and no AI diagnosis has been generated.";
      status.textContent = "OCR complete";
      toast(text ? "Report text extracted" : "No text detected");
    } catch (err) {
      out.textContent = "Could not read this image. Try a clearer image or use the sample demo.";
      banner.innerHTML =
        "<b>OCR unavailable:</b> Check your internet connection and try again. Your file is not sent to a SelfDoc server by this frontend.";
      status.textContent = "OCR failed";
      toast("Could not extract text");
    }
  } else if (isPdf) {
    out.style.display = "block";
    out.textContent = "Extracting text from PDF…";
    banner.innerHTML = "<b>Working:</b> Reading text from the selected PDF in your browser.";
    status.textContent = "Reading PDF…";

    try {
      const text = await extractPdfText(selectedFile);
      if (text) {
        out.textContent = text;
        banner.innerHTML =
          "<b>PDF text extracted:</b> Text below came from the first pages of your file. Scanned image-only PDFs may need OCR on exported images instead.";
        status.textContent = "PDF text ready";
        toast("PDF text extracted");
      } else {
        out.textContent =
          "No extractable text found. This may be a scanned (image-only) PDF. Export a page as an image and try OCR.";
        banner.innerHTML =
          "<b>No text layer:</b> This PDF appears to be image-based. Use an image for the live OCR demo.";
        status.textContent = "No text layer";
        toast("No text found in PDF");
      }
    } catch (err) {
      out.textContent = "Could not read this PDF. Try another file or use an image.";
      banner.innerHTML =
        "<b>PDF read failed:</b> Your file stays on this device. Try a different PDF or an image for OCR.";
      status.textContent = "PDF failed";
      toast("Could not read PDF");
    }
  } else {
    out.style.display = "block";
    out.textContent = "This file type is not supported for extraction. Please choose an image or PDF.";
    status.textContent = "Unsupported file";
    toast("Choose a report image or PDF");
  }
}

function saveReport() {
  const name = selectedFile ? selectedFile.name : "Sample CBC report (demo)";
  reports.unshift({
    id: Date.now(),
    name,
    date: now.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    type: "Uploaded demo",
    demo: true
  });
  renderReports();
  renderHome();
  persistDemo();
  toast("Demo report entry saved to your folder");
}

function saveProfile() {
  const name = document.getElementById("nameField").value.trim() || "Your profile";
  applyProfileName(name);
  document.getElementById("pageHeading").textContent = pages.profile;
  persistDemo();
  renderHome();
  toast("Profile updated in this demo");
}

/* ---------- Boot ---------- */
restoreDemo();
applyProfileName(document.getElementById("nameField")?.value || "Harshil Kumar");
renderHome();
renderMedicines();
renderReports();
renderContacts();
updateEmergencyUI();
