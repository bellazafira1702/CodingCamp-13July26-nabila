/* js/app.js — Todo List Life Dashboard application logic */

// =============================================================================
// StorageService — Enkapsulasi operasi Local Storage (get & set dengan error handling)
// Requirements: 5.2, 3.8, 3.9, 4.6, 4.7
// =============================================================================

const StorageService = {
  /**
   * Baca nilai dari Local Storage berdasarkan key.
   * Kembalikan `fallback` jika key tidak ada atau data corrupt (parse gagal).
   * @param {string} key
   * @param {*} [fallback=[]] — nilai default jika key tidak ada atau JSON.parse gagal
   * @returns {*} nilai yang di-parse, atau fallback
   */
  get(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      // JSON.parse gagal (data corrupt) — kembalikan fallback (Req 3.9, 4.7)
      return fallback;
    }
  },

  /**
   * Tulis nilai ke Local Storage sebagai JSON string.
   * Tangkap QuotaExceededError dan log ke console (Req 3.8, 4.6).
   * @param {string} key
   * @param {*} value — nilai yang akan di-JSON.stringify dan disimpan
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  },
};

// =============================================================================
// GreetingWidget — Menampilkan waktu, tanggal, dan salam berdasarkan Time_Of_Day
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
// =============================================================================

const GreetingWidget = (function () {

  /**
   * Format objek Date menjadi string "HH:MM:SS" dengan zero-padding.
   * @param {Date} date
   * @returns {string} contoh: "08:05:03"
   */
  function formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  /**
   * Format objek Date menjadi string tanggal panjang bahasa Indonesia.
   * Menggunakan Intl.DateTimeFormat locale id-ID.
   * @param {Date} date
   * @returns {string} contoh: "Jumat, 18 Juli 2025"
   */
  function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Tentukan kategori Time_Of_Day berdasarkan nilai jam (0–23).
   * | 05–11 | Pagi  |
   * | 12–14 | Siang |
   * | 15–17 | Sore  |
   * | 18–04 | Malam |
   * @param {number} hour — integer 0–23
   * @returns {'Pagi'|'Siang'|'Sore'|'Malam'}
   */
  function getTimeOfDay(hour) {
    if (hour >= 5 && hour <= 11) return 'Pagi';
    if (hour >= 12 && hour <= 14) return 'Siang';
    if (hour >= 15 && hour <= 17) return 'Sore';
    return 'Malam'; // 18–04
  }

  /**
   * Kembalikan string salam + emoji sesuai kategori Time_Of_Day.
   * @param {'Pagi'|'Siang'|'Sore'|'Malam'} timeOfDay
   * @returns {string}
   */
  function getGreetingMessage(timeOfDay) {
    switch (timeOfDay) {
      case 'Pagi':  return 'Selamat Pagi! ☀️';
      case 'Siang': return 'Selamat Siang! 🌤️';
      case 'Sore':  return 'Selamat Sore! 🌅';
      case 'Malam': return 'Selamat Malam! 🌙';
      default:      return 'Selamat Malam! 🌙';
    }
  }

  /**
   * Update elemen-elemen DOM dengan data waktu terkini.
   * @param {{ time: string, date: string, message: string }} data
   */
  function render(data) {
    const timeEl    = document.getElementById('greeting-time');
    const dateEl    = document.getElementById('greeting-date');
    const messageEl = document.getElementById('greeting-message');

    if (timeEl)    timeEl.textContent    = data.time;
    if (dateEl)    dateEl.textContent    = data.date;
    if (messageEl) messageEl.textContent = data.message;
  }

  /**
   * Dipanggil setiap detik oleh setInterval.
   * Mengambil waktu saat ini, menghitung semua data, lalu memanggil render().
   */
  function tick() {
    const now       = new Date();
    const timeOfDay = getTimeOfDay(now.getHours());

    render({
      time:    formatTime(now),
      date:    formatDate(now),
      message: getGreetingMessage(timeOfDay),
    });
  }

  /**
   * Inisialisasi GreetingWidget.
   * Panggil tick() sekali langsung, lalu jadwalkan ulang setiap 1 detik.
   */
  function init() {
    tick();
    setInterval(tick, 1000);
  }

  // Ekspor public API — termasuk fungsi-fungsi pure agar dapat diuji
  return {
    init,
    tick,
    getTimeOfDay,
    getGreetingMessage,
    formatTime,
    formatDate,
    render,
  };
})();

// =============================================================================
// FocusTimer — Timer Pomodoro hitung mundur 25:00 dengan kontrol Start/Stop/Reset
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
// =============================================================================

