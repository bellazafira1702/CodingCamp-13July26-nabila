# Implementation Plan: Todo List Life Dashboard

## Overview

Implementasi aplikasi web single-page menggunakan HTML5, CSS3, dan Vanilla JavaScript (ES6+) murni. Tidak ada framework atau dependensi build — file statis dapat langsung dibuka di browser. Komponen diorganisasi dengan module pattern (IIFE/closure) dalam satu file `js/app.js`, didukung satu file `css/style.css`, dan `index.html` sebagai entry point.

## Tasks

- [x] 1. Siapkan struktur proyek dan file dasar
  - Buat `index.html` di root dengan boilerplate HTML5, link ke `css/style.css` dan `js/app.js`
  - Buat `css/style.css` sebagai file kosong siap diisi
  - Buat `js/app.js` sebagai file kosong siap diisi
  - Tambahkan placeholder elemen DOM di `index.html` untuk keempat komponen: `#greeting-widget`, `#focus-timer`, `#todo-list`, `#quick-links`
  - Sertakan semua elemen DOM yang direferensikan desain: `#greeting-time`, `#greeting-date`, `#greeting-message`, `#timer-display`, `#timer-start`, `#timer-stop`, `#timer-reset`, `#task-input`, `#task-add-btn`, `#task-list`, `#link-label-input`, `#link-url-input`, `#link-add-btn`, `#links-container`
  - _Requirements: 5.1, 5.3_

- [x] 2. Implementasi StorageService
  - [x] 2.1 Tulis `StorageService` di `js/app.js` sebagai object literal dengan metode `get(key, fallback)` dan `set(key, value)`
    - `get`: panggil `localStorage.getItem(key)`, parse JSON, kembalikan `fallback` jika null atau parse gagal (try/catch)
    - `set`: panggil `localStorage.setItem(key, JSON.stringify(value))`, tangkap `QuotaExceededError` dengan `console.error`
    - _Requirements: 5.2, 3.8, 3.9, 4.6, 4.7_

  - [ ]* 2.2 Tulis property test untuk `StorageService` (P3 & P7)
    - Setup Vitest + fast-check: `npm init -y`, `npm install --save-dev vitest fast-check`
    - Buat `tests/storage.test.js`
    - **Property 3: Round-trip persistensi task** — for any array Task yang valid, `set` lalu `get` harus menghasilkan array yang identik
    - **Property 7: Round-trip persistensi link** — for any array Link yang valid, `set` lalu `get` harus menghasilkan array yang identik
    - **Validates: Requirements 3.8, 3.9, 4.6, 4.7**
    - Minimal 100 iterasi per property

- [x] 3. Implementasi GreetingWidget
  - [x] 3.1 Tulis modul `GreetingWidget` di `js/app.js`
    - Implementasi `formatTime(date)` → string `"HH:MM:SS"` dengan zero-padding
    - Implementasi `formatDate(date)` → string `"Jumat, 18 Juli 2025"` menggunakan `Intl.DateTimeFormat` locale `id-ID`
    - Implementasi `getTimeOfDay(hour)` → kategori string berdasarkan tabel Time_Of_Day
    - Implementasi `getGreetingMessage(timeOfDay)` → string salam + emoji sesuai kategori
    - Implementasi `render(data)` → update `#greeting-time`, `#greeting-date`, `#greeting-message`
    - Implementasi `tick()` → ambil `new Date()`, hitung data, panggil `render()`
    - Implementasi `init()` → panggil `tick()` sekali, lalu `setInterval(tick, 1000)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  -
    - Minimal 100 iterasi per property

- [x] 4. Implementasi FocusTimer
  - [x] 4.1 Tulis modul `FocusTimer` di `js/app.js`
    - State internal: `totalSeconds = 1500`, `intervalId = null`, `isRunning = false`
    - Implementasi `formatDisplay(secs)` → string `"MM:SS"` dari total detik
    - Implementasi `render()` → update `#timer-display` dengan `formatDisplay(totalSeconds)`
    - Implementasi `start()` → guard jika `isRunning`, set `isRunning = true`, jalankan `setInterval` 1 detik panggil `tick()`
    - Implementasi `stop()` → `clearInterval(intervalId)`, set `isRunning = false`
    - Implementasi `reset()` → panggil `stop()`, set `totalSeconds = 1500`, panggil `render()`
    - Implementasi `tick()` → kurangi `totalSeconds`, panggil `render()`, jika `totalSeconds <= 0` panggil `stop()` lalu `notifyComplete()`
    - Implementasi `notifyComplete()` → tampilkan `alert('Sesi fokus selesai! Waktunya istirahat.')`
    - Implementasi `init()` → bind event listener pada `#timer-start` → `start()`, `#timer-stop` → `stop()`, `#timer-reset` → `reset()`, panggil `render()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - 

- [~] 5. Checkpoint — Pastikan semua tests lolos
  - Jalankan `npx vitest --run` untuk memverifikasi StorageService, GreetingWidget, dan FocusTimer
  - Pastikan semua tests lolos, tanyakan kepada user jika ada pertanyaan.

- [x] 6. Implementasi TodoList
  - [x] 6.1 Tulis modul `TodoList` di `js/app.js`
    - State internal: `tasks = []` (array of Task object)
    - Implementasi `generateId()` → `'task_' + Date.now()`
    - Implementasi `validateInput(text)` → `return text.trim().length > 0`
    - Implementasi `loadFromStorage()` → gunakan `StorageService.get('dashboard_tasks', [])`
    - Implementasi `saveToStorage()` → gunakan `StorageService.set('dashboard_tasks', tasks)`
    - Implementasi `addTask(text)` → guard `validateInput`, buat Task object `{id, text: text.trim(), completed: false, createdAt: Date.now()}`, push ke `tasks`, `saveToStorage()`, `render()`
    - Implementasi `deleteTask(id)` → filter `tasks`, `saveToStorage()`, `render()`
    - Implementasi `toggleTask(id)` → map `tasks` toggle `completed`, `saveToStorage()`, `render()`
    - Implementasi `startEdit(id)`, `confirmEdit(id, text)`, `cancelEdit(id)` untuk inline editing
    - Implementasi `render()` → generate HTML untuk setiap task (checkbox, teks/input-edit, tombol Edit, tombol Hapus), set ke `#task-list`
    - Implementasi `init()` → `tasks = loadFromStorage()`, `render()`, bind event pada `#task-add-btn` dan `#task-input` (keydown Enter)
    - Tampilkan pesan validasi inline di bawah `#task-input` jika input kosong/whitespace
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  -

