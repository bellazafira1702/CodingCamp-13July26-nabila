# Requirements Document

## Introduction

Todo List Life Dashboard adalah sebuah aplikasi web single-page yang berjalan sepenuhnya di browser tanpa membutuhkan backend. Aplikasi ini menggabungkan empat komponen utama: tampilan waktu dan salam, focus timer (Pomodoro-style), manajemen tugas (to-do list), dan quick links ke situs favorit. Semua data pengguna disimpan secara lokal menggunakan browser Local Storage API. Aplikasi dibangun menggunakan HTML, CSS, dan Vanilla JavaScript murni.

---

## Glossary

- **Dashboard**: Halaman utama aplikasi yang memuat seluruh komponen (Greeting, Focus Timer, Todo List, Quick Links).
- **Greeting_Widget**: Komponen yang menampilkan waktu saat ini, tanggal, dan pesan salam berdasarkan waktu hari.
- **Focus_Timer**: Komponen penghitung mundur 25 menit bergaya Pomodoro.
- **Todo_List**: Komponen manajemen tugas yang memungkinkan pengguna menambah, mengedit, menandai, dan menghapus tugas.
- **Task**: Sebuah item dalam Todo_List yang memiliki teks deskripsi dan status (selesai atau belum selesai).
- **Quick_Links**: Komponen yang menampilkan tombol-tombol menuju situs web favorit pengguna.
- **Link**: Sebuah item dalam Quick_Links yang memiliki label dan URL.
- **Local_Storage**: Browser API yang digunakan untuk menyimpan data secara persisten di sisi klien.
- **Time_Of_Day**: Periode waktu yang dikategorikan sebagai Pagi (05:00–11:59), Siang (12:00–14:59), Sore (15:00–17:59), dan Malam (18:00–04:59).

---

## Requirements

### Requirement 1: Tampilan Waktu dan Salam (Greeting Widget)

**User Story:** Sebagai pengguna, saya ingin melihat waktu terkini, tanggal, dan salam yang sesuai dengan waktu hari, sehingga saya dapat segera mengetahui konteks waktu saat membuka dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menampilkan waktu saat ini dalam format HH:MM:SS yang diperbarui setiap detik.
2. THE Greeting_Widget SHALL menampilkan tanggal saat ini dalam format hari, tanggal bulan tahun (contoh: Jumat, 18 Juli 2025).
3. WHEN Time_Of_Day adalah Pagi (05:00–11:59), THE Greeting_Widget SHALL menampilkan pesan "Selamat Pagi! ☀️".
4. WHEN Time_Of_Day adalah Siang (12:00–14:59), THE Greeting_Widget SHALL menampilkan pesan "Selamat Siang! 🌤️".
5. WHEN Time_Of_Day adalah Sore (15:00–17:59), THE Greeting_Widget SHALL menampilkan pesan "Selamat Sore! 🌅".
6. WHEN Time_Of_Day adalah Malam (18:00–04:59), THE Greeting_Widget SHALL menampilkan pesan "Selamat Malam! 🌙".

---

### Requirement 2: Focus Timer

**User Story:** Sebagai pengguna, saya ingin menjalankan timer hitung mundur 25 menit, sehingga saya dapat menerapkan teknik Pomodoro untuk meningkatkan fokus kerja.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan hitungan mundur dimulai dari 25:00 (dua puluh lima menit nol detik).
2. WHEN pengguna menekan tombol "Start", THE Focus_Timer SHALL memulai hitungan mundur dari waktu yang ditampilkan saat ini.
3. WHEN Focus_Timer sedang berjalan, THE Focus_Timer SHALL memperbarui tampilan setiap satu detik.
4. WHEN pengguna menekan tombol "Stop" selagi timer berjalan, THE Focus_Timer SHALL menghentikan hitungan mundur dan mempertahankan waktu yang tersisa.
5. WHEN pengguna menekan tombol "Reset", THE Focus_Timer SHALL menghentikan timer dan mengembalikan tampilan ke 25:00.
6. WHEN hitungan mundur mencapai 00:00, THE Focus_Timer SHALL berhenti secara otomatis dan menampilkan notifikasi kepada pengguna.

---

### Requirement 3: Manajemen Tugas (To-Do List)

**User Story:** Sebagai pengguna, saya ingin dapat menambah, mengedit, menandai, dan menghapus tugas, serta menyimpan daftar tugas secara persisten, sehingga saya dapat melacak pekerjaan saya meskipun browser ditutup dan dibuka kembali.

#### Acceptance Criteria