const FocusTimer = (function () {

  // State internal
  let totalSeconds = 1500; // 25 menit = 1500 detik (Req 2.1)
  let intervalId   = null;
  let isRunning    = false;

  /**
   * Format total detik menjadi string "MM:SS" dengan zero-padding.
   * @param {number} secs — jumlah detik (non-negative integer)
   * @returns {string} contoh: "25:00", "04:59"
   */
  function formatDisplay(secs) {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  /**
   * Update elemen #timer-display dengan waktu yang diformat.
   */
  function render() {
    const displayEl = document.getElementById('timer-display');
    if (displayEl) {
      displayEl.textContent = formatDisplay(totalSeconds);
    }
  }

  /**
   * Mulai hitungan mundur.
   * Guard: tidak melakukan apa-apa jika timer sudah berjalan (Req 2.2).
   */
  function start() {
    if (isRunning) return; // guard ganda-start
    isRunning  = true;
    intervalId = setInterval(tick, 1000); // update tiap 1 detik (Req 2.3)
  }

  /**
   * Hentikan hitungan mundur, pertahankan sisa waktu (Req 2.4).
   */
  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;
  }

  /**
   * Reset timer: hentikan dan kembalikan ke 25:00 (Req 2.5).
   */
  function reset() {
    stop();
    totalSeconds = 1500;
    render();
  }

  /**
   * Dipanggil setiap detik oleh setInterval.
   * Kurangi satu detik, render, dan cek apakah sudah 00:00 (Req 2.3, 2.6).
   */
  function tick() {
    totalSeconds -= 1;
    render();
    if (totalSeconds <= 0) {
      stop();
      notifyComplete(); // Req 2.6
    }
  }

  /**
   * Notifikasi kepada pengguna bahwa sesi fokus telah selesai (Req 2.6).
   */
  function notifyComplete() {
    alert('Sesi fokus selesai! Waktunya istirahat.');
  }

  /**
   * Inisialisasi FocusTimer.
   * Bind event listener ke tombol Start/Stop/Reset, lalu render tampilan awal.
   */
  function init() {
    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');

    if (startBtn) startBtn.addEventListener('click', start);
    if (stopBtn)  stopBtn.addEventListener('click', stop);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    render(); // tampilkan "25:00" saat halaman dimuat (Req 2.1)
  }

  // Ekspor public API — termasuk fungsi pure agar dapat diuji
  return {
    init,
    start,
    stop,
    reset,
    tick,
    notifyComplete,
    formatDisplay,
    render,
    // Getters untuk akses state internal di unit/property tests
    getTotalSeconds: () => totalSeconds,
    getIsRunning:    () => isRunning,
    // Setter untuk menyiapkan state dari luar (digunakan oleh property tests)
    setTotalSeconds: (secs) => { totalSeconds = secs; },
    setIsRunning:    (val)  => { isRunning    = val;  },
  };
})();

// =============================================================================
// TodoList — Manajemen tugas CRUD dengan persistensi Local Storage
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
// =============================================================================

