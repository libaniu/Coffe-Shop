# Ruang Nadi Coffee Shop

Aplikasi web katalog menu digital dan manajemen pesanan untuk kedai kopi Ruang Nadi.

## Teknologi

Next.js, TypeScript, Tailwind CSS, MongoDB, dan SWR.

## Fitur Utama

- Katalog menu interaktif (pencarian, filter, paginasi).
- Sistem keranjang belanja (Cart).
- Portal admin (memerlukan login/sesi) untuk kelola menu & pesanan.

## Cara Menjalankan Proyek

1. Clone repositori & instal dependensi:

   ```bash
   git clone https://github.com/libaniu/Coffe-Shop
   cd ruang-nadi
   npm install
   ```

2. Buat file `.env` di root folder dan isi konfigurasi database:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
   NODE_ENV=development
   ```

3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000`.