- [x] 7. Implementasi QuickLinks
  - [x] 7.1 Tulis modul `QuickLinks` di `js/app.js`
    - State internal: `links = []` (array of Link object)
    - Implementasi `generateId()` → `'link_' + Date.now()`
    - Implementasi `validateLabel(label)` → `return label.trim().length > 0`
    - Implementasi `validateUrl(url)` → `return /^https?:\/\/.+/.test(url.trim())`
    - Implementasi `loadFromStorage()` → gunakan `StorageService.get('dashboard_links', [])`
    - Implementasi `saveToStorage()` → gunakan `StorageService.set('dashboard_links', links)`
    - Implementasi `addLink(label, url)` → guard `validateLabel` dan `validateUrl`, buat Link object `{id, label: label.trim(), url: url.trim(), createdAt: Date.now()}`, push ke `links`, `saveToStorage()`, `render()`
    - Implementasi `deleteLink(id)` → filter `links`, `saveToStorage()`, `render()`
    - Implementasi `render()` → generate HTML untuk setiap link (tombol buka URL `target="_blank"`, tombol hapus ×), set ke `#links-container`
    - Implementasi `init()` → `links = loadFromStorage()`, `render()`, bind event pada `#link-add-btn`
    - Tampilkan pesan validasi inline jika label kosong atau URL tidak valid
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_



- [-] 8. Checkpoint — Pastikan semua tests lolos
  - Jalankan `npx vitest --run` untuk memverifikasi TodoList dan QuickLinks
  - Pastikan semua tests lolos, tanyakan kepada user jika ada pertanyaan.

- [~] 9. Implementasi Layout dan CSS
  - [ ] 9.1 Tulis struktur layout di `index.html`
    - Bungkus keempat komponen dalam container `<main class="dashboard">` dengan layout CSS Grid atau Flexbox
    - Setiap komponen dibungkus `<section>` dengan class yang sesuai (`greeting-widget`, `focus-timer`, `todo-list`, `quick-links`)
    - Tambahkan `aria-label` pada semua tombol icon (edit, hapus, ×) untuk aksesibilitas
    - _Requirements: 6.1, 5.4_

  - [~] 9.2 Tulis CSS di `css/style.css`
    - Reset/normalize dasar, set `box-sizing: border-box`
    - Layout dashboard: CSS Grid dua kolom pada desktop (≥768px), satu kolom pada mobile
    - Style per komponen: background card, border-radius, padding, box-shadow untuk pemisahan visual
    - Tipografi: font-family sans-serif, font-size minimum `14px` untuk teks konten
    - Hierarki visual: ukuran judul komponen > konten utama > teks sekunder (caption, label)
    - Semua elemen interaktif (tombol, checkbox) minimum `44×44px` click target
    - Hover/focus states: perubahan warna background atau border untuk feedback visual
    - Timer display: font-size besar (~3rem) untuk keterbacaan
    - Completed task: `text-decoration: line-through` dan opacity lebih rendah
    - Responsive breakpoint di 768px
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.5_

- [~] 10. Implementasi `initApp` dan wiring semua komponen
  - [ ] 10.1 Tulis fungsi `initApp()` di bagian bawah `js/app.js`
    - Panggil `GreetingWidget.init()`
    - Panggil `FocusTimer.init()`
    - Panggil `TodoList.init()`
    - Panggil `QuickLinks.init()`
    - Daftarkan `document.addEventListener('DOMContentLoaded', initApp)`
    - Pastikan urutan inisialisasi: StorageService tersedia sebelum TodoList dan QuickLinks
    - _Requirements: 5.1, 5.3, 5.4_

- [~] 11. Final Checkpoint — Verifikasi keseluruhan aplikasi
  - Jalankan `npx vitest --run` untuk memastikan semua tests lolos
  - Buka `index.html` di browser secara langsung (double-click file) dan verifikasi semua komponen muncul
  - Pastikan semua tests lolos, tanyakan kepada user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
- Checkpoint memastikan validasi inkremental di setiap fase
- Property tests memvalidasi properti kebenaran universal (Properties 1–10 dari design doc)
- Unit tests memvalidasi contoh spesifik dan edge cases
- Untuk menjalankan tests: install dependensi terlebih dahulu dengan `npm install`, lalu `npx vitest --run`
- Aplikasi berjalan tanpa build step — buka `index.html` langsung di browser

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "9.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "4.1"] },
    { "id": 2, "tasks": ["3.2", "4.2", "6.1", "7.1"] },
    { "id": 3, "tasks": ["6.2", "7.2", "9.2"] },
    { "id": 4, "tasks": ["10.1"] }
  ]
}
```