const TodoList = (function () {

  // State internal
  let tasks = []; // array of Task object
  let editingId = null; // id task yang sedang dalam mode edit

  /**
   * Generate ID unik berbasis timestamp.
   * @returns {string} contoh: "task_1721234567890"
   */
  function generateId() {
    return 'task_' + Date.now();
  }

  /**
   * Validasi teks input: tidak boleh kosong atau whitespace-only.
   * @param {string} text
   * @returns {boolean}
   */
  function validateInput(text) {
    return text.trim().length > 0;
  }

  /**
   * Muat daftar task dari Local Storage.
   * @returns {Task[]}
   */
  function loadFromStorage() {
    return StorageService.get('dashboard_tasks', []);
  }

  /**
   * Simpan daftar task ke Local Storage.
   */
  function saveToStorage() {
    StorageService.set('dashboard_tasks', tasks);
  }

  /**
   * Tampilkan atau sembunyikan pesan validasi di bawah #task-input.
   * @param {string} message — string kosong untuk menyembunyikan pesan
   */
  function setValidationMessage(message) {
    let msgEl = document.getElementById('task-validation-msg');
    if (!msgEl) {
      // Buat elemen validasi jika belum ada
      msgEl = document.createElement('p');
      msgEl.id = 'task-validation-msg';
      msgEl.setAttribute('role', 'alert');
      msgEl.setAttribute('aria-live', 'assertive');
      msgEl.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin: 0.25rem 0 0; min-height: 1.2em;';
      const inputGroup = document.querySelector('.task-input-group');
      if (inputGroup) inputGroup.insertAdjacentElement('afterend', msgEl);
    }
    msgEl.textContent = message;
  }

  /**
   * Tambah task baru ke daftar.
   * Guard: tidak menambahkan jika teks tidak valid.
   * @param {string} text
   */
  function addTask(text) {
    if (!validateInput(text)) {
      setValidationMessage('Teks tugas tidak boleh kosong.');
      return;
    }
    setValidationMessage('');

    const task = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    tasks.push(task);
    saveToStorage();
    render();

    // Kosongkan input setelah berhasil menambah
    const inputEl = document.getElementById('task-input');
    if (inputEl) inputEl.value = '';
  }

  /**
   * Hapus task berdasarkan id.
   * @param {string} id
   */
  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToStorage();
    render();
  }

  /**
   * Toggle status completed task berdasarkan id.
   * @param {string} id
   */
  function toggleTask(id) {
    tasks = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveToStorage();
    render();
  }

  /**
   * Aktifkan mode inline edit untuk task tertentu.
   * @param {string} id
   */
  function startEdit(id) {
    editingId = id;
    render();
    // Fokuskan input edit setelah render
    const editInput = document.querySelector(`[data-edit-id="${id}"]`);
    if (editInput) {
      editInput.focus();
      // Pindahkan kursor ke akhir teks
      const len = editInput.value.length;
      editInput.setSelectionRange(len, len);
    }
  }

  /**
   * Simpan teks baru hasil edit. Guard: tidak menyimpan jika teks tidak valid.
   * @param {string} id
   * @param {string} text — teks baru dari input edit
   */
  function confirmEdit(id, text) {
    if (!validateInput(text)) {
      // Tampilkan validasi di dalam item task (tidak ubah state)
      const editInput = document.querySelector(`[data-edit-id="${id}"]`);
      if (editInput) {
        editInput.style.borderColor = '#e74c3c';
        editInput.setAttribute('aria-invalid', 'true');
        editInput.setAttribute('title', 'Teks tugas tidak boleh kosong.');
        editInput.focus();
      }
      return;
    }
    tasks = tasks.map(t =>
      t.id === id ? { ...t, text: text.trim() } : t
    );
    editingId = null;
    saveToStorage();
    render();
  }

  /**
   * Batalkan mode edit dan kembalikan tampilan normal.
   * @param {string} id
   */
  function cancelEdit(id) {
    editingId = null;
    render();
  }

  /**
   * Render ulang seluruh daftar task ke #task-list.
   * Setiap task: checkbox, teks (atau input saat edit), tombol Edit, tombol Hapus.
   */
  function render() {
    const listEl = document.getElementById('task-list');
    if (!listEl) return;

    if (tasks.length === 0) {
      listEl.innerHTML = '<li class="task-empty">Belum ada tugas. Tambahkan tugas pertamamu!</li>';
      return;
    }

    listEl.innerHTML = tasks.map(task => {
      const isEditing = task.id === editingId;
      const completedClass = task.completed ? ' completed' : '';

      if (isEditing) {
        // Mode edit inline
        return `
          <li class="task-item${completedClass}" data-id="${task.id}" role="listitem">
            <input
              type="checkbox"
              class="task-checkbox"
              ${task.completed ? 'checked' : ''}
              aria-label="Tandai tugas selesai: ${escapeHtml(task.text)}"
              data-toggle-id="${task.id}"
            />
            <input
              type="text"
              class="task-edit-input"
              value="${escapeHtml(task.text)}"
              data-edit-id="${task.id}"
              aria-label="Edit teks tugas"
            />
            <div class="task-actions">
              <button
                class="btn btn-small btn-primary"
                data-confirm-id="${task.id}"
                aria-label="Konfirmasi edit tugas"
              >Simpan</button>
              <button
                class="btn btn-small btn-secondary"
                data-cancel-id="${task.id}"
                aria-label="Batalkan edit tugas"
              >Batal</button>
            </div>
          </li>`;
      }

      // Mode tampilan normal
      return `
        <li class="task-item${completedClass}" data-id="${task.id}" role="listitem">
          <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? 'checked' : ''}
            aria-label="Tandai tugas selesai: ${escapeHtml(task.text)}"
            data-toggle-id="${task.id}"
          />
          <span class="task-text">${escapeHtml(task.text)}</span>
          <div class="task-actions">
            <button
              class="btn btn-small btn-secondary"
              data-edit-btn-id="${task.id}"
              aria-label="Edit tugas: ${escapeHtml(task.text)}"
            >Edit</button>
            <button
              class="btn btn-small btn-danger"
              data-delete-id="${task.id}"
              aria-label="Hapus tugas: ${escapeHtml(task.text)}"
            >Hapus</button>
          </div>
        </li>`;
    }).join('');
  }

  /**
   * Escape karakter HTML khusus untuk mencegah XSS saat menyisipkan teks ke innerHTML.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Inisialisasi TodoList.
   * Muat task dari storage, render, dan bind event listeners.
   */
  function init() {
    tasks = loadFromStorage();
    render();

    const addBtn  = document.getElementById('task-add-btn');
    const inputEl = document.getElementById('task-input');
    const listEl  = document.getElementById('task-list');

    // Tombol Tambah
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const val = inputEl ? inputEl.value : '';
        addTask(val);
      });
    }

    // Enter pada input field
    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          addTask(inputEl.value);
        }
      });
      // Sembunyikan pesan validasi saat pengguna mulai mengetik
      inputEl.addEventListener('input', () => {
        setValidationMessage('');
      });
    }

    // Event delegation pada #task-list untuk semua interaksi task
    if (listEl) {
      listEl.addEventListener('click', (e) => {
        const target = e.target;

        // Checkbox toggle
        if (target.dataset.toggleId) {
          toggleTask(target.dataset.toggleId);
          return;
        }

        // Tombol Edit
        if (target.dataset.editBtnId) {
          startEdit(target.dataset.editBtnId);
          return;
        }

        // Tombol Hapus
        if (target.dataset.deleteId) {
          deleteTask(target.dataset.deleteId);
          return;
        }

        // Tombol Simpan (konfirmasi edit)
        if (target.dataset.confirmId) {
          const editInput = listEl.querySelector(`[data-edit-id="${target.dataset.confirmId}"]`);
          const newText = editInput ? editInput.value : '';
          confirmEdit(target.dataset.confirmId, newText);
          return;
        }

        // Tombol Batal (batalkan edit)
        if (target.dataset.cancelId) {
          cancelEdit(target.dataset.cancelId);
          return;
        }
      });

      // Keyboard: Enter/Escape pada input edit
      listEl.addEventListener('keydown', (e) => {
        if (!e.target.dataset.editId) return;
        const id = e.target.dataset.editId;
        if (e.key === 'Enter') {
          confirmEdit(id, e.target.value);
        } else if (e.key === 'Escape') {
          cancelEdit(id);
        }
      });
    }
  }

  // Ekspor public API — termasuk fungsi pure agar dapat diuji
  return {
    init,
    addTask,
    deleteTask,
    toggleTask,
    startEdit,
    confirmEdit,
    cancelEdit,
    validateInput,
    generateId,
    loadFromStorage,
    saveToStorage,
    render,
    escapeHtml,
    // Getter/setter state untuk keperluan testing
    getTasks:    () => tasks,
    setTasks:    (arr) => { tasks = arr; },
    getEditingId: () => editingId,
    setEditingId: (id) => { editingId = id; },
  };
})();