1. WHEN pengguna mengetikkan teks tugas di input field dan menekan tombol "Tambah" atau menekan Enter, THE Todo_List SHALL menambahkan Task baru dengan teks tersebut ke dalam daftar dengan status belum selesai.
2. IF teks input kosong ketika pengguna mencoba menambahkan tugas, THEN THE Todo_List SHALL menampilkan pesan validasi dan tidak menambahkan Task.
3. WHEN pengguna menekan tombol edit pada sebuah Task, THE Todo_List SHALL memungkinkan pengguna mengubah teks Task tersebut secara langsung (inline editing).
4. WHEN pengguna mengkonfirmasi perubahan teks Task, THE Todo_List SHALL menyimpan teks yang diperbarui.
5. WHEN pengguna mengklik checkbox atau tombol selesai pada sebuah Task, THE Todo_List SHALL mengubah status Task tersebut menjadi selesai dan menampilkan tanda visual (seperti teks tercoret).
6. WHEN pengguna mengklik ulang checkbox atau tombol selesai pada Task yang sudah selesai, THE Todo_List SHALL mengubah status Task tersebut kembali menjadi belum selesai.
7. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_List SHALL menghapus Task tersebut dari daftar secara permanen.
8. WHEN terjadi perubahan pada daftar Task (tambah, edit, tandai, atau hapus), THE Todo_List SHALL menyimpan seluruh daftar Task ke Local_Storage.
9. WHEN Dashboard dimuat di browser, THE Todo_List SHALL memuat dan menampilkan semua Task yang sebelumnya tersimpan di Local_Storage.

---

### Requirement 4: Quick Links

**User Story:** Sebagai pengguna, saya ingin menyimpan dan mengakses tombol menuju situs web favorit saya, sehingga saya dapat membuka situs tersebut dengan cepat langsung dari dashboard.

#### Acceptance Criteria

1. WHEN pengguna mengisi label dan URL di form Quick Links lalu menekan tombol "Tambah Link", THE Quick_Links SHALL menambahkan Link baru dan menampilkannya sebagai tombol yang dapat diklik.
2. IF URL yang dimasukkan pengguna tidak memiliki awalan protokol yang valid (http:// atau https://), THEN THE Quick_Links SHALL menampilkan pesan validasi dan tidak menyimpan Link tersebut.
3. IF label yang dimasukkan pengguna kosong, THEN THE Quick_Links SHALL menampilkan pesan validasi dan tidak menyimpan Link tersebut.
4. WHEN pengguna mengklik tombol sebuah Link, THE Quick_Links SHALL membuka URL yang sesuai di tab browser baru.
5. WHEN pengguna menekan tombol hapus pada sebuah Link, THE Quick_Links SHALL menghapus Link tersebut dari daftar secara permanen.
6. WHEN terjadi perubahan pada daftar Link (tambah atau hapus), THE Quick_Links SHALL menyimpan seluruh daftar Link ke Local_Storage.
7. WHEN Dashboard dimuat di browser, THE Quick_Links SHALL memuat dan menampilkan semua Link yang sebelumnya tersimpan di Local_Storage.

---

### Requirement 5: Struktur File dan Arsitektur Teknis

**User Story:** Sebagai developer, saya ingin kode proyek diorganisasi secara bersih dan konsisten, sehingga mudah dipahami dan dipelihara.

#### Acceptance Criteria

1. THE Dashboard SHALL dibangun menggunakan satu file HTML, satu file CSS di dalam folder `css/`, dan satu file JavaScript di dalam folder `js/`.
2. THE Dashboard SHALL menyimpan dan membaca semua data persisten (Task dan Link) melalui Local_Storage API browser.
3. THE Dashboard SHALL dapat berjalan sebagai file statis tanpa membutuhkan server backend atau proses build.
4. THE Dashboard SHALL berfungsi dengan baik di browser modern, termasuk Chrome, Firefox, Edge, dan Safari versi terkini.
5. THE Dashboard SHALL menampilkan layout yang responsif dan dapat digunakan dengan nyaman pada ukuran layar desktop maupun tablet.

---

### Requirement 6: Desain Visual dan Antarmuka Pengguna

**User Story:** Sebagai pengguna, saya ingin antarmuka yang bersih, hierarkis, dan mudah dibaca, sehingga saya dapat menggunakan dashboard tanpa kebingungan.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan keempat komponen (Greeting_Widget, Focus_Timer, Todo_List, Quick_Links) dalam layout yang terorganisir dengan pemisahan visual yang jelas antar komponen.
2. THE Dashboard SHALL menggunakan tipografi yang mudah dibaca dengan ukuran font minimum 14px untuk teks konten.
3. THE Dashboard SHALL menerapkan hierarki visual yang membedakan judul komponen, konten utama, dan teks sekunder.
4. WHEN pengguna berinteraksi dengan elemen yang dapat diklik (tombol, checkbox, link), THE Dashboard SHALL memberikan feedback visual (seperti perubahan warna atau efek hover).
5. THE Dashboard SHALL menampilkan semua elemen interaktif dengan area klik yang memadai (minimum 44x44 piksel) untuk kemudahan penggunaan.
