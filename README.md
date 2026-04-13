# Ruang Nadi Coffee Shop

Aplikasi web untuk **Ruang Nadi**, sebuah kedai kopi di Radio Dalam, Jakarta. Platform ini berfungsi sebagai katalog menu digital interaktif untuk pelanggan serta menyediakan portal manajemen (admin) untuk staf internal.

## Fitur Utama

- **Katalog Menu Digital:** Menampilkan daftar menu secara dinamis dengan fitur pencarian teks, filter berdasarkan kategori, pengurutan (sorting), dan paginasi halaman.
- **Sistem Keranjang (Cart):** Pelanggan dapat memilih varian item (misalnya ukuran atau penyajian panas/dingin) dan menambahkannya ke keranjang belanja (disimpan via LocalStorage).
- **Portal Admin:** Halaman khusus staf yang dilindungi oleh sistem autentikasi.
- **Autentikasi Sesi:** Login admin diamankan menggunakan sesi berbasis HTTP-only cookies (via Next.js Middleware).
- **Integrasi Database:** Penyimpanan dan pengelolaan data menu, pesanan, dan akun admin menggunakan MongoDB.

## Teknologi yang Digunakan

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) dengan Mongoose ORM
- **Data Fetching:** [SWR](https://swr.vercel.app/) untuk state management data secara real-time.

## Persyaratan Sistem

- Node.js (disarankan versi 18.x atau yang lebih baru)
- Akses ke database MongoDB (Lokal atau MongoDB Atlas)

## Cara Instalasi dan Menjalankan Proyek

1. Clone repositori ini atau masuk ke direktori proyek Anda:

   ```bash
   git clone <url-repository>
   cd ruang-nadi
   ```

2. Instal dependensi paket:

   ```bash
   npm install
   ```

3. Siapkan variabel environment. Buat file `.env` di root direktori proyek Anda dan tambahkan URI koneksi MongoDB:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<nama-database>?retryWrites=true&w=majority
   NODE_ENV=development
   ```

4. Jalankan server untuk tahap pengembangan:

   ```bash
   npm run dev
   ```

5. Buka http://localhost:3000 di peramban web (browser) Anda untuk melihat aplikasi.

## Struktur Direktori Utama

- `/app`: Direktori utama rute aplikasi Next.js (halaman publik, portal admin, API routes).
- `/components`: Kumpulan komponen React (Hero, MenuCard, Navbar, CartSidebar, dll).
- `/models`: Berisi skema (schema) Mongoose untuk database (Admin, Menu, Order).
- `/lib`: Modul utilitas untuk koneksi database (`mongodb.ts`).