// =============================================================================
// QuickLinks — Manajemen link favorit dengan validasi dan persistensi Local Storage
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
// =============================================================================

const QuickLinks = (function () {

  // State internal
  let links = []; // array of Link object

  /**
   * Generate ID unik berbasis timestamp.
   * @returns {string} contoh: "link_1721234567891"
   */
  function generateId() {
    return 'link_' + Date.now();
  }

  /**
   * Validasi label: tidak boleh kosong atau whitespace-only.
   * @param {string} label
   * @returns {boolean}
   */
  function validateLabel(label) {
    return label.trim().length > 0;
  }

  /**
   * Validasi URL: harus dimulai dengan http:// atau https://.
   * @param {string} url
   * @returns {boolean}
   */
  function validateUrl(url) {
    return /^https?:\/\/.+/.test(url.trim());
  }

  /**
   * Muat daftar link dari Local Storage.
   * @returns {Link[]}
   */
  function loadFromStorage() {
    return StorageService.get('dashboard_links', []);
  }

  /**
   * Simpan daftar link ke Local Storage.
   */
  function saveToStorage() {
    StorageService.set('dashboard_links', links);
  }

  /**
   * Tampilkan atau sembunyikan pesan validasi untuk input label.
   * @param {string} message — string kosong untuk menyembunyikan
   */
  function setLabelValidation(message) {
    let msgEl = document.getElementById('link-label-validation-msg');
    if (!msgEl) {
      msgEl = document.createElement('p');
      msgEl.id = 'link-label-validation-msg';
      msgEl.setAttribute('role', 'alert');
      msgEl.setAttribute('aria-live', 'assertive');
      msgEl.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin: 0.25rem 0 0; min-height: 1.2em;';
      const labelInput = document.getElementById('link-label-input');
      if (labelInput) labelInput.insertAdjacentElement('afterend', msgEl);
    }
    msgEl.textContent = message;
  }

  /**
   * Tampilkan atau sembunyikan pesan validasi untuk input URL.
   * @param {string} message — string kosong untuk menyembunyikan
   */
  function setUrlValidation(message) {
    let msgEl = document.getElementById('link-url-validation-msg');
    if (!msgEl) {
      msgEl = document.createElement('p');
      msgEl.id = 'link-url-validation-msg';
      msgEl.setAttribute('role', 'alert');
      msgEl.setAttribute('aria-live', 'assertive');
      msgEl.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin: 0.25rem 0 0; min-height: 1.2em;';
      const urlInput = document.getElementById('link-url-input');
      if (urlInput) urlInput.insertAdjacentElement('afterend', msgEl);
    }
    msgEl.textContent = message;
  }

  /**
   * Tambah link baru ke daftar.
   * Guard: tidak menambahkan jika label atau URL tidak valid.
   * @param {string} label
   * @param {string} url
   */
  function addLink(label, url) {
    let hasError = false;

    if (!validateLabel(label)) {
      setLabelValidation('Label tidak boleh kosong.');
      hasError = true;
    } else {
      setLabelValidation('');
    }

    if (!validateUrl(url)) {
      setUrlValidation('URL harus dimulai dengan http:// atau https://');
      hasError = true;
    } else {
      setUrlValidation('');
    }

    if (hasError) return;

    const link = {
      id: generateId(),
      label: label.trim(),
      url: url.trim(),
      createdAt: Date.now(),
    };
    links.push(link);
    saveToStorage();
    render();

    // Kosongkan input setelah berhasil menambah
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';
  }

  /**
   * Hapus link berdasarkan id.
   * @param {string} id
   */
  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    saveToStorage();
    render();
  }

  /**
   * Escape karakter HTML khusus untuk mencegah XSS saat menyisipkan teks ke innerHTML.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Render ulang seluruh daftar link ke #links-container.
   * Setiap link: tombol buka URL (target="_blank") dan tombol hapus (×).
   */
  function render() {
    const containerEl = document.getElementById('links-container');
    if (!containerEl) return;

    if (links.length === 0) {
      containerEl.innerHTML = '<p class="links-empty">Belum ada link. Tambahkan link favoritmu!</p>';
      return;
    }

    containerEl.innerHTML = links.map(link => `
      <div class="link-item" data-id="${link.id}">
        <a
          href="${escapeHtml(link.url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-link"
          aria-label="Buka ${escapeHtml(link.label)} di tab baru"
        >${escapeHtml(link.label)}</a>
        <button
          class="btn btn-danger btn-icon"
          data-delete-link-id="${link.id}"
          aria-label="Hapus link: ${escapeHtml(link.label)}"
        >&times;</button>
      </div>
    `).join('');
  }

  /**
   * Inisialisasi QuickLinks.
   * Muat link dari storage, render, dan bind event listeners.
   */
  function init() {
    links = loadFromStorage();
    render();

    const addBtn    = document.getElementById('link-add-btn');
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    const containerEl = document.getElementById('links-container');

    // Tombol Tambah Link
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const label = labelInput ? labelInput.value : '';
        const url   = urlInput   ? urlInput.value   : '';
        addLink(label, url);
      });
    }

    // Sembunyikan pesan validasi saat pengguna mulai mengetik
    if (labelInput) {
      labelInput.addEventListener('input', () => setLabelValidation(''));
    }
    if (urlInput) {
      urlInput.addEventListener('input', () => setUrlValidation(''));
    }

    // Event delegation pada #links-container untuk tombol hapus
    if (containerEl) {
      containerEl.addEventListener('click', (e) => {
        const target = e.target;
        if (target.dataset.deleteLinkId) {
          deleteLink(target.dataset.deleteLinkId);
        }
      });
    }
  }

  // Ekspor public API — termasuk fungsi pure agar dapat diuji
  return {
    init,
    addLink,
    deleteLink,
    validateLabel,
    validateUrl,
    generateId,
    loadFromStorage,
    saveToStorage,
    render,
    escapeHtml,
    // Getter/setter state untuk keperluan testing
    getLinks:  () => links,
    setLinks:  (arr) => { links = arr; },
  };
})();
