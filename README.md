# Skyc

**Save anything, From anywhere.**

Simpan dan unduh video tanpa tanda air (*no watermark*), foto resolusi tinggi, serta musik MP3 dari 16+ platform langsung dari perangkat **Android**, **Windows Desktop**, maupun **Terminal CLI** Anda. Dirancang dengan antarmuka hangat bergaya **Claude**, tanpa akun, tanpa iklan, dan berjalan 100% di sisi klien (*client-side*).

<p align="center">
  <img src="https://img.shields.io/badge/Version-v1.0.0-D97757?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20CLI-191918?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/Theme-Claude%20Editorial-F4F3EE?style=flat-square&labelColor=191918&color=D97757" alt="Theme">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License">
</p>

---

## 🚀 Cara Penggunaan

Menyimpan media dengan **Skyc** hanya membutuhkan tiga langkah sederhana:

1. **Salin Tautan (*Copy Link*)**: Salin tautan video, foto, atau musik dari aplikasi favorit Anda (TikTok, Instagram, YouTube, Spotify, X/Twitter, dll.).
2. **Buka Skyc**: Skyc secara otomatis mendeteksi tautan dari *clipboard* Anda dan langsung menganalisisnya. Pada perangkat Android, Anda juga cukup menekan tombol **Share (Bagikan)** di aplikasi mana pun lalu memilih **Skyc** untuk mengunduh lewat *overlay* cepat tanpa berpindah aplikasi.
3. **Unduh (*Download*)**: Pilih kualitas yang diinginkan (Video HD tanpa *watermark*, audio MP3, galeri foto, atau gabungkan ke PDF) lalu ketuk **Download**. Media langsung tersimpan rapi di folder `Movies/Skyc`, `Music/Skyc`, atau `Pictures/Skyc`.

---

## 📥 Paket Instalasi & Unduhan

Seluruh paket instalasi siap pakai tersedia di halaman **GitHub Releases** dan **npm**:

| Platform | Paket Tersedia | Metode Instalasi |
| :--- | :--- | :--- |
| **Android (Universal / x64)** | [**`Skyc-v1.0.0.apk`**](https://github.com/elskyx/Skyc/releases/download/v1.0.0/Skyc-v1.0.0.apk) | [Unduh Langsung APK](https://github.com/elskyx/Skyc/releases/download/v1.0.0/Skyc-v1.0.0.apk) *(Sideload)* |
| **Windows Desktop (x64 / x86)** | [**`Skyc-Setup.exe`**](https://github.com/elskyx/Skyc/releases/download/v1.0.0/Skyc_1.0.0_x64-setup.exe) / [**`.msi`**](https://github.com/elskyx/Skyc/releases/download/v1.0.0/Skyc_1.0.0_x64_en-US.msi) | [Unduh Installer .exe](https://github.com/elskyx/Skyc/releases/download/v1.0.0/Skyc_1.0.0_x64-setup.exe) *(NSIS / WiX)* |
| **Web App (Browser)** | [**Buka Skyc Web**](https://github.com/elskyx/Skyc) | Akses langsung via browser *(Zero Install)* |
| **CLI (Terminal)** | [`npx @elskyx/skyc`](https://www.npmjs.com/package/@elskyx/skyc) | Jalankan via Node.js / npm (`skyc <URL>`) |

---

## 💻 Skyc CLI (Terminal)

Lebih suka menggunakan baris perintah di Command Prompt, PowerShell, atau Linux? **Skyc** tersedia sebagai paket terminal interaktif yang ditenagai oleh `@clack/prompts`:

```bash
# Jalankan interaktif tanpa instalasi global
npx @elskyx/skyc

# Unduh tautan secara langsung
npx @elskyx/skyc <URL>

# Unduh aliran audio saja (MP3)
npx @elskyx/skyc <URL> -a

# Gabungkan album foto langsung menjadi dokumen PDF
npx @elskyx/skyc <URL> -p
```

Atau instal secara global:

```bash
npm install -g @elskyx/skyc
skyc
```

---

## ✨ Fitur Utama

- **Dukungan 16+ Platform**: Unduh media bebas tanda air dari TikTok, Instagram, YouTube, Twitter/X, Spotify, Apple Music, Pinterest, Facebook, Threads, Bandcamp, Pixiv, Bilibili, Douyin, RedNote (Xiaohongshu), Reddit, dan TeraBox.
- **Desain Hangat Bergaya Claude**: Antarmuka bersih dan nyaman di mata dengan palet *Warm Parchment* (`#F4F3EE`), *Warm Obsidian* (`#191918`), dan aksen *Terracotta* (`#D97757`).
- **Pembaruan *Scraper* *Over-The-Air* (OTA)**: Saat sebuah platform mengubah struktur API-nya, Skyc memperbarui bundel *scraper* (`bundle.js`) secara otomatis di latar belakang dari GitHub `elskyx/Skyc` tanpa perlu menginstal ulang APK atau `.exe`.
- **Unduhan Paralel Berkecepatan Tinggi**: Mengunduh *playlist* musik, album, dan galeri foto *carousel* secara bersamaan hingga 5 *worker thread* paralel.
- **Menu *Quick Save* Android**: Unduh video langsung dari menu *Share* Android melalui tampilan *overlay* ringan tanpa meninggalkan aplikasi yang sedang dibuka.
- **Konversi Foto ke PDF Instan**: Gabungkan postingan multi-foto menjadi satu dokumen PDF menggunakan `pdf-lib` untuk dibaca secara luring.
- **Kunci Privasi PIN & Sidik Jari**: Lindungi riwayat unduhan dan galeri media menggunakan PIN 4 digit atau sensor biometrik Android.
- **100% Privat & Tanpa Server Eksternal**: Seluruh permintaan jaringan dan penguraian HTML/API dieksekusi langsung di perangkat lokal Anda.

---

## 🛠️ Tumpukan Teknologi & Kompilasi dari Sumber (*Build from Source*)

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 Modular (Tema Claude), `pdf-lib`
- **Android Runtime & Native HTTP**: CapacitorJS + Java + `OkHttp` (`DownloadForegroundService` & `ShareActivity`)
- **Windows Desktop Runtime & Native HTTP**: Tauri v2 (Rust) + `Reqwest`
- **Scraper Engine & Bundler**: `Axios`, `Cheerio`, & `esbuild`

### Langkah Kompilasi Lokal

1. Kloning repositori dan instal dependensi:
   ```bash
   git clone https://github.com/elskyx/Skyc.git
   cd Skyc
   npm install
   ```
2. Kompilasi bundel *scraper* beserta manifest SHA256:
   ```bash
   npm run build:scrapers
   ```
3. Jalankan atau bangun untuk platform target:
   - **Android (Android Studio / Gradle)**: `npm run android:dev` atau `npm run android:apk`
   - **Windows Desktop (Tauri v2)**: `npm run windows:dev` atau `npm run windows:build`

---

## 📄 Lisensi & Atribusi

Proyek `elskyx/Skyc` merupakan perangkat lunak sumber terbuka berlisensi **GNU General Public License v3.0 (GPL-3.0)** yang mengadaptasi arsitektur dari [coflyn/Mori](https://github.com/coflyn/Mori).
