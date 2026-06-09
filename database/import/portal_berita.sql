-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2022 at 11:31 AM
-- Server version: 10.4.17-MariaDB
-- PHP Version: 7.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `portal_berita`
--

-- --------------------------------------------------------

--
-- Table structure for table `breaking_news`
--

CREATE TABLE `breaking_news` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `breaking_news`
--

INSERT INTO `breaking_news` (`id`, `post_id`, `created_at`, `updated_at`) VALUES
(1, 6, '2021-12-03 06:25:21', '2021-12-03 06:25:21'),
(2, 5, '2021-12-03 06:25:28', '2021-12-03 06:25:28'),
(3, 4, '2021-12-03 06:25:34', '2021-12-03 06:25:34');

-- --------------------------------------------------------

--
-- Table structure for table `breaking_news_categories`
--

CREATE TABLE `breaking_news_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `breaking_news_categories`
--

INSERT INTO `breaking_news_categories` (`id`, `post_id`, `category_id`, `created_at`, `updated_at`) VALUES
(1, 18, 5, '2021-12-06 05:41:49', '2021-12-06 05:41:49'),
(2, 10, 5, '2021-12-06 05:41:57', '2021-12-06 05:41:57'),
(3, 22, 1, '2021-12-29 05:01:32', '2021-12-29 05:01:32');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Berita', 'berita', NULL, NULL, '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(2, 'Internet', 'internet', NULL, NULL, '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(3, 'Gadget', 'gadget', NULL, NULL, '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(4, 'Sains', 'sains', NULL, NULL, '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(5, 'Game', 'game', NULL, NULL, '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(6, 'Tutorial', 'tutorial', NULL, NULL, '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(9, 'Video', 'video', NULL, NULL, '2021-12-04 07:22:20', '2021-12-04 07:22:20');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `contact_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `contact_content`, `created_at`, `updated_at`) VALUES
(1, '<div class=\"td-page-header\" style=\"font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 14px;\"><h1 class=\"entry-title td-page-title\" style=\"font-family: Roboto, sans-serif; color: rgb(17, 17, 17); margin: -9px 0px 19px; font-size: 30px; line-height: 38px; overflow-wrap: break-word;\">Kontak</h1></div><div class=\"td-page-content tagdiv-type\" style=\"font-size: 15px; line-height: 1.74; color: rgb(34, 34, 34); padding-bottom: 26px; font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif;\"><p style=\"margin-bottom: 26px;\"><span style=\"font-weight: 700;\">Alamat Redaksi dan Manajemen AlFatihDev</span><br>Jl. Bojonghuni No.08 Ciamis<br>Ciamis, Jawa Barat – Indonesia<br><span style=\"font-weight: 700;\">Email</span>&nbsp;:&nbsp;alfatihcodes1453@gmail.com</p><p style=\"margin-bottom: 26px;\"><span style=\"font-weight: 700;\">Pres Rilis</span></p><p style=\"margin-bottom: 26px;\"><span style=\"font-weight: 700;\">Email</span>&nbsp;: alfatihcodes1453@gmail.com</p><p style=\"margin-bottom: 26px;\"><span style=\"font-weight: 700;\">Iklan/ Advetorial</span></p><p style=\"margin-bottom: 26px;\"><span style=\"font-weight: 700;\">Email</span>&nbsp;: alfatihcodes1453@gmail.com</p><p style=\"margin-bottom: 26px;\"><span style=\"font-weight: 700;\">Kontak</span></p><p style=\"margin-bottom: 26px;\">Agun Wiguna (082317688174)</p></div><p>\r\n                                    </p>', '2021-11-20 02:13:34', '2022-03-30 03:39:50');

-- --------------------------------------------------------

--
-- Table structure for table `disclaimers`
--

CREATE TABLE `disclaimers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `disclaimer_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disclaimers`
--

INSERT INTO `disclaimers` (`id`, `disclaimer_content`, `created_at`, `updated_at`) VALUES
(1, '<div class=\"td-page-header\" style=\"font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 14px;\"><h1 class=\"entry-title td-page-title\" style=\"font-family: Roboto, sans-serif; color: rgb(17, 17, 17); margin: -9px 0px 19px; font-size: 30px; line-height: 38px; overflow-wrap: break-word;\">Disclaimer</h1></div><div class=\"td-page-content tagdiv-type\" style=\"font-size: 15px; line-height: 1.74; color: rgb(34, 34, 34); padding-bottom: 26px; font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif;\"><p style=\"margin-bottom: 26px;\">Dengan mengakses dan menggunakan situs alfatihdev.com, berarti anda telah memahami dan setuju bahwa :</p><ul style=\"padding: 0px; margin-bottom: 26px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Data dan informasi disediakan di alfatihdev.com&nbsp;hanya sebagai informasi dan tidak diharapkan untuk tujuan perdagangan dan/atau transaksi lainnya.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Meski segala upaya telah dilakukan untuk menampilkan data dan informasi seakurat mungkin, alfatihdev.com&nbsp;tidak bertanggung jawab atas segala kesalahan dan keterlambatan memperbarui data atau informasi.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">alfatihdev.com&nbsp;menyediakan link ke situs lain, link tersebut tidak menunjukan bahwa alfatihdev.com&nbsp;menyetujui situs pihak lain tersebut.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Anda mengetahui dan menyetujui bahwa alfatihdev.com&nbsp;tidak bertanggung jawab atas isi atau materi lainnya yang ada pada situs pihak lain tersebut.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Setiap perjanjian dan transaksi antara anda dan pengiklan yang ada di alfatihdev.com&nbsp;adalah antara anda dan pengiklan.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Anda mengetahui dan setuju bahwa alfatihdev.com&nbsp;tidak bertanggung jawab atas segala bentuk kehilangan atau klaim yang mungkin timbul dari perjanjian atau transaksi antara anda dengan pengiklan.</li></ul></div><p>\r\n                                    </p>', '2021-11-20 02:13:34', '2022-03-30 03:38:27');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guidelines`
--

CREATE TABLE `guidelines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `guideline_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guidelines`
--

INSERT INTO `guidelines` (`id`, `guideline_content`, `created_at`, `updated_at`) VALUES
(1, '<p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">PERATURAN DEWAN PERS</span></p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">PEDOMAN PEMBERITAAN MEDIA SIBER</span></p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB.</p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Keberadaan media siber di Indonesia juga merupakan bagian dari kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers.</p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Media siber memiliki karakter khusus sehingga memerlukan pedoman agar pengelolaannya dapat dilaksanakan secara profesional, memenuhi fungsi, hak, dan kewajibannya sesuai Undang-Undang Nomor 40 Tahun 1999 tentang Pers dan Kode Etik Jurnalistik.</p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Untuk itu Dewan Pers bersama organisasi pers, pengelola media siber, dan masyarakat menyusun Pedoman Pemberitaan Media Siber sebagai berikut:</p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">1. Ruang Lingkup</span></p><ol style=\"padding: 0px; margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Isi Buatan Pengguna (User Generated Content) adalah segala isi yang dibuat dan atau dipublikasikan oleh pengguna media siber, antara lain, artikel, gambar, komentar, suara, video dan berbagai bentuk unggahan yang melekat pada media siber, seperti blog, forum, komentar pembaca atau pemirsa, dan bentuk lain.</li></ol><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">2. Verifikasi dan keberimbangan berita</span></p><ol style=\"padding: 0px; margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Pada prinsipnya setiap berita harus melalui verifikasi.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Ketentuan dalam butir (a) di atas dikecualikan, dengan syarat:<ol style=\"padding: 0px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Berita benar-benar mengandung kepentingan publik yang bersifat mendesak;</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Sumber berita yang pertama adalah sumber yang jelas disebutkan identitasnya, kredibel dan kompeten;</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Subyek berita yang harus dikonfirmasi tidak diketahui keberadaannya dan atau tidak dapat diwawancarai;</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Media memberikan penjelasan kepada pembaca bahwa berita tersebut masih memerlukan verifikasi lebih lanjut yang diupayakan dalam waktu secepatnya. Penjelasan dimuat pada bagian akhir dari berita yang sama, di dalam kurung dan menggunakan huruf miring.</li></ol></li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Setelah memuat berita sesuai dengan butir (c), media wajib meneruskan upaya verifikasi, dan setelah verifikasi didapatkan, hasil verifikasi dicantumkan pada berita pemutakhiran (update) dengan tautan pada berita yang belum terverifikasi.</li></ol><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">3. Isi Buatan Pengguna (User Generated Content)</span></p><ol style=\"padding: 0px; margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan Undang-Undang No. 40 tahun 1999 tentang Pers dan Kode Etik Jurnalistik, yang ditempatkan secara terang dan jelas.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber mewajibkan setiap pengguna untuk melakukan registrasi keanggotaan dan melakukan proses log-in terlebih dahulu untuk dapat mempublikasikan semua bentuk Isi Buatan Pengguna. Ketentuan mengenai log-in akan diatur lebih lanjut.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Dalam registrasi tersebut, media siber mewajibkan pengguna memberi persetujuan tertulis bahwa Isi Buatan Pengguna yang dipublikasikan:<ol style=\"padding: 0px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Tidak memuat isi bohong, fitnah, sadis dan cabul;</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Tidak memuat isi yang mengandung prasangka dan kebencian terkait dengan suku, agama, ras, dan antargolongan (SARA), serta menganjurkan tindakan kekerasan;</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Tidak memuat isi diskriminatif atas dasar perbedaan jenis kelamin dan bahasa, serta tidak merendahkan martabat orang lemah, miskin, sakit, cacat jiwa, atau cacat jasmani.</li></ol></li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber memiliki kewenangan mutlak untuk mengedit atau menghapus Isi Buatan Pengguna yang bertentangan dengan butir (c).</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber wajib menyediakan mekanisme pengaduan Isi Buatan Pengguna yang dinilai melanggar ketentuan pada butir (c). Mekanisme tersebut harus disediakan di tempat yang dengan mudah dapat diakses pengguna.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber wajib menyunting, menghapus, dan melakukan tindakan koreksi setiap Isi Buatan Pengguna yang dilaporkan dan melanggar ketentuan butir (c), sesegera mungkin secara proporsional selambat-lambatnya 2 x 24 jam setelah pengaduan diterima.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber yang telah memenuhi ketentuan pada butir (a), (b), (c), dan (f) tidak dibebani tanggung jawab atas masalah yang ditimbulkan akibat pemuatan isi yang melanggar ketentuan pada butir (c).</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Media siber bertanggung jawab atas Isi Buatan Pengguna yang dilaporkan bila tidak mengambil tindakan koreksi setelah batas waktu sebagaimana tersebut pada butir (f).</li></ol><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">4. Ralat, Koreksi, dan Hak Jawab</span></p><ol style=\"padding: 0px; margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Ralat, koreksi dan atau hak jawab wajib ditautkan pada berita yang diralat, dikoreksi atau yang diberi hak jawab.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Di setiap berita ralat, koreksi, dan hak jawab wajib dicantumkan waktu pemuatan ralat, koreksi, dan atau hak jawab tersebut.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Bila suatu berita media siber tertentu disebarluaskan media siber lain, maka:<ol style=\"padding: 0px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Tanggung jawab media siber pembuat berita terbatas pada berita yang dipublikasikan di media siber tersebut atau media siber yang berada di bawah otoritas teknisnya;</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Koreksi berita yang dilakukan oleh sebuah media siber, juga harus dilakukan oleh media siber lain yang mengutip berita dari media siber yang dikoreksi itu;</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Media yang menyebarluaskan berita dari sebuah media siber dan tidak melakukan koreksi atas berita sesuai yang dilakukan oleh media siber pemilik dan atau pembuat berita tersebut, bertanggung jawab penuh atas semua akibat hukum dari berita yang tidak dikoreksinya itu.</li></ol></li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Sesuai dengan Undang-Undang Pers, media siber yang tidak melayani hak jawab dapat dijatuhi sanksi hukum pidana denda paling banyak Rp500.000.000 (Lima ratus juta rupiah).</li></ol><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">5. Pencabutan Berita</span></p><ol style=\"padding: 0px; margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, pengalaman traumatik korban atau berdasarkan pertimbangan khusus lain yang ditetapkan Dewan Pers.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber lain wajib mengikuti pencabutan kutipan berita dari media asal yang telah dicabut.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Pencabutan berita wajib disertai dengan alasan pencabutan dan diumumkan kepada publik.</li></ol><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">6. Iklan</span></p><ol style=\"padding: 0px; margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 10px;\">Media siber wajib membedakan dengan tegas antara produk berita dan iklan.</li><li style=\"line-height: inherit; margin-left: 21px; margin-bottom: 0px;\">Setiap berita/artikel/isi yang merupakan iklan dan atau isi berbayar wajib mencantumkan keterangan advertorial, iklan, ads, sponsored atau kata lain yang menjelaskan bahwa berita/artikel/isi tersebut adalah iklan.</li></ol><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">7. Hak Cipta</span></p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Media siber wajib menghormati hak cipta sebagaimana diatur dalam peraturan perundang-undangan yang berlaku.</p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">8. Pencantuman Pedoman</span></p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Media siber wajib mencantumkan Pedoman Pemberitaan Media Siber ini di medianya secara terang dan jelas.</p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\"><span style=\"font-weight: 700;\">9. Sengketa</span></p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Penilaian akhir atas sengketa mengenai pelaksanaan Pedoman Pemberitaan Media Siber ini diselesaikan oleh Dewan Pers.</p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Jakarta, 3 Februari 2012<br><em>(Pedoman ini ditandatangani oleh Dewan Pers dan komunitas pers di Jakarta, 3 Februari 2012)</em></p><p style=\"margin-bottom: 26px; color: rgb(34, 34, 34); font-family: Verdana, BlinkMacSystemFont, -apple-system, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 15px;\">Sumber:&nbsp;<span style=\"font-weight: 700;\"><a href=\"http://dewanpers.or.id/pedoman/detail/167/pedoman-pemberitaan-media-siber\" style=\"color: rgb(77, 178, 236); text-decoration: none;\">Dewan Pers</a></span></p><p>\r\n                                    </p>', '2021-11-20 02:13:34', '2021-12-06 09:09:38');

-- --------------------------------------------------------

--
-- Table structure for table `headlines`
--

CREATE TABLE `headlines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `headlines`
--

INSERT INTO `headlines` (`id`, `post_id`, `created_at`, `updated_at`) VALUES
(1, 6, '2021-12-03 13:55:30', '2021-12-03 13:55:30'),
(2, 5, '2021-12-03 13:55:37', '2021-12-03 13:55:37'),
(3, 4, '2021-12-03 13:55:44', '2021-12-03 13:55:44'),
(4, 3, '2021-12-03 13:55:56', '2021-12-03 13:55:56'),
(5, 22, '2021-12-03 13:56:03', '2021-12-06 13:02:06');

-- --------------------------------------------------------

--
-- Table structure for table `headlines_categories`
--

CREATE TABLE `headlines_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `headlines_categories`
--

INSERT INTO `headlines_categories` (`id`, `post_id`, `category_id`, `created_at`, `updated_at`) VALUES
(3, 6, 5, '2021-12-04 03:53:12', '2021-12-04 03:53:12'),
(4, 16, 5, '2021-12-05 12:53:16', '2021-12-05 12:53:16');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2021_10_09_131054_create_categories_table', 1),
(6, '2021_10_12_030953_create_tags_table', 1),
(7, '2021_10_12_132935_create_posts_table', 1),
(8, '2021_10_13_151856_create_posts_tags_table', 1),
(9, '2021_10_16_054920_create_redactions_table', 1),
(10, '2021_10_16_063426_create_guidelines_table', 1),
(11, '2021_10_16_063926_create_disclaimers_table', 1),
(12, '2021_10_16_063950_create_contacts_table', 1),
(13, '2021_10_20_110244_create_videos_table', 1),
(14, '2021_10_20_110826_create_tag_video_table', 1),
(15, '2021_10_20_121358_create_breaking_news_table', 1),
(16, '2021_10_20_201011_create_photo_galleries_table', 1),
(17, '2021_10_20_201100_create_photos_table', 1),
(18, '2021_10_20_210646_create_photo_tag_table', 1),
(19, '2021_10_22_151614_create_headlines_table', 1),
(20, '2021_11_19_201731_create_breaking_news_categories_table', 1),
(21, '2021_11_20_091226_create_headlines_categories_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `photos`
--

CREATE TABLE `photos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `users_id` bigint(20) UNSIGNED NOT NULL,
  `categories_id` bigint(20) UNSIGNED NOT NULL,
  `sub_categories` int(11) DEFAULT NULL,
  `post_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_teaser` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_photographer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_caption` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `photos`
--

INSERT INTO `photos` (`id`, `users_id`, `categories_id`, `sub_categories`, `post_title`, `post_teaser`, `post_content`, `slug`, `post_source`, `post_photographer`, `post_caption`, `post_status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'Penganugerahan Transformasi Industri 4.0', 'Texno.id - Suasana Penganugerahan INDI 4.0 Award 2021 di Kementerian Perindustrian, Jakarta, Kamis (2/12/2021). Ajang tahunan yang merupakan inisiatif Kementerian Perindu...', '<p>Texno.id - Suasana Penganugerahan INDI 4.0 Award 2021 di Kementerian Perindustrian, Jakarta, Kamis (2/12/2021). Ajang tahunan yang merupakan inisiatif Kementerian Perindustrian bertujuan meningkatkan produktivitas, efisiensi, dan kapasitas para pelaku industri di Indonesia melalui transformasi industri 4.0 dan dalam ajang ini Robert Bosch Automotive Indonesia menerima penghargaan Indi 4.0 Award 2021 untuk kategori \'Product and Service\' berkat implementasi teknologi industri 4.0 di seluruh proses manufakturnya, serta telah seratus persen terkoneksi secara real time dan berhasil mendigitalisasi proses manual.&nbsp;</p>', 'penganugerahan-transformasi-industri-40', 'Tribunews', 'IRWAN RISMAWAN', 'Penganugrahan Industri 4.0', 'Published', NULL, '2021-12-05 13:03:52', '2021-12-05 13:03:52');

-- --------------------------------------------------------

--
-- Table structure for table `photo_galleries`
--

CREATE TABLE `photo_galleries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `photos` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photos_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `photo_galleries`
--

INSERT INTO `photo_galleries` (`id`, `photos`, `photos_id`, `created_at`, `updated_at`) VALUES
(1, 'assets/photo-gallery/HPnnOuYp05uebFtS5YgExtHkMpya3YzzG8yx2tFz.jpg', 1, '2021-12-05 13:03:52', '2021-12-05 13:03:52'),
(2, 'assets/photo-gallery/54csh0XyRmTzak95jwA8qVhpKOs9bWCiOKcgUsWV.jpg', 1, '2021-12-05 13:03:52', '2021-12-05 13:03:52'),
(3, 'assets/photo-gallery/8tKE3XV8DUkCmHXGpVJXY8KXP6UbvcJwq3sP591g.jpg', 1, '2021-12-05 13:03:52', '2021-12-05 13:03:52');

-- --------------------------------------------------------

--
-- Table structure for table `photo_tag`
--

CREATE TABLE `photo_tag` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` int(11) NOT NULL,
  `photo_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `photo_tag`
--

INSERT INTO `photo_tag` (`id`, `tag_id`, `photo_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `users_id` bigint(20) UNSIGNED NOT NULL,
  `categories_id` bigint(20) UNSIGNED NOT NULL,
  `sub_categories` int(11) DEFAULT NULL,
  `post_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_teaser` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_image_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `users_id`, `categories_id`, `sub_categories`, `post_title`, `post_teaser`, `post_content`, `slug`, `post_status`, `post_image`, `post_image_description`, `deleted_at`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 7, 'Pemerataan Akses Internet Dapat Menjadi Kunci Kemajuan Bangsa', 'Pemerataan akses internet di Indonesia belum berjalan maksimal.', '<p><strong>AlFatihDev </strong>&ndash; Pemerataan akses internet di Indonesia belum berjalan maksimal. Padahal pada zaman serba digital ini, rasanya internet sudah menjadi hak dasar untuk rakyat. Gadget dan internet merupakan dua komponen yang tidak dapat kalian pisahkan.</p>\r\n<h2><strong>Kesenjangan Pemerataan Akses Internet Antar Wilayah</strong></h2>\r\n<p>Indonesia menerapkan pembelajaran jarak jauh (daring) sejak 2019 lalu. Hal tersebut berkaitan dengan mewabahnya virus Covid-19. Tidak hanya dalam dunia pendidikan, sistem daring tersebut juga berlaku di segala sektor. Semua orang berbondong-bondong bekerja dari rumah.</p>\r\n<p>Dalam hal ini, akses internet sangat diperlukan. Internet memungkinkan kita terhubung dengan orang yang jaraknya sangat jauh sekalipun. Tetapi akses internet bukanlah sesuatu yang bisa didapatkan secara instan. Bagi kalian yang tinggal di Pulau Jawa, mungkin internet bukanlah suatu masalah.</p>\r\n<p>Sayangnya, bagi teman kita yang ada di pulau lain, hal ini masih menjadi persoalan. Pemerintah sepertinya belum mampu melakukan pemerataan akses internet. Hal ini tentunya sangatlah mengecewakan.</p>\r\n<h4><strong>Internet di Desa</strong></h4>\r\n<p>Menteri Komunikasi dan Informatika menjelaskan setidaknya ada 12.548 desa dan kelurahan yang belum terjangkau jaringan 4G. Ia juga mengatakan bahwa pemerintah baru merencanakan pemerataan jaringan internet dalam dua tahun ke depan. Fakta tersebut tentunya sangatlah menyedihkan. Mengingat internet dapat menjadi kunci kemajuan di tahun yang akan datang.</p>\r\n<h4><strong>Pentingnya Pemerataan Internet</strong></h4>\r\n<p>Selain dapat menjadi kunci kemajuan bangsa, internet juga menjadi standar kemakmuran suatu negara. Negara yang sudah melakukan pemerataan jaringan internet dapat dikatakan mampu mengikuti perkembangan zaman.</p>\r\n<p>Berikut beberapa manfaat pemerataan jaringan internet.</p>\r\n<h4><strong>Pemerataan Internet Sebagai Kunci Kemajuan Ekonomi</strong></h4>\r\n<p>Pemerataan akses internet sangat berpengaruh terhadap kemajuan ekonomi Indonesia. Hal itu terjadi karena dengan adanya internet yang merata, membuat masyarakat mampu bersaing dan berinovasi secara global.</p>\r\n<p>Indonesia saat ini menerapkan sistem pasar bebas. Sehingga persaingan yang terjadi bukanlah lagi nasional, tetapi antar negara atau internasional. Dengan adanya akses internet diharap masyarakat mampu mencapai pasar global. Internet juga dapat menaikkan jumlah ekspor barang. Penjual dapat mempromosikan produknya di&nbsp;<em>marketplace</em>&nbsp;secara online.</p>\r\n<h4><strong>Internet di Dunia Pendidikan</strong></h4>\r\n<p>Seperti yang kalian ketahui, sejak adanya daring, segala pembelajaran wajib melalui gadget. Artinya, siswa dan guru tidak perlu bertatap muka secara langsung. Mereka hanya perlu membuka laptopnya dan langsung terhubung dengan yang lain.</p>\r\n<p>Penghubung tersebutlah yang bernama internet. Internet dapat mempermudah segala kegiatan kita. Saat ini, ujian pun bisa hanya melalui internet. Pembelajaran dengan internet sangat mempermudah siswa dalam mencari materi dari berbagai sumber.</p>\r\n<p>Sayangnya, akses internet yang cepat belum merata. Di desa terpencil di luar Pulau Jawa, pemerataan jaringan internet masihlah tertinggal. Hal tersebut tentunya menjadi hambatan besar untuk kemajuan teknologi di bidang pendidikan. Mengingat negara lain sudah sangatlah siap dengan sistem pembelajaran jarak jauh.</p>\r\n<h4><strong>Upaya Pemerintah Dalam Pemerataan Internet</strong></h4>\r\n<p>Hasil survei Asosiasi Penyelenggara Jasa Internet Indonesia (APJII) pengguna internet baru di Indonesia naik dengan pesat pada kuartal kedua tahun 2019. Di Asia Tenggara juga Indonesia menempati peringkat ketiga untuk tingkat adopsi internet.</p>\r\n<p>Walaupun berkembang pesat, tetapi penyebaran internet di Indonesia sendiri belum merata. Pemerintah sebenarnya sudah bergerak untuk mengatasi masalah ini. Tetapi upaya pemerintah masihlah lambat dan terlihat belum maksimal.</p>\r\n<p>Salah satu proyek sebagai upaya pemerintah untuk pemerataan jaringan adalah Palapa Ring. Proyek ini membangun akses internet di seluruh Indonesia sepanjang 36.000 kilometer. Pemerintah juga sudah mengalokasikan anggaran sebesar 3T untuk pembangunan infrastruktur telekomunikasi ini</p>\r\n<p>Dengan ini diharap pemerintah bisa lebih cepat dalam melakukan pemerataan akses internet. Tidak hanya terpusat di pulau Jawa, tetapi merata di seluruh Indonesia.</p>', 'pemerataan-akses-internet-dapat-menjadi-kunci-kemajuan-bangsa', 'Published', 'assets/post-images/wtqY5goB7QGQKfWV1uuzHC6purOyPoCPIY2yGUdO.jpg', 'Ilustrasi Pemerataan Akses Internet. Foto: Ist/Net', NULL, '2021-11-20 06:08:48', '2022-03-30 02:54:00'),
(3, 1, 4, NULL, 'Jenis Gerhana Matahari, Berikut Ini Pengertian dan Proses Terjadinya!', 'AlFatihDev - Jenis gerhana matahari sangat penting untuk Anda ketahui', '<p><strong>AlFatihDev</strong>&ndash; Jenis gerhana matahari sangat penting untuk Anda ketahui. Biasanya sebagian orang bahkan belum mengetahui dan melihatnya. Pasalnya, gerhana matahari bisa terjadi karena ketika posisi bulan berada di antara matahari dan bumi.</p>\r\n<p>Biasanya gerhana matahari hanya akan terjadi pada fase bulan baru. Keberadaan bulan akan melintasi antara matahari dan Bumi. Sehingga bayangannya itu akan jatuh ke permukaan Bumi.</p>\r\n<h2><strong>Ketahui Jenis Gerhana Matahari</strong></h2>\r\n<p>Gerhana sendiri merupakan salah satu fenomena alam yang terjadi jika ada objek astronomi seperti bulan dan matahari. Sedangkan gerhana matahari bisa terjadi jika posisi antara kedudukan bulan tepat berada di antara bumi dan matahari.</p>\r\n<p>Jadi gerhana matahari bisa terjadi apabila posisi antara bulan, matahari dan bumi berada pada satu garis sejajar atau lurus. Sehingga hal ini akan membuat Matahari tertutup oleh bulan dan membuat bumi tidak memperoleh cahaya matahari.</p>\r\n<p>Nah, cahaya yang tidak bisa menerobos bumi sebagian saja dan dapat juga secara keseluruhan. Sehingga gerhana matahari ada beberapa jenis yang wajib untuk Anda ketahui, misalnya seperti:</p>\r\n<h4><strong>Gerhana Matahari Sebagian</strong></h4>\r\n<p>Jenis gerhana matahari yang pertama adalah gerhana matahari sebagian yang mana akan terjadi ketika penumbra sudah lewat. Sehingga sebagian dari matahari dapat terlihat ketika gerhana tiba.</p>\r\n<p>Apabila semakin dekat Bumi ke bulan, maka akan semakin besar pula ketidakjelasan cahaya matahari tersebut. Nah jika terjadi gerhana matahari sebagian, kita bisa langsung melihat tanpa takut retina mata akan rusak.</p>\r\n<h4><strong>Gerhana Matahari Cincin</strong></h4>\r\n<p>Gerhana matahari cincin bisa saja terjadi apabila bulan hanya menutup sebagian saja daripada matahari dan selebihnya pancaran dari matahari akan membentuk cincin.</p>\r\n<p>Sederhananya lagi, gerhana ini akan terjadi ketika piringan bulan berada ketika puncak gerhana dan hanya menutupi sebagian piringan matahari.</p>\r\n<p>Jenis gerhana matahari ini akan terjadi apabila ukuran piringan pada bulan lebih kecil daripada piringan matahari. Jadi apabila piringan bulan terletak di depan piringan matahari, maka tak seluruh piringan matahari juga akan tertutup oleh piringan bulan.</p>\r\n<p>Biasanya hal ini akan terjadi karena posisi bulan berada pada titik terjauh dengan bumi, dan bulan akan terlihat lebih kecil. Sedangkan tepi matahari yang masih bercahaya itu menyerupai seperti cincin.</p>\r\n<h4><strong>Gerhana Matahari Total</strong></h4>\r\n<p>Gerhana matahari total bisa terjadi saat matahari tertutup secara penuh oleh bulan. Hal ini terjadi karena bulan berada pada posisi yang berdekatan dengan bumi.</p>\r\n<p>Jenis gerhana matahari total ini hanya bisa Anda lihat dari wilayah permukaan bumi yang terkena dengan bayangan umbra. Meski demikian, gerhana matahari total jarang terjadi dan kemungkinan besar hanya bisa menyaksikan sekali dalam seumur hidup.</p>\r\n<p>Selain itu, gerhana matahari total adalah salah satu pemandangan yang begitu indah, akan tetapi juga sangat membahayakan mata. Sehingga saat terjadi gerhana matahari total, Anda wajib menggunakan kacamata khusus supaya lebih aman dan tidak merusak mata.</p>\r\n<h4><strong>Gerhana Matahari Hibrida</strong></h4>\r\n<p>Gerhana matahari hibrida sendiri merupakan gabungan antara gerhana matahari cincin dan gerhana matahari total. Pada titik tertentu, dapat muncul sebagai gerhana cincin dan di titik tertentu juga bisa terjadi gerhana matahari total.</p>\r\n<p>Dalam arti lain bahwa ini merupakan gerhan annular total dan akan terjadi saat bulan mendekati batasnya umbra akan mencapai bumi. Gerhana hibrida awalnya akan menyebarkan bagian ujung umbra dan tidak dekat dengan bumi.</p>\r\n<p>Selanjutnya akan menjadi total ketika kebulatan planet sudah mencapai ke atas dan potong ujung bayangan, lalu kembali ke bentuk lingkaran. Biasanya jenis gerhana matahari hibrida ini tidak akan terjadi pada semua tempat di belahan bumi dan hanya terjadi pada wilayah tertentu.</p>', 'jenis-gerhana-matahari-berikut-ini-pengertian-dan-proses-terjadinya', 'Published', 'assets/post-images/9FdYjNGQUt86A9BI4ReNiyU9kg80qsSUj7ezbB8N.jpg', 'Ilustrasi Jenis gerhana matahari. Foto: Ist/Net', NULL, '2021-12-03 02:19:21', '2022-03-30 03:13:33'),
(4, 1, 2, NULL, 'Bisnis Internet Cafe Game, Begini Cara Memulai Usahanya Agar Sukses!', 'AlFatihDev - Bisnis internet cafe merupakan salah satu jenis usaha skala kecil', '<p><strong>AlFatihDev </strong>&ndash; Bisnis internet cafe merupakan salah satu jenis usaha skala kecil atau besar yang cukup kuat dan menguntungkan bagi kemitraan atau perorangan. Pasalnya itu semua tentu ada hubungannya dengan modal dan ini merupakan bisnis gabungan maupun pribadi.</p>\r\n<p>Seperti yang kita ketahui bahwa warnet mampu menghadirkan sejumlah rangkaian masalah yang harus kita pertimbangkan sebelum menjalankannya. Jadi sebagai pengusaha bisnis hal utama atau kualitas yang Anda butuhkan yaitu berupa menjadi sosial.</p>\r\n<h2><strong>Ketahui Bisnis Internet Cafe yang Cukup Menguntungkan</strong></h2>\r\n<p>Cyber cafe atau warnet merupakan salah satu bangunan kecil atau besar, yang mana seseorang bisa pergi kesana untuk melakukan berbagai kegiatan. Mulai dari googling, browsing, fotokopi, percetakan, dokumentasi, laminating, desain dan masih banyak lagi.</p>\r\n<p>Namun sebagian besar orang melihat warnet merupakan jenis pekerjaan yang cukup menguntungkan yang pernah ada. Jika ingin memulainya, maka anda tidak harus menekankan sendiri namun Anda perlu menekankan otak Anda.</p>\r\n<p>Dengan tujuan untuk mencari celah guna menghasilkan keuntungan yang lebih banyak. Jika Anda berkeinginan untuk membuka usaha tersebut, berikut ini ada beberapa tips yang bisa Anda lakukan dengan mudah.</p>\r\n<h4><strong>Memilih Lokasi</strong></h4>\r\n<p>Untuk memulai bisnis internet cafe maka Anda harus mampu untuk memilih lokasi strategis yang tentunya lebih ramai dari para pengunjung. Dengan demikian Anda tidak boleh sembarangan dalam menentukan tempat untuk warnet game online tersebut.</p>\r\n<p>Meskipun Anda harus mengeluarkan modal lebih banyak, namun itu hanya sementara atau di awalan saja ketika menyewa tempat. Jika sudah berjalan, maka bisnis anda mampu mendatangkan keuntungan yang besar jika ramai pelanggan.</p>\r\n<p>Selain itu pastikan juga bahwa Anda harus mempunyai lisensinya guna bisa mendirikan usaha permainan tersebut. Hal ini bertujuan supaya sewaktu-waktu tidak terkena masalah hukum sebab mendirikan bisnis tanpa seizin.</p>\r\n<h4><strong>Perlengkapan</strong></h4>\r\n<p>Memulai bisnis internet cafe yang kedua adalah dengan memenuhi segala persyaratannya mulai dari perlengkapan alat-alat. Tentukan berapa banyak komputer yang akan Anda gunakan untuk membuka usaha tersebut.</p>\r\n<p>Hal yang mustahil untuk sukses jika bisnis ini tidak ada perangkat elektronik berupa peralatan memadai tersebut. Tidak hanya itu saja, melainkan Anda juga harus menyiapkan mesin fotokopi, saklar, router, pemindai, DVD, flashdisk dan lain sebagainya.</p>\r\n<p>Jika semua peralatan sudah ada dan lengkap, maka langkah berikutnya adalah dengan menyiapkan peralatan pendukung lainnya. Mulai dari meja, kursi, kipas angin atau AC, TV, lukisan tembok serta furniture lain yang bisa memperindah suasana.</p>\r\n<h4><strong>Memilih Game</strong></h4>\r\n<p>Bisnis internet cafe hampa rasanya jika tidak ada permainan, sebab keutamaan dalam menjalankan usaha ini adalah karena adanya game. Sehingga Anda harus mampu memilih jenis game yang cocok untuk semua pelanggan tidak hanya terbaik saja.</p>\r\n<p>Sebab terbaik terkadang belum tentu mampu sesuai dengan keinginan para pelanggan. Bagaimana tidak, sebab setiap segmen konsumen tentunya akan mempunyai minat yang berbeda-beda.</p>\r\n<p>Oleh sebab itu Anda bisa memilih jenis game yang berbasis web untuk usaha cafe internet Anda tersebut. Jika memilih game berbasis web itu, maka Anda bisa memiliki pembaruan secara otomatis dan instan serta menjalankan pengaturan lebih mudah.</p>\r\n<p>Untuk bisa mengetahui apakah game memiliki basis web atau tidak yaitu dengan cara memainkannya ke dalam dua media berbeda. Yakni bisa dengan menggunakan web maupun perangkat PC.</p>\r\n<p>Apabila dapat dimainkan pada kedua media tersebut, itu tandanya bahwa game itu merupakan permainan berbasis web. Sebenarnya bisnis internet cafe ini sangat menguntungkan jika Anda benar-benar menjalaninya dengan serius.</p>', 'bisnis-internet-cafe-game-begini-cara-memulai-usahanya-agar-sukses', 'Published', 'assets/post-images/PB8PigO30kpdcJ8vnvmdVgBMVULvAxaHTDdADWHS.jpg', 'Ilustrasi Bisnis internet cafe. Foto: Ist/Net', NULL, '2021-12-03 02:21:10', '2022-03-30 03:13:19'),
(5, 1, 3, NULL, 'Oppo Reno6 5G, HP Terjangkau dengan Kapasitas Kamera yang Besar', 'AlFatihDev - Oppo Reno6 5G merupakan smartphone terbaru besutan perusahaan asal Tiongkok yang hadir dalam dua varian, satu yang lainnya adal...', '<p><strong>AlFatihDev</strong> &ndash; Oppo Reno6 5G merupakan smartphone terbaru besutan perusahaan asal Tiongkok yang hadir dalam dua varian, satu yang lainnya adalah varian Pro. HP ini hadir dengan RAM dan kapasitas baterai yang sangat besar.</p>\r\n<p>Bahkan penjualan perangkat Android itu cukup laris di Indonesia, sebab memiliki harga cukup terjangkau. Selain harga murah, tampaknya spesifikasi HP yang satu ini juga mumpuni. Apa saja?</p>\r\n<h2><strong>HP Oppo Reno6 5G Telah Hadir di Indonesia Membawa Spesifikasi Mumpuni</strong></h2>\r\n<p>Selain hanya versi 4G, perusahaan Oppo rupanya juga sudah berhasil menghadirkan anggota Reno6 Series dengan dukungan jaringan 5G. Selain itu, ponsel ini juga membawa desain sangat stylish lengkap dengan menggunakan teknologi terkini, terutama kamera.</p>\r\n<p>Pasalnya, smartphone ini hadir dengan membawa desain Retro Ultra-Slim, yang mana pada bagian tepinya tidak melengkung. Meskipun tampilan desain tepi yang rata, rupanya tidak mengganggu dan akan selalu nyaman untuk kita genggam.</p>\r\n<p>Dengan bobot yang terbilang lebih ringan yakni sebesar 182 gram saja, maka mudah kita bawa dan genggam. Penasaran dengan spesifikasi terbarunya? Berikut ini ulasannya!</p>\r\n<h4><strong>Desain Layar Lebih Luas</strong></h4>\r\n<p>Ponsel Oppo Reno6 5G ini membawa ukuran layar seluas 6,5 inch dengan kekuatan refresh rate 90Hz serta touch samping 180Hz. Sedangkan pada bagian atas layar, ada sebuah lubang kamera selfie sebesar 32MP.</p>\r\n<p>Lebih lanjut, ponsel anyar dari Oppo ini memiliki jenis layar AMOLED serta dengan dukungan HDR10, sehingga pengguna merasa lebih nyaman. Pindah ke bagian belakang layar, yang mana ada sebuah kamera sebanyak 3 buah.</p>\r\n<p>Kamera-kamera tersebut terdiri dari kamera utama sebesar 64MP, ultra-wide sebesar 8MO dan juga macro sebesar 2MP. Jadi secara keseluruhan, kamera itu sudah mendapatkan dukungan berupa fitur Color Temperature sensor, bokeh flare portrait video.</p>\r\n<h4><strong>Jantung Pacu</strong></h4>\r\n<p>Smartphone Oppo Reno6 5G ini hadir dengan otak MediaTek Dimensity 900 5G pada fabrikasi 6nm dengan performa terbaik. HP Oppo itu tidak menggunakan prosesor Qualcomm Snapdragon layaknya varian Reno6 standar atau biasa.</p>\r\n<p>Sehingga dengan MediaTek Dimensity 900 ini sebab bisa untuk menjalankan semua pekerjaan secara maksimal. Lebih lanjut lagi, untuk masalah kapasitas RAM, Oppo telah menyematkan RAM sebesar 8GB dengan ROM sebesar 128GB.</p>\r\n<p>Bahkan ponsel ini juga membawa jenis software yang bisa meningkatkan pengalaman selama bermain berbagai macam game. Mulai dari fitur Quick Startup yang dapat mempersingkat loading time berguna untuk menjalankan game.</p>\r\n<h4><strong>Kapasitas Baterai Lebih Besar</strong></h4>\r\n<p>Dari segi baterai Oppo Reno6 5G ini membawa kapasitas baterai sebesar 4.300 mAh lengkap dengan dukungan fast charging hingga 65Watt. Ada juga fitur lain yang dapat Anda peroleh dari HP ini, seperti jaringan WiFi serta sensor sidik jari pada bagian bawah ponsel.</p>\r\n<p>Dengan kapasitas baterai yang cukup besar, maka para pengguna tidak perlu khawatir jika baterai tersebut akan boros. Pasalnya, HP ini dapat mengisi baterai hingga 100% dalam keadaan kosong hanya dalam waktu sekitar 30 menit saja.</p>\r\n<p>Oppo memang sangat terkenal dengan mempercantik hasil jepretan gambar yang sangat bagus, begitu juga dengan kualitas video. Dengan adanya sejumlah fitur seperti Portrait Beautification Video, maka membuat video pengguna terlihat lebih bagus dan cantik.</p>\r\n<p>Perangkat smartphone Oppo Reno6 5G ini memiliki varian warna yaitu Stellar Black dan Aurora yang membawa harga sekitar 8 jutaan rupiah. Sementara untuk model Pro, memiliki harga sekitar 10 jutaan dan setiap pelanggan yang membeli akan memperoleh bonus seperti Oppo Enco Air White. Bagaimana apakah Anda tertarik?</p>', 'oppo-reno6-5g-hp-terjangkau-dengan-kapasitas-kamera-yang-besar', 'Published', 'assets/post-images/ph783iwiEgrjEoPBQ9sFb2VlQXqHFl5KKhc6yGF0.jpg', 'Ilustrasi Oppo Reno6 5G. Foto: Ist/Net', NULL, '2021-12-03 02:23:44', '2022-03-30 03:08:35'),
(6, 1, 5, NULL, 'Game Crypto NFT Sebagai Cara Mudah Dapatkan Uang Digital', 'AlFatihDev - Game crypto NFT sepertinya saat ini sedang populer', '<p><strong>AlFatihDev</strong>&ndash; Game crypto NFT sepertinya saat ini sedang populer karena desas-desus menghasilkan uang. Istilah NFT belakangan ini memang sedang populer digunakan dalam proses jual beli karya digital seperti foto dan video.</p>\r\n<p>Karya yang terjual dalam bentuk NFT tersebut akan tercatat di dalam blockchain. Blockchain merupakan semacam &ldquo;buku besar&rdquo; digital yang mirip dengan jaringan pendukung ethereum, bitcoin, crypto, dan lainnya.</p>\r\n<h2><strong>Mengenal Game Crypto NFT</strong></h2>\r\n<p>Game NFT atau Non-Fungible Token merupakan konsep permainan&nbsp;<em>play to earn</em>. Konsep tersebut juga bukanlah fenomena baru dalam dunia industri digital game.</p>\r\n<p>Konsep&nbsp;<em>play to earn</em>&nbsp;dalam dunia game adalah ketika para pemain atau gamer berkemungkinan memperoleh aset atau item dalam sebuah game. Aset tersebut nantinya dapat pemain tukarkan ke dalam dunia nyata, entah dalam bentuk uang atau alat tukar lainnya.</p>\r\n<p>Namun, seiring dengan majunya teknologi, konsep game&nbsp;<em>play to earn</em>&nbsp;ini mengadopsi teknologi blockchain. Dalam dunia NFT, istilah tersebut memiliki sebutan GameFi atau game dan Decentralized Finance (DeFi). GameFi pertama kali diperkenalkan oleh Founder Yearn Finance pada September 2020.</p>\r\n<h4><strong>Cara Kerja Game NFT</strong></h4>\r\n<p>Cryptocurrency pada game crypto NFT berbeda dari ketika kalian hanya menyimpannya di wallet. Game jenis ini memadukan video game dengan keuangan sistem NFT dalam aturan main, interaksi pemain, dan mekanismenya.</p>\r\n<p>Biasanya pemain atau gamer akan mendapat reward dalam bentuk token ataupun NFT. Jadi, semakin lama bermain, kian banyak juga reward yang akan kalian dapatkan.</p>\r\n<p>Reward tersebut dapat kalian gunakan untuk membeli item lain, menukarkannya ke dalam bentuk uang fiat, hingga jual beli aset digital lainnya. Jumlah uang yang akan kalian dapatkan pun bergantung pada mekanisme game dan permintaan pasar.</p>\r\n<h4><strong>Daftar Game NFT Gratis</strong></h4>\r\n<p>Banyak orang yang tertarik dengan game&nbsp;<em>play to earn</em>&nbsp;ini. Pilihan game jenis ini pun sangatlah banyak di pasaran. Namun, kalian harus tahu bahwa tidak semua game crypto NFT itu gratis.</p>\r\n<p>Beberapa game bertema&nbsp;<em>play to earn</em>&nbsp;ini justru mengharuskan pemainnya untuk menyiapkan sebuah modal awal sebelum mulai bermain. Tak perlu khawatir, berikut beberapa daftar game NFT<em>&nbsp;play to earn</em>&nbsp;yang dapat kalian mainkan secara gratis.</p>\r\n<h4><strong>Gods Unchained</strong></h4>\r\n<p>Game NFT satu ini merupakan permainan menukar kartu yang berada di blockchain. Kalian hanya perlu melawan pemain lain agar sehingga naik peringkat dan mendapat lebih banyak peluang untuk memenangkan kartu berkualitas.</p>\r\n<p>Sama seperti game NFT lainnya, dalam God Unchained kalian dapat memperdagangkan aset yang ada di game. Dalam hal ini, berupa kartu digital.</p>\r\n<p>Bagi kalian pengguna baru juga tidak perlu khawatir. Kalian akan mendapatkan satu set kartu yang dapat digunakan untuk melawan pemain lain dengan peringkat yang sama.</p>\r\n<p>Hal yang harus kalian pahami adalah bahwa set kartu pertama belum bisa masuk di blockchain. Kalian harus memenangkan pertarungan untuk mendapatkan flux.</p>\r\n<p>Flux tersebut nantinya dapat kalian gunakan untuk memalsukan dua kartu trading duplikat dan mencetaknya di blockchain Ethereum.</p>\r\n<h4><strong>Splinterlands</strong></h4>\r\n<p>Game crypto NFT ini merupakan game koleksi kartu. Pemain dalam peringkat yang sama akan bertanding untuk memperoleh kemenangan.</p>\r\n<p>Pemenang dari permainan tersebut akan mendapat banyak set kartu yang dijual pada NFT marketplace untuk kripto. Game permainan koleksi kartu ini bisa kalian mainkan di Android.</p>\r\n<p>Bagi kalian yang penasaran dan ingin mencoba bermain game crypto NFT, maka bisa mencoba rekomendasi game di atas. Kalian tidak perlu mengeluarkan modal untuk bermain.</p>', 'game-crypto-nft-sebagai-cara-mudah-dapatkan-uang-digital', 'Published', 'assets/post-images/uy8OtrBFa9FwEJV50Dz6lvyOzIhFfZ6nF8YCtKr9.jpg', 'Ilustrasi Game Crypto NFT. Foto: Ist/Net', NULL, '2021-12-03 02:31:52', '2022-03-30 03:12:42'),
(7, 2, 6, NULL, 'Memindahkan Foto dari HP ke Laptop, Gunakan Beberapa Metode Berikut', 'AlFatihDev - Memindahkan foto dari HP ke laptop', '<p><strong>AlFatihDev</strong>&ndash; Memindahkan foto dari HP ke laptop dapat Anda lakukan dengan mudah melalui sebuah aplikasi yang bernama Your Phone Companion. Pasalnya dengan aplikasi tersebut Anda tidak harus menghubungkan lagi dengan kabel ke laptop.</p>\r\n<p>Sebab Your Phone Companion ini juga memungkinkan sinkronisasi HP dengan laptop menggunakan Windows 10 dan jaringan WiFi. Meski demikian, masih ada banyak cara lain yang bisa Anda lakukan selain hanya menggunakan aplikasi tersebut.</p>\r\n<h2><strong>Cara Memindahkan Foto dari HP ke Laptop Paling Mudah dan Cepat</strong></h2>\r\n<p>Berfoto atau mengambil gambar merupakan hal yang wajar, sebab dengan berfoto maka seseorang bisa mengabadikan momen mereka. Bahkan foto tersebut dapat mereka abadikan ke dalam memori internal maupun kartu SD (eksternal).</p>\r\n<p>Akan tetapi, guna mencegah hal-hal buruk seperti HP hilang, maka para pengguna perlu melakukan backup ke dalam laptop. Sehingga bagi Anda pengguna smartphone, ada banyak hal yang bisa Anda lakukan dengan cara sangat mudah.</p>\r\n<p>Jadi, demi mengantisipasinya supaya HP memiliki performa yang lebih baik lagi dan tidak lemot akibat memori penuh, ada baiknya pindahkan saja sebagian file seperti foto tersebut ke dalam perangkat laptop, seperti berikut ini:</p>\r\n<h4><strong>Menggunakan Share It</strong></h4>\r\n<p>Untuk memindahkan foto dari HP ke laptop untuk cara yang pertama adalah dengan memanfaatkan atau menggunakan aplikasi bernama Share It. Pasalnya aplikasi yang satu ini sudah sangat populer dan memiliki banyak pengguna karena kemudahannya.</p>\r\n<p>Untuk langkah yang pertama, Anda bisa mengunduh aplikasi tersebut di HP dan perangkat laptop Anda. Kemudian tinggal membuka aplikasi lalu hubungkan dua perangkat Anda dan pilih Scan QR Code supaya lebih mudah lagi.</p>\r\n<p>Selanjutnya Anda tinggal memilih beberapa foto yang Anda simpan dalam ponsel untuk kemudian pindah ke laptop. Apabila sudah terkirim, tinggal klik kanan pada bagian foto yang ada dalam Share It di laptop lalu buka file, maka secara otomatis foto akan tersimpan.</p>\r\n<h4><strong>Menggunakan Your Phone Companion</strong></h4>\r\n<p>Memindahkan foto dari HP ke laptop untuk cara yang kedua adalah dengan menggunakan aplikasi Your Phone Companion. Bahkan caranya juga sangat mudah dan tidak membutuhkan waktu yang begitu lama.</p>\r\n<p>Untuk langkah pertama Anda bisa mendownload aplikasi Your Phone Companion ke dalam HP Android maupun laptop Anda dulu. Jika sudah lalu masuk pada aplikasi tersebut dan ikuti semua petunjuk yang sudah ada.</p>\r\n<p>Langkah berikutnya, Anda tinggal mengklik menu Photo dan pilih beberapa foto yang ingin Anda unduh. Untuk bisa mengunduhnya cukup klik tombol kanan dan Save As, maka secara otomatis foto akan tersimpan.</p>\r\n<h4><strong>Dengan Kabel USB</strong></h4>\r\n<p>Untuk bisa memindahkan foto dari HP ke laptop maka cara yang terakhir ini dapat Anda lakukan dengan menggunakan kabel USB. Jadi Anda bisa gunakan kabel USB yang sering Anda gunakan untuk melakukan pengisian daya baterai.</p>\r\n<p>Langkah yang pertama Anda cukup menyambungkan kabel USB tersebut ke laptop dan juga smartphone Anda. Selanjutnya tinggal buka file eksplorer pada laptop dan cari smartphone atau perangkat baru.</p>\r\n<p>Lalu klik notifikasi itu lalu pilih transfer file, kemudian buka kembali file Explorer pada laptop an cari perangkat yang tersambung. Anda bisa langsung membuka folder perangkat itu dan masuk ke internal untuk mencari fotonya.</p>\r\n<p>Jika sudah maka tinggal pilih beberapa foto yang ingin Anda pindah atau salin ke laptop. Dengan memindahkan foto dari HP ke laptop menggunakan cara seperti ini memang terbilang cukup mudah karena tidak membutuhkan sambungan internet.</p>', 'memindahkan-foto-dari-hp-ke-laptop-gunakan-beberapa-metode-berikut', 'Published', 'assets/post-images/yFP55eyxnVIfarPTtForl1vgCpnYYMKE5InT36ox.jpg', 'Ilustrasi Memindahkan foto dari HP ke laptop. Foto: Ist/Net', NULL, '2021-12-04 06:57:29', '2022-03-30 03:12:24'),
(8, 2, 6, NULL, 'Cara Memperkecil Ukuran Foto di HP Tanpa Mengurangi Kualitas', 'Cara memperkecil ukuran foto di HP', '<p><strong>AlFatihDev</strong> &ndash; Cara memperkecil ukuran foto di HP menggunakan aplikasi lebih mudah. Pada era modern saat ini yang semakin canggih. Bahkan banyak kebutuhan yang muncul. Seperti perlunya mengetahui cara mengecilkan ukuran foto.</p>\r\n<p>Keberadaan kamera yang bagus biasanya memiliki&nbsp;<em>size&nbsp;</em>atau ukuran yang besar. Maka perlu untuk memperkecil ukuran foto tanpa mengurangi kualitasnya. Namun hadirnya teknologi mengecilkan ukuran foto memiliki pengaruh besar.</p>\r\n<p>Anda dapat mencoba mengecilkan&nbsp;<em>size&nbsp;</em>foto menggunakan aplikasi Android. Tidak hanya&nbsp; mudah dan praktis, Anda juga dapat mengecilkan beberapa foto sekaligus.</p>\r\n<h2><strong>Inilah Beberapa Cara Memperkecil Ukuran Foto di HP</strong></h2>\r\n<p>Teknologi yang semakin canggih, memperkecil ukuran foto semakin mudah. Untuk itu ketahui beberapa cara mengubah ukuran foto berikut ini.</p>\r\n<h4><strong>Compress Photo Puma</strong></h4>\r\n<p>Aplikasi ini merupakan pengembangan oleh Farluner Apps and Games. Memiliki tiga mode untuk cara memperkecil MB foto. Penggunaan Auto untuk Anda yang ingin memperkecil ukuran banyak foto sekaligus. Bahkan sebanyak 50 foto dalam satu email.</p>\r\n<p>Sedangkan cara mengubah ukuran foto menjadi 300kb. Anda dapat memilih menggunakan mode File Size. Anda juga dapat memasukan ukuran hasil fotonya secara spesifik.</p>\r\n<p>Selain itu, Anda juga dapat memilih mode Resolution and Quality. Apabila Anda ingin memperoleh hasil foto dengan mengecilkan resolusi secara spesifik. Namun ingin tetap mempertahankan kualitas foto tersebut.</p>\r\n<h4><strong>Video and Photo Compress and Photo Editor</strong></h4>\r\n<p>Aplikasi ini yang hanya memiliki ukuran 8.8 MB. Penggunaannya untuk memperkecil ukuran foto atau video. Cara mengecilkan resolusi foto pada aplikasi ini. Anda dapat memilih menu Image Compress.</p>\r\n<p>Cara memperkecil ukuran foto di HP dengan banyak foto secara bersamaan. Hal itu yang dilakukan dalam satu album dengan menu Album Compress. Fitur yang terdapat dalam aplikasinya juga cukup banyak.</p>\r\n<p>Seperti fitur Video Compress, Video Cutter, dan Audio Cutter. Selain itu terdapat fitur Video to Audio, Image Zoom, serta Image Crop.</p>\r\n<h4><strong>Auto Photo Compress</strong></h4>\r\n<p>Aplikasi Auto Photo Compress ini memiliki kelebihan. Semua hasil fotonya yang telah dikecilkan atau foto original akan tersimpan pada penyimpanan awan (<em>Cloud Drive</em>). Proses penyimpanan tersebut juga secara otomatis.</p>\r\n<p>Aplikasi akan mendeteksi setiap adanya foto baru kemudian menyimpannya. Sehingga Anda tidak perlu khawatir mengenai terjadinya kehilangan data. Cara mengubah ukuran foto menjadi 300 KB juga dapat dilakukannya secara otomatis.</p>\r\n<p>Hal itu karena adanya pendeteksi pada aplikasi ini. Sehingga Anda tidak perlu repot memilih atau memasukkan fotonya. Bahkan kualitas dari foto aslinya juga tidak akan berkurang.</p>\r\n<h4><strong>QReduce Lite</strong></h4>\r\n<p>Aplikasi QReduce yang berukuran sangat kecil 2.3 MB. Sehingga tidak akan menghabiskan memori ponsel Anda. Aplikasi ini merupakan pengembangan oleh Mobso Apps. Penggunaan aplikasi ini sudah lebih dari satu juta orang di seluruh dunia.&nbsp;</p>\r\n<p>Cara memperkecil ukuran foto di HP menjadi 300 kb dengan aplikasi ini cukup mudah. Anda hanya perlu klik Choose Photos. Anda juga dapat memasukan ukuran fotonya yang diperkecil secara spesifik. Kemudian klik Start untuk mulai memperkecil foto tersebut.</p>\r\n<h4><strong>Photo Compress and Resize</strong></h4>\r\n<p>Aplikasi untuk mengecilkan ukuran foto lainnya adalah Photo Compress and Resize. Aplikasi ini yang hanya berukuran sangat kecil 3.0 MB. Tampilan aplikasi ini tampak sederhana dan menarik. Hal tersebut yang membuat banyak orang menyukai aplikasi satu ini.</p>\r\n<p>Cara mengecilkan foto menggunakan aplikasi ini, dengan memilih menu Compress Photos. Anda dapat memilih lebih dari satu foto pada galeri ponsel. Selain itu, juga dapat mengambil gambar secara langsung. Aplikasi ini memiliki menu lainnya, seperti mengubah ukuran foto dan memotong fotonya.</p>\r\n<p>Cara memperkecil ukuran foto di HP dengan adanya teknologi semakin mudah. Anda juga dapat mengecilkan beberapa foto secara sekaligus.</p>', 'cara-memperkecil-ukuran-foto-di-hp-tanpa-mengurangi-kualitas', 'Published', 'assets/post-images/rZAlfbp5S1BtMBSSHnRXfn1SOp1ZsLpj2YkNK0Qw.jpg', 'Ilustrasi cara memperkecil ukuran foto di hp. Foto: Ist/Net', NULL, '2021-12-04 07:03:04', '2022-03-30 03:12:07'),
(9, 2, 1, NULL, 'Cara Mendownload Sertifikat Vaksin dengan Aplikasi Maupun Website', 'AlFatihDev - Cara mendownload sertifikat vaksin wajib Anda ketahui Karena, pemerintah mulai mewajibkan masyarakatnya memilikinya.', '<p><strong>AlFatihDev</strong>&ndash; Cara mendownload sertifikat vaksin wajib Anda ketahui. Karena, pemerintah mulai mewajibkan masyarakatnya memilikinya. Jika Anda sudah melakukan suntik vaksinasi Covid-19, dapat simak artikel ini. Karena sertifikat vaksin merupakan hal yang wajib masyarakat miliki yang akan beraktivitas luar rumah. Aturan tersebut menjadi sebuah usaha pemerintah dalam beradaptasi pada masa pandemi.</p>\r\n<p>Kemudian, penerapan kebijakan dengan bertahap, yakni mulai dari syarat seseorang untuk memasuki pusat perbelanjaan, berkendara untuk perjalanan domestik, syarat bepergian menggunakan transportasi umum.</p>\r\n<p>Jika Anda sudah melakukan vaksinasi, sertifikat akan secara otomatis masuk kedalam sistem yang terdapat di laman PeduliLindungi dalam waktu dekat. Anda hanya perlu mendownload ataupun menunjukan QR Code dari laman website ataupun aplikasi PeduliLindungi saat akan terpakai.&nbsp;</p>\r\n<h2><strong>Cara Mendownload Sertifikat Vaksin dari Aplikasi</strong></h2>\r\n<p>Berikut adalah cara yang bisa Anda lakukan.</p>\r\n<p>&ndash; Download aplikasi PeduliLindungi terlebih dahulu lewat Play Store atau App Store.</p>\r\n<p>&ndash; Setelah selesai mendownload, Buka aplikasi dan buat akun dengan mengisi nama lengkap, nomor ponsel, dan nomor KTP (NIK) atau login bagi yang sudah mendaftar.</p>\r\n<p>&ndash; Masukkan kode OTP untuk verifikasi. Kode OTP dikirim lewat SMS ke nomor yang sudah didaftarkan saat vaksinasi.</p>\r\n<p>&ndash; Berikan akses izin akses lokasi, kamera dan penyimpanan untuk menunjang aplikasi</p>\r\n<p>&ndash; Setelah berhasil, Anda akan melihat tampilan menu dashboard Aplikasi PeduliLindungi pilih paspor digital.</p>\r\n<p>&ndash; Lalu akan muncul Sertifikat Vaksin dan Hasil Test Covid-19, kemudian klik menu &ldquo;Sertifikat Vaksin&rdquo;, dan akan ditampilkan nama lengkap, dan klik pada bagian nama Anda.</p>\r\n<p>&ndash; Akan muncul sertifikat pertama dan kedua, klik gambar Sertifikat Vaksin, dengan begitu anda bisa melihat detail sertifikat.</p>\r\n<p>&ndash; Klik &ldquo;Unduh Sertifikat&rdquo; dibagian kiri bawah&nbsp; jika ingin di download.</p>\r\n<h4><strong>Mendownload dengan Website</strong></h4>\r\n<p>Karena memori penyimpanan yang tidak mencukupi membuat banyak orang merasa enggan atau tidak bisa mendownload sertifikat vaksin melalui aplikasi. Maka dari itu, pemerintah menyediakan website untuk mengatasi solusi tersebut. Ini dia cara mendownload sertifikat vaksin menggunakan website.</p>\r\n<p>&ndash; Anda hanya perlu buka situs<a href=\"https://pedulilindungi.id/\">&nbsp;https://pedulilindungi.id/</a></p>\r\n<p>&ndash; Kemudian pilih menu&nbsp;<em>login</em>/registrasi yang berada di bagian sudut kanan atas (jika Anda belum mempunyai akun Pedulilindungi)</p>\r\n<p>&ndash; Setelah itu, Anda diminta untuk mengisi nama lengkap sesuai KTP dan nomor hp yang digunakan untuk mendaftar vaksinasi sebelumnya.</p>\r\n<p>&ndash; Setelah terisi semua, pilih buat akun kemudian masukan enam digit kode OTP yang sudah dikirim ke nomor Anda melalui SMS</p>\r\n<p>&ndash; Akun PeduliLindungi sudah siap dan Anda sudah bisa login, lalu mengecek sertifikat vaksin.</p>\r\n<p>&ndash; Untuk mengecek sertifikat Covid-19, Anda bisa melakukan hal berikut.</p>\r\n<p>&ndash; Login ke PeduliLindungi dengan buka situs<a href=\"https://pedulilindungi.id/\">&nbsp;https://pedulilindungi.id/</a>&nbsp;</p>\r\n<p>&ndash; Ketik nama lengkap, NIK, tanggal lahir dan tanggal vaksinasi</p>\r\n<p>&ndash; Centang pada kolom captcha</p>\r\n<p>&ndash; Klik periksa dan status vaksin Covid-19 akan segera muncul</p>\r\n<p>&ndash; Untuk mendownload sertifikat Anda hanya perlu login di PeduliLindungi, lalu klik kanan atas pada gambar strip tiga. Klik nama Anda lalu pilih sertifikat vaksin untuk memunculkan sertifikat vaksin. Setelah itu klik gambar sertifikat vaksin, di pojok bawah klik unduh untuk mendownload sertifikat.</p>\r\n<h4><strong>Cara Memperbaiki Data yang Salah</strong></h4>\r\n<p>Jika pada sertifikat vaksin Covid-19 terdapat kesalahan data. Ada baiknya Anda segera memperbaiki sertifikat tersebut.</p>\r\n<p>Kementerian kesehatan menjelaskan bagaimana cara memperbaiki data yang salah. Caranya hanya dengan mengirimkan email ke&nbsp;sertifikat@pedulilindungi.id.</p>\r\n<p>Email yang akan dikirim menggunakan format nama lengkap, NIK KTP, tempat tanggal lahir dan nomor handphone Anda.</p>\r\n<p>Supaya langsung diproses, maka Kemenkes menghimbau Anda menuliskan biodata lengkap serta melampirkan foto. Lalu, juga membawa KTP serta menjelaskan keluhan secara rinci.</p>\r\n<p>Itulah bagaimana cara mendownload sertifikat vaksin tanpa ribet.</p>', 'cara-mendownload-sertifikat-vaksin-dengan-aplikasi-maupun-website', 'Published', 'assets/post-images/vBTTPpMgB4CxSsqyhmTN7eFtwSr04pzC5mRNfqaw.jpg', 'Ilustrasi Cara Mendownload Sertifikat Vaksin. Foto: Ist/Net', NULL, '2021-12-04 07:05:11', '2022-03-30 03:11:43'),
(10, 2, 5, NULL, 'Forza Horizon 5, Game Mobil Racing Besutan Microsoft Akan Segera Rilis', 'AlFatihDev - Forza Horizon 5 sepertinya akan segera rilis', '<p><strong>AlFatihDev</strong> &ndash; Forza Horizon 5 sepertinya akan segera rilis dalam waktu dekat ini dan bakal tersedia dalam edisi Premium, Deluxe juga Standar. Bahkan membutuhkan waktu 3 tahun lamanya bagi Playground Games dan Microsoft untuk merilis seri baru game bergenre open world racing tersebut.</p>\r\n<p>Seperti yang kita ketahui, Forza Horizon sampai Forza Horizon 4, kedua perusahaan developer tersebut merlis dalam waktu 2 tahun. Tampaknya untuk seri game balap andalan dari Microsoft ini akan memiliki dua seri yang cukup berbeda.</p>\r\n<h2><strong>Game Forza Horizon 5 Akan Hadir pada 9 November 2021 Mendatang</strong></h2>\r\n<p>Pengembang Playground Games serta Xbox game Studios kini telah siap untuk merilis game racing terbarunya secara eksklusif di PC dan Xbox. Setelah sebelumnya mereka membuka tahapan pre-order, kini pihaknya kembali membuka preload sampai rilis.</p>\r\n<p>Sementara ungapan ukuran preload dari game tersebut adalah sebesar 103-166GB, baik untuk Xbox maupun PC. Bahkan sebelumnya juga sempat mengumumkan informasi mengenai spesifikasi untuk bisa memainkan game itu.</p>\r\n<p>Sehingga game racing dari Microsoft kini sudah dapat Anda download mulai dari sekarang dan bisa melihat perkiraan unduhannya. Jika Anda masih penasaran mengenai game tersebut, simak penjelasannya berikut ini!</p>\r\n<h4><strong>Latar Belakang di Meksiko</strong></h4>\r\n<p>Game Forza Horizon 5 ini akan mengambil latar belakangnya di wilayah Meksiko dan Anda juga akan menjelajahi dari setiap sudut negara di Amerika Tengah tersebut. Mulai dari padang pasir, hutan hujan, perkotaan, pantai sampai reruntuhan semua objek bersejarah.</p>\r\n<p>Sepertinya Guanajuato juga akan menjadi tempat pusat dari game tersebut untuk saat ini. Sebab kota dengan populasi hingga lebih dari 194 jiwa itu merupakan kota yang kental dengan dunia industri otomotif.</p>\r\n<p>Apabila Anda adalah penggemar veteran Forza, kemungkinan besar merasa cukup familiar dengan mobil-mobil tersebut. Karena ketujuh mobil itu adalah hero car yang menjadi sampul dari setiap masing-masing game itu sendiri.</p>\r\n<h4><strong>Beresolusi Lebih Tinggi</strong></h4>\r\n<p>Seperti yang kita tahu, bahwa beberapa waktu lalu developer mengumumkan mengenai spesifikasi untuk bisa memainkan Forza Horizon 5. Kata mereka supaya bisa memainkan game tersebut di PC, maka harus menggunakan storage minimal 110GB.</p>\r\n<p>Walaupun tergolong besar, sepertinya game tersebut juga bakalan hadir dengan dunia Open-World yang jauh lebih luas daripada seri sebelumnya. Sedangkan untuk seri game baru ini, Playground Games juga akan menggunakan model dan tekstur beresolusi tinggi.</p>\r\n<p>Tidak hanya itu saja, melainkan juga dengan tambahan seperti konten dengan sejumlah mobil-mobil terbarunya itu. Saat ini para pemain sudah bisa menikmati game tersebut namun dalam sesi pre-load, baik yang membeli game maupun melalui Xbox Game Pass.</p>\r\n<h4><strong>Tanggal Perilisan</strong></h4>\r\n<p>Kabarnya game Forza Horizon 5 akan segera rilis pada tanggal 9 November 2021 mendatang dan akan tersedia dalam edisi yang berbeda-beda. Mulai dari standar, deluxe sampai dengan premium pula.</p>\r\n<p>Selain itu game tersebut akan tersedia di beberapa konsol seperti Xbox One, Xbox Series X/S, maupun PC berbasis Windows 10. Sehingga bagi para pemain konsol, kini tidak harus memikirkan mengenai perangkat yang akan mereka gunakan.</p>\r\n<p>Hal ini mengingat sebab game tersebut akan tersedia pula secara eksklusif, terutama untuk konsol Xbox. Sedangkan bagi para gamer PC, mereka juga perlu memikirkan piranti keras mereka mendukung atau tidak.</p>\r\n<p>Selain itu publisher Microsoft juga telah membagikan spesifikasi kedalam tiga kelas, yaitu spesifikasi ideal, minimal dan rekomendasi.</p>\r\n<p>Selain itu game Forza Horizon 5 juga bakal menambahkan lebih banyak lagi mengenai suara mobil terbarunya itu. Bahkan akan ada 11 unique biomes yang siap untuk membuat GPU dan CPU bekerja keras.</p>', 'forza-horizon-5-game-mobil-racing-besutan-microsoft-akan-segera-rilis', 'Published', 'assets/post-images/BEdqkLylgql6rBYbx1E5a8eo3GluWpaeDoQrRlt1.jpg', 'Ilustrasi Forza Horizon 5. Foto: Ist/Net', NULL, '2021-12-04 07:08:13', '2022-03-30 03:11:16'),
(11, 1, 3, NULL, 'HP Sony Xperia Pro-I Telah Rilis dengan Mengandalkan Kamera Canggih', 'HP Sony Xperia Pro-I telah rilis dan merupakan ponsel flagship', '<p><strong>AlFatihDev</strong> &ndash; HP Sony Xperia Pro-I telah rilis dan merupakan ponsel flagship baru yang hadir dengan sejumlah unggulan, terutama pada bagian kameranya. Kabarnya smartphone itu hadir pada tanggal 26 Oktober 2021 dan merupakan brand ternama dari banyaknya ponsel pintar.</p>\r\n<p>Untuk saat ini Xperia Pro-1 juga telah siap untuk bersaing bersama jajaran ponsel kelas sama dan menjadi pilihan terbaik bagi para pengguna. Lalu bagaimana tampang dan spesifikasinya? Simak faktanya berikut!</p>\r\n<h2><strong>HP Sony Xperia Pro-I Telah Hadir, Berikut Spesifikasi Unggulannya!</strong></h2>\r\n<p>Akhirnya perusahaan Sony kembali membuat sebuah kejutan baru, salah satu caranya adalah dengan merilis ponsel terbarunya. Kabarnya ponsel tersebut meluncur untuk menyasar pengguna yang sering membuat konten, sebut saja seperti Youtube.</p>\r\n<p>Sementara itu salah satu hal yang menjadi sorotan paling utamanya adalah pada bagian sektor kamera Sony tersebut. Bagaimana tidak, HP tersebut menggunakan teknologi pencitraan yang canggih, sama seperti kamera mirrorless Alpha Sony itu.</p>\r\n<p>Selain itu smartphone dari Sony ini merupakan salah satu perangkat HP pertama di dunia yang mampu hadir menggunakan sensor tipe 1.0 dan phase detection. Tidak hanya itu saja, melainkan masih ada banyak spesifikasi unggulan yang ada pada ponsel tersebut, seperti:</p>\r\n<h4><strong>Hadir dengan Layar OLED</strong></h4>\r\n<p>Spesifikasi HP Sony Xperia Pro-I ini menggunakan jenis layar OLED hingga 4K seluas 6,5 inch. Bahkan lengkap dengan dukungan refresh rate 120 Hz. Mengingat bahwa ponsel ini adalah untuk para vlogger atau content creator, maka terdapat Vlog Monitor berupa aksesori monitor 720p 3,5 inch.</p>\r\n<p>Terletak pada bagian belakang bodi dan memungkinkan para penggunanya untuk merekam film menggunakan sensor kamera tipe 1,0 inch itu. Dengan fungsi kamera yang super canggih, maka para pengguna harus membutuhkan penyimpanan dalam jumlah yang lumayan besar.</p>\r\n<p>Namun tidak perlu khawatir, sebab Sony berhasil menawarkan sebuah penyimpanan internal sebesar 512GB dan slot kartu microSD. Sehingga para pengguna bisa melakukan memperluas kapasitas penyimpanan mencapai 1TB.</p>\r\n<h4><strong>Kamera Terbaik</strong></h4>\r\n<p>Lebih lanjut untuk HP Sony Xperia Pro-I dan demi menyempurnakan fungsi auto fokusnya, maka ada titik phase-detect AF hingga 315 (21&times;15). Tidak hanya itu saja, melainkan aplikasi antarmuka kamera hampir sama seperti UI Kamera Mirrorless Sony Alpha.</p>\r\n<p>Sensor kamera smartphone tersebut seperti sensor kamera utama sebesar 12MP ultra wide. Lalu sebesar 12MP untuk telephoto dan 2X Zoom Optics. Selain itu ada fitur unggulan lainnya mulai dari Multi-Frame Noise Reduction yang berguna untuk mengurangi noise objek.</p>\r\n<p>Semenatara ada OIS atau Optical Image Stabilization yang bisa membuat kamera lebih stabil saat sedang mengambil gambar atau merekam video. Ada juga kemampuannya berupa perekaman video menggunakan resolusi sebesar 4K pada frame rate 120fps.</p>\r\n<h4><strong>Jantung Pacu dan Fitur Lain</strong></h4>\r\n<p>Lanjut jantung pacu HP Sony Xperia Pro-I. Ponsel tersebut telah menggunakan Chipset Qualcomm Snapdragon 888 5G dan perpaduan RAM sebesar 12GB. Selain itu smartphone tersebut telah menjalankan sistem operasi berupa Android 11 dan mendapat pembaruan saat Android 12 rilis.</p>\r\n<p>Sementara itu Sony telah mengantongi sertifikat berupa IP65/IP68 dust/water resistant yang mampu bertahan hingga 30 menit di dalam air. Lebih lanjut, ponsel tersebut membawa kapasitas baterai sebesar 4500 mAh dengan dukungan berupa teknologi Fast Charging berkecepatan 30W.</p>\r\n<p>Itu artinya Sony mampu mengisi daya baterai sebanyak 50% mulai dari 0% dalam waktu yang sangat cepat, yaitu sekitar 30 menit saja. HP ini juga hadir membawa BIONZ X yang berguna untuk seluler. Lalu LSI Front-End dan mampu memberi kecepatan serta kualitas gambar terbaik.</p>\r\n<p>Kabarnya HP Sony Xperia Pro-I akan mulai dijual pada Desember 2021 mendatang dengan harga sekitar 25 jutaan rupiah melalui penawaran resmi di AS. Selain itu ponsel ini akan tersedia pula di Jerman, Inggris, Belanda, Inggris dan Nordik.</p>', 'hp-sony-xperia-pro-i-telah-rilis-dengan-mengandalkan-kamera-canggih', 'Published', 'assets/post-images/W1Z1RWjXqswgDzXE5Q1SnDz0blXMPFpKn1q7E8Id.jpg', 'Ilustrasi HP Sony Xperia Pro-I. Foto: Ist/Net', NULL, '2021-12-04 07:35:07', '2022-03-30 03:11:00'),
(12, 1, 3, NULL, 'HP Oppo K9s Telah Hadir di China dengan Mengusung Baterai 5000 mAh', 'AlFatihDev - HP Oppo K9s sepertinya sudah meluncur di China', '<p><strong>AlFatihDev</strong> &ndash; HP Oppo K9s sepertinya sudah meluncur di China dan merupakan model ketiga dari varian Oppo K9 setelah Oppo K9 Pro dan Oppo K9 reguler. Menurut lansiran dari Gizmochina sejak 20 Oktober 2021, tampaknya K9s ini meluncur dan hampir sama seperti Realme Q3s.</p>\r\n<p>Hanya saja berbeda pada refresh rate layar, ukuran tampilan, software maupun pengaturan bagian kamera belakangnya. Lalu bagaimana desain dan spesifikasi HP dari Oppo tersebut? Berikut penjelasannya!</p>\r\n<h2><strong>HP Oppo K9s Telah Meluncur Sejak Rabu, 20 Oktober 2021 di China</strong></h2>\r\n<p>Tampaknya perusahaan Oppo sudah berhasil mengungkapkan teaser mengenai keberadaan smartphone kelas menengah terbaru. Ponsel baru itu bernama Oppo K9s yang membawa otak berjenis chipset mid-range premium.</p>\r\n<p>Kabar terbaru bahwa HP tersebut hadir membawa kapasitas baterai sebesar 5000 mAh dan fitur pengisian cepat yakni VOOC 30 W. Ini merupakan HP keluarga Oppo K9 Series yang sebelumnya sudah diperkenalkan oleh perusahaan.</p>\r\n<p>Memang belum ada informasi yang jelas mengenai ketersediaan HP itu secara global. Meski demikian spesifikasi dan bocoran lain sudah tersebar luas, misalnya seperti berikut ini.</p>\r\n<h4><strong>Jantung Pacu dan Baterai</strong></h4>\r\n<p>Untuk dapur pacu dari HP Oppo K9s ini pasalnya telah membawa jenis chipset berupa Qualcomm Snapdragon 778G. Tidak hanya itu saja, melainkan juga dengan dukungan RAM LPDDR4X sebesara 8GB dan penyimpanan UFS 2.2. hingga 128GB.</p>\r\n<p>Smartphone dari Oppo ini membawa kapasitas baterai yang cukup besar yakni sebesar 5000 mAh dengan pengisian daya cepat sebesar 3oW. Sementara dari segi fiturnya, HP ini membawa dukungan berupa slot dual-SIM, GLONASS maupun GALILEO.</p>\r\n<p>Tidak hanya itu saja, melainkan dengan koneksi berupa WiFi 6 dual-band, Bluetooth, port USB Type-V, GNSS dan juga headphone 3.5mm. Bahkan lebih menariknya lagi, Oppo telah mengklaim dengan pengisian yang super cepat yakni kurang lebih selama 1 jam saja.</p>\r\n<h4><strong>Desain Layar</strong></h4>\r\n<p>Dari segi layar, HP Oppo K9s ini membawa jenis layar berupa LCD lengkap dengan resolusi FHD+ dan touch sampling sebesar 240Hz. Serta dengan rasio screen to boy hingga 90,8% dan ada punch hole pada bagian pojok kiri atas.</p>\r\n<p>Panel layar tersebut seluas 6,59 inch 1080 x 2412 pixels dengan dukungan refresh rate sebesar 120 Hz. Sedangkan adanya desain berupa punch hole pada layar atas itu berguna untuk dudukan kamera bagian depan.</p>\r\n<p>Untuk kebutuhan kamera selfie, maka Oppo memberikan kapasitas kamera depan sebesar 16MP. Sedangkan untuk bagian kamera utama nya beresolusi sebesar 64MP, kamera makro 2MP dan kamera ultra wide sebesar 8MP.</p>\r\n<h4><strong>Spesifikasi Lain dan Harga</strong></h4>\r\n<p>Perangkat HP Oppo K9s ini memiliki bobot sebesar 199 gram dengan dimensi 164,43 x 75,88 x 8,52 mm saja. Sementara itu ponsel dari Oppo itu hadir dengan tiga varian warna yaitu Neon Silver Sea, Obsidian Warrior dan Magic Purple Quicksand.</p>\r\n<p>Sementara itu Oppo K9s itu juga hadir dalam dua varian memosi yakni sebesar 6/128GB dan juga 8/128GB. Seperti tadi, bahwa smartphone ini mirip atau sama dengan HP terbaru dari Realme Q3s yang meluncur di China waktu lalu.</p>\r\n<p>Ponsel ini telah meluncur di China pada 20 Oktober dan kabarnya akan mulai dijual pada bulan November mendatang. Meski demikian belum diketahui apakah HP ini akan masuk juga ke pasar internasional atau malah tidak.</p>\r\n<p>Sementara untuk masalah harga, perangkat HP Oppo K9s ini memiliki harga sekitar 3,7 juta untuk varian 6/128GB dan 4,1 juta untuk varian 8128GB. Apakah Anda tertarik dengan ponsel tersebut?</p>', 'hp-oppo-k9s-telah-hadir-di-china-dengan-mengusung-baterai-5000-mah', 'Published', 'assets/post-images/Jp3RO4p3jwDqdhPZioHOQnBDJA8hhmd914rbJnuG.jpg', 'Ilustrasi HP Oppo K9s. Foto: Ist/Net', NULL, '2021-12-04 07:36:32', '2022-03-30 03:10:45');
INSERT INTO `posts` (`id`, `users_id`, `categories_id`, `sub_categories`, `post_title`, `post_teaser`, `post_content`, `slug`, `post_status`, `post_image`, `post_image_description`, `deleted_at`, `created_at`, `updated_at`) VALUES
(13, 1, 3, NULL, 'HP Apple iPhone 13 Pro Max Terbaru dengan Baterai yang Lebih Hemat', 'AlFatihDev - HP Apple iPhone 13 Pro Max sudah resmi rilis yang memiliki berbagai keunggulan.', '<p><strong><a href=\"https://texno.id/\">AlFatihDev</a></strong>&nbsp;&ndash; HP Apple iPhone 13 Pro Max sudah resmi rilis yang memiliki berbagai keunggulan. CEO Apple telah memperkenalkan model terbaru ini ke seluruh negara tujuan. Karena termasuk produk unggulan maka tersemat spesifikasi yang lebih unggul.</p>\r\n<p>Hal tersebut bisa terlihat dari beberapa bagian ponsel. Sebagai ponsel terbaru masa kini tentunya memiliki harga penjualan yang cukup tinggi. Penggemar iPhone 13 Pro Max bisa mendapatkannya dengan harga 1.099 dollar AS.</p>\r\n<p>Jika harga tersebut dimasukkan ke dalam rupiah mungkin seharga Rp 15 jutaan. Tetapi harga tersebut tidak membohongi kualitas ponsel. Sehingga akan mendapatkan ponsel unggulan yang terdepan.</p>\r\n<h2><strong>Spesifikasi HP Apple iPhone 13 Pro Max Terbaru</strong></h2>\r\n<p>Pada 14 September 2021 lalu, Apple resmi meluncurkan produk terbaru iPhone 13. Kini ponsel tersebut segera hadir ke pasar Indonesia dan sekitarnya. Tentunya membawa sejumlah spesifikasi unggulan yang bisa diandalkan.</p>\r\n<h4><strong>Desain</strong></h4>\r\n<p>Melihat dari desain ponsel pastinya sangat mewah karena memiliki bahan tambahan dari kaca jenis Gorilla Glass. Ukuran bodi yang sangat pas pada genggaman tangan menjadi kelebihan tersendiri. Layar ponsel ini memiliki ukuran 6.7 inci.</p>\r\n<p>Tentunya mendapatkan dukungan layar Super Retina XDR OLED dengan HDR10. Bahkan bisa mampu menembus kecepatan refresh hingga 120 Hz. Resolusi layar iPhone 13 Pro Max ini bisa mencapai 1284 x 2778 piksel dan rasio 19.5 : 9.</p>\r\n<h4><strong>Performa dan Dapur Pacu Ponsel</strong></h4>\r\n<p>HP Apple iPhone 13 Pro Max tersaji dengan performa yang super unggul. Menggunakan sistem operasi iOS 15 yang jauh lebih baik dari sebelumnya. Ponsel ini memiliki dukungan penuh dengan chipset Apple A15 Bionic 5 nm.</p>\r\n<p>Selain itu juga memperoleh dukungan full dari CPU Hexa-core (2&times;3.22 GHz + 4xX.X GHz). Bahkan dukungan penuh juga berasal dari GPU bermodel Apple grafik 5 inci. Sehingga ponsel bisa berjalan dengan cepat tanpa adanya gangguan.</p>\r\n<p>Terkait dengan ruang penyimpanan iPhone selalu mengutamakan besarnya ruang. Sehingga ponsel ini hadir dengan RAM 6G. Tetapi untuk ruang penyimpanan terdapat 3 varian yang berbeda.</p>\r\n<p>Penggemar iPhone bisa memilih varian internal 128 GB, 256 GB, dan 512 GB. Jika masih kurang, tersedia slot microSD hingga 1 TB. Sehingga cukup untuk memenuhi ruang penyimpanan yang Anda inginkan.</p>\r\n<h4><strong>Kualitas Kamera</strong></h4>\r\n<p>HP Apple iPhone 13 Pro Max terkenal dengan kameranya yang sangat menarik. Tersedia kamera utama dengan resolusi 12 MP. Kemudian ada kamera ultra wide dan telephoto yang masing-masing beresolusi 12 MP.</p>\r\n<p>Sudah pasti untuk kategori iPhone besaran resolusi ini sangat baik dan mumpuni. Tidak lupa kamera selfie yang juga beresolusi 12 MP tersedia untuk para pengguna. Bahkan ada beberapa fitur tambahan untuk mendukung pengambilan gambar berupa foto maupun video.</p>\r\n<p>Fitur tersebut adalah lampu kilat dual LED ganda. Lalu ada fitur panorama yang sangat cantik. Kamera ponsel ini juga sudah mendukung fitur HDR yang sangat jelas dan berkualitas.</p>\r\n<h4><strong>Baterai Ponsel</strong></h4>\r\n<p>HP Apple iPhone 13 Pro Max memiliki kualitas baterai yang sangat unggul. Menggunakan baterai jenis Li-Ion 4373 mAh tanam. Baterai tersebut bisa bertahan hingga 95 jam penggunaan.</p>\r\n<p>Pengguna tidak akan khawatir kehabisan baterai saat bermain ponsel seharian. Jikalau daya sudah habis, terdapat fitur pengisian cepat hingga 20W. Hal yang menarik adalah pengisian cepat ketika baterai masih memiliki daya 50%.</p>\r\n<p>Hanya membutuhkan waktu 30 menit untuk mendapatkan baterai yang full kembali. Sehingga memudahkan penggunanya untuk tidak menunggu terlalu lama. Hal ini tidak membuat penggunanya merasa bosan.</p>\r\n<p>Dengan kata lain HP Apple iPhone 13 Pro Max sangat mendukung berbagai aktivitas media dan internet. Semua pekerjaan bisa dilakukan tanpa adanya kendala penyimpanan dan jaringan.</p>', 'hp-apple-iphone-13-pro-max-terbaru-dengan-baterai-yang-lebih-hemat', 'Published', 'assets/post-images/wRj86BeGmMZZWJR4PQRwz1Upx1AWHbeeuvnYpmOC.jpg', 'Ilustrasi HP Apple iPhone 13 Pro Max. Foto: Ist/Net', NULL, '2021-12-04 07:38:30', '2022-03-30 03:10:16'),
(14, 1, 3, NULL, 'HP Realme 8i Hadir Membawa Sejumlah Spesifikasi dan Fitur Menarik', 'AlFatihDev - HP Realme 8i tampaknya hadir dengan sejumlah spesifikasi menarik karena kehadirannya mampu menambah jajaran panjang keluarga Re...', '<p><strong>AlFatihDev</strong>&ndash; HP Realme 8i tampaknya hadir dengan sejumlah spesifikasi menarik karena kehadirannya mampu menambah jajaran panjang keluarga Realme 8 Series.</p>\r\n<p>Seperti yang kita ketahui bahwa perusahaan tersebut sudah memperkenalkan beberapa perangkat baru jajaran 8 Series, termasuk Realme 8i.</p>\r\n<p>Pada laman resmi milik Realme, perusahaan tersebut juga memberi tagline &ldquo;Powerfully Smooth&rdquo; pada ponsel terbarunya itu. Bahkan mereka juga membanggakan fitur seperti spesifikasi layar dan dapur pacunya itu.</p>\r\n<h2><strong>Spesifikasi HP Realme 8i, Hadir Membaca Layar Seluas 6,6 Inci</strong></h2>\r\n<p>Generasi terbaru perangkat Realme Series rupanya sudah resmi datang ke pasar Indonesia sejak April 2021 lalu. Sebut saja seperti Realme 8 dan Realme 8 Pro yang menggantikan pendahulunya seperti Realme 7 itu.</p>\r\n<p>Sementara untuk kali ini tampaknya perusahaan juga menghadirkan perangkat anyarnya yang bernama Realme 8i. Kabarnya ponsel terbaru itu memiliki berbagai macam fitur menarik dengan kemampuan cukup mengesankan.</p>\r\n<p>Bagaimana tidak, sebab perangkat smartphone ini mampu mendukung pengalaman para penggunanya dengan mudah. Dengan membawa desain layar yang luas, kapasitas kamera besar, serta dengan teknologi gaming terkini membuat keunggulan semakin nyata.</p>\r\n<h4><strong>Desain Layar Lebih Luas</strong></h4>\r\n<p>HP Realme 8i membawa jenis layar IPS LCD seluas 6,6 inci dengan resolusi Full HD hingga 1080 x 2412 piksel dan refresh rate mencapai 120Hz. Sementara untuk kecerahan puncaknya bisa mencapai hingga 60 nots dengan rasio aspek 20:9 serta kerapatan piksel sebesar 400 PPI.</p>\r\n<p>Selain itu, perangkat Android terbaru ini juga membawa chipset berupa MediaTek di kelas menengah seperti Helio G96. Dengan refresh rate layar yang tinggi, maka akan membuat pengalaman selama scrolling layar lebih baik.</p>\r\n<p>Dengan chipset yang super kencang itu, maka mampu menjadi pendongkrak performa Android untuk melibas deretan game populer. Bahkan perusahaan juga telah mengklaim jika skor AnTuTu Realme 8i ini menembus hingga 350 ribu poin.</p>\r\n<h4><strong>Kapasitas Kamera</strong></h4>\r\n<p>Kabarnya HP Realme 8i ini akan membawa tiga buah kamera belakang yang berkonfigurasi hingga 50MP primer dan seluas 2MP untuk makro. Sementara untuk kamera depth sensornya seluas 2 MP dengan kamera selfie sebesar 16MP.</p>\r\n<p>Dengan kamera yang cukup besar dan mumpuni itu, maka mampu untuk memenuhi kebutuhan fotografi mobile pada kelas menengah. Selain itu, ternyata kamera tersebut juga memiliki berbagai macam fitur menarik dan banyak untuk Anda gunakan.</p>\r\n<p>Misalnya saja Night Mode, Ultra Steady Video, Al Beauty, Expert, HDR, Chroma Boost, dan Portrait Mode. Tidak hanya itu saja, melainkan juga Slow Motion, Al Scene Recognition, Ultra Macro, Timelapse, dan masih banyak lagi lainnya.</p>\r\n<h4><strong>Fitur Lain dan Harganya</strong></h4>\r\n<p>HP Realme 8i menurut perusahaan juga mengklaim jika skor AnTuTu mampu menembus hingga lebih dari 350 ribu poin. Apabila itu benar adanya, maka skor tersebut sangat bertenaga terutama untuk segmen mid-range terjangkau.</p>\r\n<p>Kabarnya Realme RMX3151 itu telah mengantongi sertifikasi TKDN di Kemenperin dan model tersebut ternyata dicurigai dan mengarah ke Realme 8i.</p>\r\n<p>Perlu Anda tahu bahwa bocoran sebelumnya itu mengungkapkan jika RMX3151 terdaftar pada situs sertifikasi Kolombia, India, dan membawa moniker Realme 8i.</p>\r\n<p>Sementara untuk soal harga di varian paling rendah seperti 4GB/64GB memiliki harga sekitar 2,7 jutaan rupiah. Lalu untuk varian memori paling tinggi hingga 6GB/125GB akan memiliki harga sekitar 3,1 juta rupiah.</p>\r\n<p>Kemungkinan besar banderolnya juga tidak jauh berbeda seperti di Indonesia. HP Realme 8i mampu menawarkan nilai jual yang lebih menarik.</p>', 'hp-realme-8i-hadir-membawa-sejumlah-spesifikasi-dan-fitur-menarik', 'Published', 'assets/post-images/jyAaNSAfG4Ak88VYENGu8yqi72C0AczpB8o2vydu.jpg', 'Ilustrasi HP Realme 8i. Foto: Ist/Net', NULL, '2021-12-04 07:40:06', '2022-03-30 03:09:25'),
(15, 1, 3, NULL, 'Samsung Galaxy Wide5 Mengusung Dimensity 700 dan Kamera 64 MP', 'AlFatihDev - Samsung Galaxy Wide5 yang meluncur baru-baru ini.', '<p><strong>AlFatihDev</strong> &ndash; Samsung Galaxy Wide5 yang meluncur baru-baru ini. Samsung meluncurkan smartphone tersebut di Korea Selatan. Sama halnya dengan Galaxy Wide2. Ponsel 5G ini tersedia pula khusus operator seluler populer Korea, SK Telecom.</p>\r\n<p>Ponsel ini juga tiba sebagai Galaxy F42 5G pada pasar lainnya. Hal itu karena kedua perangkat tersebut berbagi nomor model yang sama (SM-E426). Sertifikasi Bluetooth yang terungkap pada bulan Juni.</p>\r\n<h2><strong>Spesifikasi Samsung Galaxy Wide5</strong></h2>\r\n<p>Ponsel satu ini masih terkait dengan Galaxy A22 5G. Bahkan perangkat ini juga berbagi sebagian besar spesifikasinya dari Galaxy A22 5G. Namun bukan salinan 1-ke-1 serta masih memperoleh dukungan oleh Dimensi 700.&nbsp;&nbsp;</p>\r\n<h4><strong>Layar</strong></h4>\r\n<p>Samsung Wide5 memiliki layar diagonal 6,6&rdquo; dengan resolusi 1080p+ serta lekukan berbentuk V. Ponsel ini mendukung kecepatan refresh hingga 90 Hz. Body Samsung Wide5 mengusung dimensi 167.2 x 76.4 x 9 mm dengan bobot 203 gram.</p>\r\n<p>Bagian poni berbentuk huruf V yang tampak di atas layarnya. Bagian tersebut sebagai rumah bagi sensor kamera 8 MP. Sehingga akan siap memenuhi aktivitas selfie dan video call penggunanya.</p>\r\n<h4><strong>Kamera</strong></h4>\r\n<p>Tampak pada bagian belakang Samsung Wide5 ini. Brand yang baru saja merilis Galaxy A03s di Indonesia, kini menyematkan pengaturan tiga kamera. Pada sisi positifnya, kamera utama ponsel ini mengalami peningkatan.</p>\r\n<p>Kamera Samsung Wide5 dengan menghadirkan resolusi 64 MP untuk kamera utama. Selain itu, 5 MP ultrawide dengan FOV 115 derajat dan 2 MP sebagai sensor bokeh.</p>\r\n<p>Namun, kamera selfie tunggal ponsel ini tetap tidak berubah dari sebelumnya. Samsung Galaxy Wide5 menghadirkan resolusi kamera depan 8 MP.</p>\r\n<h4><strong>Processor</strong></h4>\r\n<p>Saat melihat pada dapur pacu Samsung Wide5. Smartphone yang menyandang nomor model SM-E426SW itu. Kini sudah ditenagai oleh chipset MediaTek Dimensity 700. Dapur pacu tersebut yang sudah terintegrasi dengan modem 5G.</p>\r\n<p>Ponsel ini mengusung dengan dua inti Cortex-A76 dengan clock 2,2 GHz. Selain itu, dengan enam inti Cortex-A55 pada 2.0GHz. Fitur Mali G57 MC2 GPU dari Samsung Wide5 yang beroperasi pada frekuensi maksimum 950 MHz.</p>\r\n<p>Ponsel ini sepertinya akan menjalankan Android 11 di luar kotak. Bahkan dengan Samsung One UI 3.1 di atasnya. Samsung Wide5 kini hanya menyediakan dalam satu varian memori. Penyimpanan RAM 6 GB yang terpasang dengan memori internal 128 GB.</p>\r\n<p>Ponsel ini juga masih dapat diperluas dengan kartu microSD. Tambahan slot microSD Samsung Galaxy Wide5 yang mendukung kartu hingga 1 TB. Seperti halnya yang tercatat pada situs web SK Telecom. Kapasitas RAM sebenarnya dapat bervariasi pada tiap negara.</p>\r\n<h4><strong>Fitur</strong></h4>\r\n<p>Samsung Wide5 yang didukung dengan kapasitas baterai sebesar 5.000 mAh. Ponsel ini juga sudah menggunakan&nbsp;<em>fast charging</em>&nbsp;sebesar 15W. Maka, proses untuk pengisian dayanya tidak membutuhkan waktu lama.</p>\r\n<p>Samsung Wide5 juga menyediakan beberapa fitur menarik.&nbsp; Ponsel ini menghadirkan slot dual SIM dengan konektivitas 5G, WiFi, serta Bluetooth. Fitur lainnya seperti GPS, jack audio 3.5 mm dan USB Type-C.</p>\r\n<p>Ponsel ini tidak lupa melengkapi adanya sensor pemindai sidik jari. Tepatnya pada bagian&nbsp; samping yang merangkap tugasnya sebagai tombol power.</p>\r\n<p>Ponsel ini hadir dalam 3 pilihan warnanya, yaitu Hitam, Putih, dan Biru. Samsung Galaxy Wide hanya akan dipasarkan di Korea. Menurut laporan, ponsel tersebut kemungkinan akan segera menuju pada pasar India.</p>\r\n<p>Namun akan mendapatkan pergantian nama menjadi Galaxy F42 5G. Samsung Wide5 di Korea Selatan dipasarkan dengan harga 449.900 won atau sekitar Rp 5.4 juta.&nbsp;</p>\r\n<p>Samsung Galaxy Wide5 sebagian besar spesifikasinya dari Galaxy A22 5G. Ponsel ini hadir menggunakan chipset MediaTek Dimensity 700. Namun mengalami peningkatan pada sisi kamera utama.</p>', 'samsung-galaxy-wide5-mengusung-dimensity-700-dan-kamera-64-mp', 'Published', 'assets/post-images/iTzShNb0uPqXpouHEj2pYJ7DxEhmEKBgULzObQik.jpg', 'Ilustrasi Samsung Galaxy Wide5. Foto: Ist/Net', NULL, '2021-12-04 07:41:44', '2022-03-30 03:03:56'),
(16, 1, 5, NULL, 'Game Moba Lokapala Rilis dan Digelar dalam Ajang PON XX Papua 2021', 'AlFatihDev - Game Moba Lokapala adalah permainan lokal karya Anantarupa Studios di bawahnya PT Melon Indonesia dan merupakan publisher..', '<p><a href=\"https://texno.id/\" target=\"_blank\" rel=\"noreferrer noopener\"><strong>AlFatihDev</strong></a>&ndash; Game Moba Lokapala adalah permainan lokal karya Anantarupa Studios di bawahnya PT Melon Indonesia dan merupakan publisher. Setelah meluncur sejak tahun lalu, rupanya game ini juga melalui fase beta dan akhirnya resmi meluncur.</p>\r\n<p>Sebagai pembuat Lokapala, maka Anantarupa Studios berhasil membuatnya dan esports dari Asia Tenggara juga. Bahkan dalam ajang PON (Pekan Olahraga nasional) XX Papua 2021 game tersebut dipertandingkan dalam ajang tersebut.</p>\r\n<h2><strong>Game Moba Lokapala Menjadi Ajang Pertandingan di PON XX Papua 2021</strong></h2>\r\n<p>Lokapala sendiri merupakan sebuah game mobile Moba yang bertema nusantara, mulai dari nama hingga karakter-karakternya. Misalnya dari tema pewayangan, mythical creature dan mitologi dan budaya Tanah Air.</p>\r\n<p>Selaku CEO Anantarupa Studio yakni Ivan Chen mengungkapkan bahwa game ini awalnya diambil dari bahasa sansekerta, dengan arti Pelindung dari Jagat. Lebih lanjut bahwa Lokapala sendiri bisa mencetak sebagai rekor Esports lokal pertama yang mampu mengikuti turnamen tingkat nasional.</p>\r\n<p>Sedangkan menurut Dedi Suherman selaku CEO PT Melon Indonesia yang menjadi publisher Lokapala juga mengatakan kebanggaannaya pada game itu. Suatu kehormatan karena Lokapala terlibat dalam eksibisi PON XX papua 2021 itu.</p>\r\n<h4><strong>Gameplay</strong></h4>\r\n<p>Dari sisi gameplay, maka Game Moba Lokapala ini sama seperti game Moba lain yakni 5v5 dengan cara menghancurkan tower atau turret musuh. Berbeda dengan hero di Moba lain, Lokapala ini heronya akan bertema tentang kerajaan dengan menggunakan karakter dan kostum ala kerajaan.</p>\r\n<p>Tidak hanya itu saja, melainkan game ini juga membawa grafis yang cukup bagus namun sayangnya tidak terlalu tinggi. Selain itu game ini juga mempunyai ukuran yang lebih ringan daripada game Moba lainnya.</p>\r\n<p>Sehingga Anda tidak harus menggunakan device dengan spek tinggi, setidaknya dengan HP Android minimal memiliki RAM 1GB. Ada juga fitur lain yang mana Anda dapat mengajak teman lain agar bertempur bersama dalam satu area.</p>\r\n<h4><strong>Kehadirannya Menjadi Tantangan Tersendiri</strong></h4>\r\n<p>Kehadiran Game Moba Lokapala ini ternyata juga menawarkan jawaban dari tantangan, jika Indonesia tidak hanya untuk target pasar saja. Melainkan juga mampu untuk bangkit serta menghadirkan game esports dan siap bersaing.</p>\r\n<p>Meski demikian perjuangan tersebut membutuhkan dukungan dari berbagai macam pihak guna memberi kontribusi baik kepada pengembang. Hingga pada akhirnya menjadi salah satu game yang layak dan bisa bersaing dengan jenis game lain.</p>\r\n<p>Selain itu Lokapala juga menjadi titik balik dari perkembangan game nasional yang semakin merosot itu. Selain itu sang publisher juga berharap agar pemerintah supaya mulai memberi dukungan melalui sistem perencanaan.</p>\r\n<h4><strong>Game dalam Ajang PON XX Papua 2021</strong></h4>\r\n<p>Game Moba Lokapala ini menjadi salah satu permainan dalam sebuah acara di PON XX Papua 2021 selain Mobile Legends dan Free Fire. Pasalnya pertandingan Lokapala dalam ajang tersebut juga mengusung sistem friendly match dan bagi siapa saja dapat mendaftarkan sebagai atlet.</p>\r\n<p>Seperti yang kita ketahui bahwa Lokapala ini telah dipertandingkan dalam ajang PON XX Papua 2021 sejak September 2021 lalu. Dalam acara tersebut juga tersedia prize pool dengan hadiah total hingga 200 juta rupiah.</p>\r\n<p>Biasanya pada game Moba yang lain akan memiliki waktu bermain yang cukup lama dalam satu permainan. Apalagi jika permainannya berlangsung panas, maka hal ini akan mengganggu para pemain.</p>\r\n<p>Sedangkan untuk game Moba Lokapala ini rupanya memiliki desain yang mampu membuat permainannya jauh lebih efisien dan cepat. Bagi Anda yang ingin melakukan pendaftaran, segera instal dan dapatkan di PlayStore sekarang juga.</p>', 'game-moba-lokapala-rilis-dan-digelar-dalam-ajang-pon-xx-papua-2021', 'Published', 'assets/post-images/caAMmH5DwWdU0yslfRkQuwY7U5qbCI7BIWiYa27X.jpg', 'Ilustrasi Game Moba Lokapala. Foto: Ist/Net', NULL, '2021-12-04 07:44:36', '2022-03-30 03:07:07'),
(17, 1, 5, NULL, 'Apex Legends Mobile Segera Hadir, Intip Informasinya Berikut Ini!', 'AlFatihDev - Apex Legends Mobile adalah permainan besutan EA', '<p><strong>AlFatihDev</strong> &ndash; Apex Legends Mobile adalah permainan besutan EA yang rencananya akan segera membuat format game untuk ponsel setelah berhasil muncul di PC. Ini adalah game bergenre Battle Royale layaknya seperti Free Fire, Call of Duty Mobile, maupun PUBG.</p>\r\n<p>Pasalnya, Apex Legends ini bisa dengan mudah untuk kamu mainkan di PS4, Xbox One, Nintendo Switch, maupun PC. Sementara dalam permainan akan ada setidaknya 8 karakter baru yang bisa kamu gunakan.</p>\r\n<h2><strong>Game Apex Legends Mobile Akan Segera Hadir dalam Waktu Dekat</strong></h2>\r\n<p>Seperti yang kita ketahui bahwa belum lama ini Respawn Entertainment telah mengkonfirmasi sejumlah wilayah untuk menerima versi beta. Sebut saja seperti Peru, Mesir, Kolombia, Lebanon, juga Indonesia.</p>\r\n<p>Setelah sempat tertunda, akhirnya sang developer tersebut telah mengkonfirmasi bahwa perilisan akan mereka lakukan di Indonesia. Game ini memang hanya tersedia di perangkat Android untuk beta, namun EA juga akan menerapkannya dengan iOS.</p>\r\n<p>Jadi, jika kamu adalah salah satu pemain yang tinggal di wilayah beta, maka bisa segera melakukan pra-pendaftarannya melalui Google Play Store. Apa tujuannya? Supaya bisa mendapatkan kesempatan beberapa undangan yang ada.</p>\r\n<h4><strong>Tidak Akan Menampilkan Permainan Silang</strong></h4>\r\n<p>Sama halnya seperti PC, Apex Legends Mobile akan lebih bebas lagi untuk kamu mainkan ketika tiba saatnya game tersebut meluncur secara nyata. Tetapi ini rupanya tidak akan menampilkan permainan silang bersama versi yang lain.</p>\r\n<p>Sebab, ini akan mempunyai Battle Pass, kosmetik, maupun unlockable yang begitu lebih unik dan menarik. Nah, untuk gameplay, maka game tersebut tengah dikembangkan supaya lebih terasa.</p>\r\n<p>Sehingga perubahan memang perlu dilakukan supaya dapat membuat game tersebut lebih ramah seluler dan semangat permainan yang utuh. Dengan begitu, hal ini akan membuat pengalaman yang super dan luar biasa.</p>\r\n<h4><strong>Closed Beta Test (CBT)</strong></h4>\r\n<p>Berdasarkan pada sebuah akun Twitter milik Apex Legends Mobile yakni Respawn mengungkapkan jika game ini sudah dapat pengguna akses sejak Juli lalu. Akan tetapi, tidak semua pengguna bisa dengan mudah untuk masuk ke dalam game tersebut.</p>\r\n<p>Karena hanya khusus untuk yang sudah mendaftar dan bisa mencoba Closed Beta Test saja yang mendapat keberuntungan. Hal ini karena CBT itu hanya membuka akses server yang memang cukup terbatas saja.</p>\r\n<p>Pemain memang bisa melakukan pra-register dari perangkat mereka, tapi untuk memainkan hanya bisa beberapa orang yang beruntung saja. Apabila kamu adalah salah satu orang yang beruntung, maka bisa mengakses game tersebut.</p>\r\n<h4><strong>Sempat Mengalami Keterlambatan</strong></h4>\r\n<p>Peluncuran dari game Apex Legends Mobile ini pernah mengalami keterlambatan, hal ini berdasarkan pada keterangan oleh CEO EA. Game yang seharusnya sudah meluncur sejak 2020 lalu namun nyatanya malah baru akan meluncur dan hadir di tahun 2021 ini.</p>\r\n<p>Selain itu, permainan ini hanya akan menampilkan peta Tepi Dunia saja dan memiliki beberapa Legenda asli untuk kamu mainkan. Sementara hal lebih lainnya, sepertinya akan tambah setelah peluncuran tiba nanti.</p>\r\n<p>Sementara dari pihak Respawn memang belum bisa menjelaskan mengenai jumlah pemain yang bisa mengakses CBT dari game tersebut. Tetapi mereka mengatakan jika CBT ini akan segera tambah mengenai jumlah kuota.</p>\r\n<p>Sedangkan untuk bisa memainkan game Apex Legends Mobile, dari pihak EA belum mengkonfirmasikan mengenai syarat spesifikasi HP secara lengkap. Tapi khusus untuk Android, harus sudah memiliki jenis chipset berupa Snapdragon sebesar 625 bahkan lebih.</p>', 'apex-legends-mobile-segera-hadir-intip-informasinya-berikut-ini', 'Published', 'assets/post-images/dr3Mm7yKpHy4ngeeTKqrpPrMGYdQRH9kny1anBOa.jpg', 'Ilustrasi Apex Legends Mobile. Foto: Ist/Net', NULL, '2021-12-04 07:47:26', '2022-03-30 03:06:30'),
(18, 1, 5, NULL, 'Game Marvel Future Revolution Dibuka Pra Registrasinya Secara Global', 'AlFatihDev - Game Marvel Future Revolution kini telah dibuka', '<p><strong><a href=\"https://texno.id/\">AlFatihDev </a></strong>&nbsp;&ndash; Game Marvel Future Revolution kini telah dibuka akses pra registrasinya secara global dari Netmarble Corporation serta Marvel Entertainment.</p>\r\n<p>Bahkan dalam peluncuran open world RPG atau Role Playing Game, Netmarble hadirkan berbagai karakter ikonik bersama alur cerita original serta grafis 3D yang memiliki AAA.</p>\r\n<p>Pihak Marvel Future Revolution akan memberikan kualitas game kelas dunia yang menampilkan aksi heroik para pahlawan super Marvel untuk misi penyelamatan alam semesta. Tak bisa kita pungkiri bahwa game yang satu ini berkualitas sehingga sayang jika terlewat begitu saja.</p>\r\n<h2><strong>Kualitas Game Marvel Future Revolution Semakin Meningkat</strong></h2>\r\n<p>Kali ini kisah Marvel Future Revolution berawal ketika sekelompok planet saling bertemu pada multi dimensi yang semakin membentuk sebuah Bumi Utama Baru. Bahkan terdapat beberapa zona yang unik.</p>\r\n<p>Zona tersebut seperti New Stark City wilayah yang memiliki teknologi tinggi, Sakaar wilayah dengan bebatuan tandus, Hydra Empire wilayah paling berbahaya, dan masih banyak zona lainnya.</p>\r\n<p>Pada game tersebut, para pemain bisa menjadi agen dalam tim pahlawan super terbaru Omega Flight. Selain itu, bekerja sama lawan kejahatan dari hadangan penjahat super serta melindungi Bumi Utama dari kehancuran.</p>\r\n<p>Para pemain nantinya diberikan kesempatan dalam memilih delapan karakter pahlawan super. Pahlawan tersebut terdiri dari Captain Marvel, Captain America, Black Widow, Spiderman, Iron Man, Star Lord, Doctor Strange, dan Storm.</p>\r\n<p>Bahkan ada 400 juta koleksi baju ikonik milik Marvel Universe yang dapat dimodifikasi berbagai tampilan unik sesuai kehendak para pemain pada game Marvel Future Revolution.</p>\r\n<p>Simon Sim selaku President of Netmarble US mengatakan bahwa melalui game tersebut, ia mengharapkan dapat memberikan pengalaman yang menyenangkan bagi para penggemar setia Marvel. Bahkan mobile gamers lain dengan menawarkan aksi RPG gameplay unik di dalam skala besar.</p>\r\n<h4><strong>Naik Level Berkat Peran Fitur Squad System</strong></h4>\r\n<p>Dengan adanya fitur Squad System, para pemain game Marvel memiliki kesempatan untuk bisa naik level dan bermain sebagai karakter terbaru.</p>\r\n<p>Tak hanya itu, para pemain dapat menunjukkan keahlian pahlawan super miliknya dalam berbagai mode PvP atau Player versus Player. Hal ini berkaitan dengan pertandingan 1 vs 1 hingga lawan 10 di antara para pemain pada level tinggi.</p>\r\n<p>Bersamaan dengan meningkatnya kualitas para pemain pada game Marvel Future Revolution, maka konten multiplayer terbuka. Hal ini termasuk Special Operation, Blitz, Raids, dan konten lainnya.</p>\r\n<p>Bill Rosemann selaku VP of Creative, mengatakan bahwa hal tersebut mulainya dari menara New Stark City berkilau hingga lorong gelap milik Hydra Empire. Para pemain dalam seluruh dunia bisa berjelajah dan menikmati pemandangan yang luar biasa dari game buatan Netmarble.</p>\r\n<p>Bahkan para pemain bisa melintasi langit seperti Storm atau menerobos musuh seperti Captain America. Hal ini merupakan hal baru yang penuh dengan aksi heroik, humor, drama, dan menjadi kabar gembira untuk seluruh penggemar.</p>\r\n<p>Danny Koo juga menambahkan bahwa kerjasama yang sudah berjalan dengan Netmarble telah membantunya memperluas kualitas game di mata dunia. Bahkan ia sudah tak sabar melihat semua orang menceritakan pengalaman mereka saat bermain game Marvel ini.</p>\r\n<p>Karena Marvel Future Revolution adalah kolaborasi kedua dari Netmarble dan Marvel Entertainment. Game Marvel Future Revolution tersebut tersedia untuk perangkat iOS serta Android yang bisa Anda akses secara gratis tahun ini. Akses pra registrasi sudah terbuka secara global melalui Store dan Google Play.&nbsp;</p>', 'game-marvel-future-revolution-dibuka-pra-registrasinya-secara-global', 'Published', 'assets/post-images/ve3EeDcbErO38cEQxbdZvZqDynAhfJ3pKqRaBWsF.jpg', 'Ilustrasi Game Marvel Future Revolution: Ist/Net', NULL, '2021-12-04 07:49:09', '2022-03-30 03:06:07'),
(19, 1, 6, NULL, 'Tips Memilih Laptop untuk Pelajar Sesuai dengan Kebutuhan Sekolah', 'AlFatihDev  – Tips memilih laptop untuk pelajar perlu diketahui. Hal ini bertujuan agar pemakaiannya bisa dengan tepat. Apalagi saat ini kem...', '<p><strong>AlFatihDev</strong> &ndash; Tips memilih laptop untuk pelajar perlu diketahui. Hal ini bertujuan agar pemakaiannya bisa dengan tepat. Apalagi saat ini kemajuan dunia teknologi berkembang pesat.</p>\r\n<p>Hal ini membuat banyak tempat produksi berinovasi memberikan yang terbaik. Hal ini juga hanya bertujuan untuk bisa memenuhi kebutuhan masyarakat secara luas.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_2_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_2_anchor\"></ins></ins></ins>Berbicara mengenai aktivitas saat ini, memang tak terlepas dengan penggunaan internet. Baik untuk pegawai, ibu rumah tangga hingga anak sekolah.</div>\r\n<p>Cara pembelajaran daring untuk anak sekolah pun sudah diterapkan di penjuru nusantara. Bukan hanya melalui layar smartphone saja, melainkan laptop juga berperan penting.&nbsp;</p>\r\n<p>Laptop pun notabene salah satu benda yang perlu dimiliki demi menunjang aktivitas. Sehingga, tips memilih laptop untuk pelajar ini sangat penting untuk Anda simak.</p>\r\n<p>Beragam tips bisa membantu Anda menemukan perangkat sesuai kebutuhan. Sehingga bisa bermanfaat sebagaimana mestinya.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_3_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_3_anchor\"></ins></ins></ins>Bisa dibilang jika laptop untuk pelajar pun berbeda dengan kebutuhan aktivitas lainnya. Tidak ada salahnya jika Anda menggunakan tips yang tepat sebelum memutuskan membelinya.</div>\r\n<h2>Simak&nbsp;<strong>Tips Memilih Laptop untuk Pelajar Sesuai Kebutuhan</strong></h2>\r\n<p>Dewasa ini, pendidikan telah banyak terjadi dengan memanfaatkan kemajuan teknologi. Hal tersebut tentu dengan tujuan mempermudah dalam proses pembelajaran.</p>\r\n<p>Dengan kemudahan mengakses internet, maka segala informasi yang berupa ilmu pengetahuan bisa Anda dapatkan. Sehingga, pemakaian notebook maupun laptop juga mulai sebagian besar orang minati.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_4_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_4_anchor\"></ins></ins></ins>Bagi orang tua yang ingin mencari laptop untuk keperluan sekolah, wajib memahami cara memilihnya. Membeli laptop tak hanya sekedar melihat harga yang mahal atau justru murah.</div>\r\n<p>Namun, penting untuk memilih sesuai kebutuhan. Meskipun menyesuaikan budget adalah hal yang cukup penting Anda perhatikan. Berikut ini ada beberapa tips memilih laptop untuk pelajar yang bisa Anda ikuti. Tips tersebut antara lain:</p>\r\n<h4><strong>Pilihlah Sesuai dengan Kebutuhan Prioritas</strong></h4>\r\n<p>Hal pertama yang wajib Anda lakukan adalah dengan mengetahui kebutuhan yang harus terpenuhi. Dengan begitu, Anda akan mengerti dan menentukan laptop seperti apa yang sesuai dengan kebutuhan anak.</p>\r\n<p>Tentu saja, karena laptop untuk belajar berbeda dengan laptop untuk bekerja. Sehingga pastikan Anda memilih yang tepat. Tidak ada salahnya gunakan tips memilih laptop untuk pelajar.</p>\r\n<h4><strong>Perhatikan Budget yang&nbsp;</strong>Ada</h4>\r\n<p>Selanjutnya yang tidak kalah pentingnya dalam memilih laptop adalah dengan menyesuaikan budget di kantong. Hal ini terjadi karena laptop mempunyai kisaran harga yang bervariasi berdasarkan spesifikasi serta selera.</p>\r\n<p>Misalnya, Anda tentu tidak perlu membeli laptop untuk gaming yang harganya fantastis. Anda cukup membeli laptop hanya untuk kegiatan belajar atau aktivitas sehari-hari saja.</p>\r\n<h4><strong>Cari Informasi Spesifikasi Laptop Sebelum Membeli</strong></h4>\r\n<p>Tentu saja, Anda perlu lebih dulu mencari segala informasi laptop sesuai kebutuhan sekolah. Misalnya, Anda bisa browsing tentang seluk-beluk perangkat komputer tersebut.</p>\r\n<p>Selain itu, juga bisa bertanya kepada teman atau sanak saudara yang mengerti tentang laptop. Jika sudah mengerti spesifikasi dan kisaran harga, maka pasti bisa memperkirakan budget yang harus Anda sediakan.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_5_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_5_anchor\"></ins></ins></ins>Saat ini sangat banyak jenis dan spesifikasi laptop yang tersedia di pasaran. Dengan begitu, Anda tidak akan merasakan rugi atau mengalami hal buruk yang terjadi.</div>\r\n<p>Dengan memilih laptop yang tepat, tentu aktivitas akan lancar. Bahkan harga yang bisa Anda dapatkan pun sesuai dengan budget yang ada.</p>\r\n<p>Sebaiknya gunakan tips memilih laptop untuk pelajar sebelum membeli. Dengan begitu, anak akan merasa lebih mudah untuk melakukan aktivitas sekolah menggunakan media elektronik.</p>', 'tips-memilih-laptop-untuk-pelajar-sesuai-dengan-kebutuhan-sekolah', 'Published', 'assets/post-images/xGF4KRC9Sp5kgZgu0jBX5OhmTa3A1VLXwiJurwTu.jpg', 'Ilustrasi Tips Memilih Laptop untuk Pelajar. Foto: Ist/Net', NULL, '2021-12-05 12:38:32', '2022-03-30 03:05:40'),
(20, 1, 9, NULL, 'Kargo, Mobil Listrik Pengantar Paket di Masa Depan', 'AlFatihDev - Jasa antar barang, kini masih didominasi oleh kurir manusia. Tapi, bagaimana cara kerja kurir di masa depan?', '<p><strong>AlFatihDev</strong>&nbsp; - Jasa antar barang, kini masih didominasi oleh kurir manusia. Tapi, bagaimana cara kerja kurir di masa depan?</p>\r\n<p><iframe title=\"YouTube video player\" src=\"https://www.youtube.com/embed/vj7B_gLbczk\" width=\"560\" height=\"315\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\"></iframe></p>\r\n<p>Barang bisa saja diantar menggunakan drone, bahkan mungkin robot yang datang mengetuk pintu rumah Anda. Selengkapnya, dalam video di atas.</p>', 'kargo-mobil-listrik-pengantar-paket-di-masa-depan', 'Published', 'assets/post-images/W2KZnN1oyVTXZgRAuJStgmwxVP7Dx6TROAMtfmo6.png', 'Foto: Ist/Net', NULL, '2021-12-05 12:50:03', '2022-03-30 03:05:02'),
(21, 1, 6, NULL, 'Cara Privasi PP WhatsApp dari Orang Tertentu, Berikut Cara Mudahnya!', 'AlFatihDev - Cara privasi PP WhatsApp sebenarnya dapat Anda lakukan dengan cukup mudah. Tidak jauh berbeda dengan aplikasi chatting lainnya,...', '<p><strong>AlFatihDev</strong> - Cara privasi PP WhatsApp sebenarnya dapat Anda lakukan dengan cukup mudah. Tidak jauh berbeda dengan aplikasi chatting lainnya, WhatsApp juga mempunyai fitur photo profil yang mana dapat kita ubah serta simpan sesuai dengan keinginan.</p>\r\n<p>Dengan adanya photo profil tersebut, maka akan terlihat oleh orang lain yang menjadi kontak atau satu grup dengan Anda. Namun terkadang ada sebagian orang yang tidak ingin photo profil mereka terlihat oleh orang lain di WhatsApp.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_2_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_2_anchor\"></ins></ins></ins>Baik itu oleh orang yang tidak Anda kenal, teman, keluarga, hingga kontak tertentu lainnya. Dalam hal ini, WhatsApp pun memberikan solusi agar para pengguna dapat menyembunyikan photo profil mereka.</div>\r\n<h2><strong>Cara Privasi PP WhatsApp Secara Mudah</strong></h2>\r\n<p>Tidak ingin photo profil WhatsApp Anda diketahui oleh orang lain? Tenang saja, karena Anda dapat privasi photo profil WhatsApp dari beberapa orang yang ada di kontak Anda.</p>\r\n<p>Seperti yang Anda ketahui, WhatsApp hadir sebagai salah satu aplikasi chatting dengan berbagai keunggulan fitur lengkap yang dimilikinya. Selain sebagai aplikasi chatting, WhatsApp seringkali digunakan untuk melakukan panggilan suara serta panggilan video.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_3_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_3_anchor\"></ins></ins></ins>Dengan demikian, kita dapat tetap terhubung dengan orang lain meskipun berada dalam lokasi yang jauh. Selain itu, WhatsApp juga memiliki fitur yang dapat Anda gunakan untuk menjaga privasi para penggunanya. Salah satunya adalah privasi photo profil di WhatsApp.</div>\r\n<h4><strong>Langkah-Langkah Memprivasi PP di WhatsApp</strong></h4>\r\n<p>Nah, bagi Anda yang ingin menyembunyikan photo profil di WhatsApp, sebenarnya cara privasi pp di WhatsApp tidaklah sulit. Justru Anda dapat melakukannya dengan mudah dan simple,</p>\r\n<ul>\r\n<li>Langkah pertama buka aplikasi WhatsApp,</li>\r\n<li>Kemudian klik ikon tiga titik yang berada di pojok kanan atas, lalu klik menu Setting atau Pengaturan.</li>\r\n<li>Langkah berikutnya klik menu Akun, kemudian klik Privasi</li>\r\n<li>Pada menu Privasi, cari serta klik menu fitur photo profile. Terdapat tiga pilihan yang dapat menampilkan photo profil di WhatsApp. Pilihan tersebut antara lain semua orang, kontak saya, dan tidak ada.</li>\r\n<li>Pilih semua orang untuk dapat menampilkan photo profil pada semua pengguna WhatsApp</li>\r\n<li>Anda juga dapat pilih Kontak Saya untuk dapat menampilkan photo profil bagi pengguna WhatsApp yang nomor teleponnya terdapat di kontak telepon saja.</li>\r\n<li>Dan pilih Tidak Ada untuk menyembunyikan atau sebagai cara privasi pp WhatsApp dari semua pengguna aplikasi WhatsApp. Jika Anda memiliki Tidak Semua maka photo profil Anda tidak akan terlihat oleh siapapun.</li>\r\n</ul>\r\n<h4><strong>Cara Privasi PP WhatsApp ke Beberapa Orang</strong></h4>\r\n<p>Selain menyembunyikan photo profil WhatsApp dari semua orang yang tidak terdapat pada kontak WhatsApp., Anda juga dapat menyembunyikan photo profil WhatsApp Anda dari beberapa orang.</p>\r\n<p>Caranya cukup mudah, Anda tinggal menghapus terlebih dahulu kontal yang Anda maksud dari WhatsApp Anda. Kemudian ikuti cara di atas dengan memilih Kontak Saya atau Tidak Ada.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_4_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_4_anchor\"></ins></ins></ins>Karena kontak yang Anda maksud telah terhapus, maka kontak tersebut tidak akan bisa lagi melihat photo profil Anda. Untuk tetap dapat melakukan chat dengan kontak orang lain yang telah Anda hapus tersebut, maka jangan menghapus riwayat obrolan yang ada.</div>\r\n<p>Setelah menggunakan salah satu pengaturan, maka pada umumnya WhatsApp secara otomatis menyimpan pengaturan tersebut serta menerapkannya pada akun Anda. Apabila telah tersimpan, maka photo profil Anda pun tidak akan nampak dari orang lain.</p>\r\n<p>Menyembunyikan foto profil dapat menjadi salah satu cara melindungi privasi Anda dari orang yang tidak dikenal pada Aplikasi WhatsApp. Dengan cara privasi pp WhatsApp, maka Anda dapat mengatur siapa saja yang dapat melihat photo profil Anda.</p>', 'cara-privasi-pp-whatsapp-dari-orang-tertentu-berikut-cara-mudahnya', 'Published', 'assets/post-images/M8rGGfPXYGP1IGfc636iJHEdpWCdFoCODOnYU11i.jpg', 'Ilustrsi Cara Privasi PP WhatsApp. Foto: Ist/Net', NULL, '2021-12-06 07:35:12', '2022-03-30 03:04:38'),
(22, 1, 1, NULL, 'Internet 5G Indosat Dalam Proses Uji Kelayakan, Berikut Ulasannya!', 'AlFatihDev  – Internet 5G Indosat pekan ini telah resmi mengantongi Surat Keterangan Laik Operasi (SKLO) dari Kementrian Komunikasi serta In...', '<p><strong>AlFatihDev</strong> &ndash; Internet 5G Indosat pekan ini telah resmi mengantongi Surat Keterangan Laik Operasi (SKLO) dari Kementrian Komunikasi serta Informatika. Dalam hal ini, Indosat menjadi operator kedua di Indonesia yang akan menggelar layanan 5G.</p>\r\n<p>SKLO adalah salah satu persyaratan wajib yang harus dilakukan bagi masing-masing operator seluler sebelum akhirnya menggelar layanan 5G secara komersial. Hal ini bertujuan untuk memastikan bahwa layanan yang hadir pada masyarakat akan sesuai dengan standar kualitas.</p>\r\n<h2><strong>Jaringan Internet 5G Indosat</strong></h2>\r\n<p>Sebelumnya izin yang sama telah diperoleh Telkomsel untuk meluncurkan layanan komersialisasi 5G di wilayah Jakarta dalam beberapa waktu yang lalu.</p>\r\n<p>Dengan adanya SKLO ini, maka sarana serta prasarana dalam pengadaan jaringan 5G yang resmi diselenggarakan Indosat pun telah siap untuk dioperasikan. Indosat akan menjalankan 5G dalam pita frekuensi 1,8 GHz atau 1800 MHz.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_2_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_2_anchor\"></ins></ins></ins>Lalu dengan lebar pitanya 20 Mhz dalam rentang 1837,5 Mhz hingga 1857, Mhz. Dengan adanya jaringan 5G ini, semoga dapat berkembang dalam waktu yang tidak lama. Jaringan ini tentunya akan terus semakin luas sesuai dengan permintaan pasar pada lokasi lainnya.</div>\r\n<div>\r\n<div><span class=\"ctaText\">Baca:</span>&nbsp;&nbsp;<span class=\"postTitle\">HP Vivo iQOO T dengan Desain Terbaru, Berikut Spesifikasi Lengkapnya!</span></div>\r\n</div>\r\n<h4><strong>Wilayah Jaringaan 5G Indosat</strong></h4>\r\n<p>Untuk tahap awal ini, jaringan internet 5G Indosat akan tersedia di Jakarta, Makassar, Surabaya, dan Solo. Selanjutnya akan turut serta dengan adanya kesiapan ekosistem yang setara.</p>\r\n<p>Selain pulau Jawa, internet 5G juga akan hadir di berbagai tempat prioritas utama destinasi wisata. Antara lain Danau Toba Sumatera Utara, Likupang Sulawesi Utara, Labuan Bajo NTT, serta Mandalikasi di NTB.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_3_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_3_anchor\"></ins></ins></ins>Selain beberapa lokasi tersebut, juga akan terdapat alokasi manufaktur serta lokasi ibu kota negara pada tahun 2024 mendatang. Dengan hadirnya jaringan 5G ini, banyak pihak mengharapkan dapat mendukung industri dan masyarakat pada masa depan.</div>\r\n<p>Hal ini seiring dengan perkembangan teknologi IoT serta AI. Melalui implementasi 5G, semoga dapat mewujudkan beragam hal. Salah satunya dapat mewujudkan akses telekomunikasi yang berkeadilan. Lalu dapat menjadi jembatan pada kesenjangan digital yang ada.</p>\r\n<div>\r\n<div><span class=\"ctaText\">Baca:</span>&nbsp;&nbsp;<span class=\"postTitle\">HP Oppo A53s 5G Akan Segera Rilis, Berikut Rumor Spesifikasinya!</span></div>\r\n</div>\r\n<p>Bahkan juga mampu meningkatkan kemampuan serta literasi masyarakat untuk menggunakan teknologi secara adaftif. Hal ini tentunya dapat mendorong penggunaan internet menjadi lebih produktif serta memperkuat ekonomi nasional.</p>\r\n<h4><strong>Syarat HP 5G yang Dukung Jaringan Internet 5G Indosat</strong></h4>\r\n<p>Saat ini, bagi para produsen HP 5G yang telah beredar resmi di Indonesia, tentu memerlukan waktu untuk melakukan update software. Dengan tujuan untuk membuka kemampuan dalam menangkap sinyal 5G.</p>\r\n<p>Hingga saat ini Indosat pun belum mengungkap waktu peluncuran serta syarat untuk menggunakan jaringan 5G yang mereka miliki. Kecepatan serta tingkat keterlambatan pengiriman data 5G lebih baik daripada generasi sebelumnya.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_4_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_4_anchor\"></ins></ins></ins>Dengan adanya standarisasi 5G yang telah selesai, mampu memberikan alokasi frekuensi yang dapat bermanfaat untuk basic connectivity, superdaya layer pada spektrum 26, 28, serta 39 Ghz, mobile borandband speed, termasuk pada layanan fix broadband.</div>\r\n<div>\r\n<div><span class=\"ctaText\">Baca:</span>&nbsp;&nbsp;<span class=\"postTitle\">Cara Copy Paste Tulisan Arab di Android dengan Mudah dan Praktis</span></div>\r\n</div>\r\n<p>Untuk perangkat HP yang dapat menerima jaringan internet 5G Indosat harus mempunyai spesifikasi modem 5G yang mendukung band n3 (1800Mhz).</p>\r\n<p>Maka secara keseluruhan, HP 5G yang telah mendukung n3 lebih banyak daripada band n40 yang terdapat pada Telkomsel. Terdapat sejumlah HP 5G yang telah beredar resmi di Indonesia dan mendukung modem 5G band n3. Penelusuran ini sesuai dengan spesifikasi yang telah tampil pada situs resmi masing-masing smartphone.</p>\r\n<p>Saat ini Indosat siap menyelenggarakan 5G secara komersial di Tanah Air. Dengan adanya jaringan internet 5G Indosat ini, dapat membantu menumbuhkan ekonomi digital. Lalu mempunyai pengalaman terbaik untuk enterprise serta konsumen dengan hadirkan konektivitas kecepatan tinggi.</p>', 'internet-5g-indosat-dalam-proses-uji-kelayakan-berikut-ulasannya', 'Published', 'assets/post-images/FkX7CTYVB1hHptooGR68pwB9NJIX6qc3teipDuWN.jpg', 'Ilustrasi Internet 5G Indosat. Foto: Ist/Net', NULL, '2021-12-06 07:37:51', '2022-03-30 03:04:14');
INSERT INTO `posts` (`id`, `users_id`, `categories_id`, `sub_categories`, `post_title`, `post_teaser`, `post_content`, `slug`, `post_status`, `post_image`, `post_image_description`, `deleted_at`, `created_at`, `updated_at`) VALUES
(23, 1, 5, NULL, 'Cloud Song: Saga of Skywalker Akan Rilis di Indonesia, Simak Ulasannya!', 'AlFatihDev - Cloud Song: Saga of Skywalker akan resmi rilis di Indonesia dalam waktu dekat ini. Publisher game mobile VNG Corp akan menambah...', '<p><strong>AlFatihDev </strong>-&nbsp;Cloud Song: Saga of Skywalker akan resmi rilis di Indonesia dalam waktu dekat ini. Publisher game mobile VNG Corp akan menambahkan permainan tersebut masuk dalam deretan game terbaik di Indonesia.</p>\r\n<p>Game terbaru ini merupakan game mobile dengan genre MMORPG yang telah populer serta mempunyai basis penggemar di Tanah Air. Game ini merupakan versi lokal atau Indonesia yang berasal dari Guardians of Claudia dan telah tersedia pada versi Asia Tenggara.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_2_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_2_anchor\"></ins></ins></ins>Siapa yang tidak menginginkan bermain game yang seru dan menyenangkan. Bahkan bisa menjadi rekomendasi game paling menarik untuk dimainkan saat ini.</div>\r\n<h2><strong>Cloud Song: Saga of Skywalker Akan Segera Rilis di Indonesia</strong></h2>\r\n<p>Saat ini VNG Corp telah membuka masa pra-registrasi dari game terbaru ini untuk seluruh pengguna iOS dan Android. Game online yang satu ini juga akan hadir beragam fitur menarik dan hadiah yang melimpah.</p>\r\n<p>Perlu Anda ketahui Cloud Song: Saga of Skywalker adalah salah satu game dengan genre Action RPG. VNG Corp pun mengungkapkan bahwa game ini menjadi game lokal terbaru yang hadir dengan anime klasik.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_3_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_3_anchor\"></ins></ins></ins>Game terbaru ini akan mengajak para pemainnya untuk melakukan petualangan yang sangat seru. Selama melakukan petualangan tersebut, melalui game ini para pemain akan mengendalikan karakter yang imut.</div>\r\n<p>Bahkan dengan gaya anime serta sentuhan klasik Eropa yang sangat menawan. Selanjutnya, pada game ini, para pemain akan dapat memilih 5 kelas karakter game yang unik.</p>\r\n<h4><strong>Kelas Karakter Cloud Song: Saga of Skywalker</strong></h4>\r\n<p>Petualangan yang terdapat pada fantasi game terbaru ini akan menawarkan lima kelas karakter yang terdiri dari Oracle, Rogue, Archer, Mage dan Swordsman.</p>\r\n<p>Masing-masing kelas karakter ini mempunyai gaya penyerangan yang berbeda. Dalam permainan ini tersedia level karakter serta kualitas equipment yang dapat pemain tingkatkan melalui sistem Rune.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_4_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_4_anchor\"></ins></ins></ins>Game terbaru ini menawarkan gameplay Action RPG (ARPG) yang membuat gerakan karakter dapat mempengaruhi gaya penyerangan maupun efek skill yang dihasilkan. Selain itu, tampilan karakter juga dapat dikustomisasi agar berbeda dari pemain lain.</div>\r\n<p>Selain itu, para pemain dapat bergerak dengan menggunakan tombol arah, menyerang musuh dengan menggunakan tombol serangan. Jika tidak pemain bisa mengeluarkan skill yang terdapat pada karakter masing-masing.</p>\r\n<p>Untuk dapat menambah kedalaman karakter, maka para pemain dapat mendesain karakter yang mereka miliki sehingga dapat benar-benar mewakili personal pemain.</p>\r\n<h4><strong>Kelebihan Cloud Song: Saga of Skywalker</strong></h4>\r\n<p>Kelebihan lain yang terdapat pada game dengan genre Action RPG satu ini adalah menyediakan sistem pet untuk pendamping petualangan. Masing-masing pet mempunyai elemen serta dapat berevolusi.</p>\r\n<p>Tidak hanya sebagai pemanis tampilan saja, akan tetapi masing-masing pet akan mempunyai elemen sendiri-sendiri. Seperti angin, air, tanah, serta api. Para pet dapat diajak bertarung, diupgrade serta mempunyai tingkat kelangkaan masing-masing.</p>\r\n<p>Para pemain juga dapat bertarung secara offline untuk memperoleh medal. Melakukan Guild War untuk memperoleh resource yang lebih menguntungkan.</p>\r\n<div class=\"google-auto-placed ap_container\"><ins class=\"adsbygoogle adsbygoogle-noablate\" data-ad-format=\"auto\" data-ad-client=\"ca-pub-3979458015130990\" data-adsbygoogle-status=\"done\" data-ad-status=\"unfilled\"><ins id=\"aswift_5_expand\" tabindex=\"0\" title=\"Advertisement\" aria-label=\"Advertisement\"><ins id=\"aswift_5_anchor\"></ins></ins></ins>Bahkan juga melakukan duel atau PK untuk memperoleh title Champion serta Frame Eksklusif, atau perang antar crossword pada Star &amp; Moon Battlefield. Game terbaru yang resmi rilis oleh VNG Corp ini akan mengajak para gamer Indonesia untuk menikmatinya.</div>\r\n<p>Tidak hanya itu saja, bahkan pemain akan menyukai MMORPG serta ARPG untuk dapat menikmati segala fitur yang telah perusahaan kembangkan secara mendalam. Hal ini bertujuan untuk memberikan kepuasan bagi para pemain yang menghabiskan hari-harinya berpetualang pada dunia fantasi Cloud Song: Saga of Skywalker.</p>', 'cloud-song-saga-of-skywalker-akan-rilis-di-indonesia-simak-ulasannya', 'Published', 'assets/post-images/3MlQR75DaL1W7QFmVhFgzyJ0rE8p8xMhtkYBSFHU.jpg', 'Ilujstrasi Cloud Song: Saga of Skywalker Foto: Ist/Net', NULL, '2021-12-06 07:40:44', '2022-03-30 03:02:24'),
(24, 1, 3, NULL, 'Google Pixel 6 Pro Hadir dengan Baterai 5000 mAh, Ini Spesifikasinya!', 'AlFatihDev – Google Pixel 6 Pro akhirnya telah berhasil rilis bersamaan dengan seri Pixel 6 dan menjadi salah satu smartphone andalan terbar...', '<p><strong>AlFatihDev</strong> &ndash;&nbsp;Google Pixel 6 Pro akhirnya telah berhasil rilis bersamaan dengan seri Pixel 6 dan menjadi salah satu smartphone andalan terbaru dari Google. Kabarnya, Android tersebut mampu menampilkan sejumlah fitur terbaru, mulai dari resolusi layar yang tinggi.</p>\r\n<p>Menurut lansiran dari GSMarena, ponsel ini memiliki spesifikasi terbaik dengan harga sekitar 12 jutaan rupiah saja. Sedangkan pada pengiriman pertamanya adalah di pasar Amerika sejak 28 Oktober lalu.</p>\r\n<h2><strong>Google Pixel 6 Pro Hadir Bersama Seri Pixel 6, Bagaimana Spesifikasinya?</strong></h2>\r\n<p>Belum lama ini perusahaan besar yakni Google telah merilis smartphone terbarunya dengan dua model yang berbeda, salah satunya Pixel 6 Pro. Hadir sebagai HP unggulan, maka Google juga melengkapi ponsel tersebut menggunakan perangkat keras terkini.</p>\r\n<p>Akan tetapi rupanya ada beberapa pemilik awal smartphone tersebut yang pernah mengalami masalah yakni layar berkedip. Sementara itu menurut Google sendiri bahwa itu bukan merupakan perangkat kerasnya.</p>\r\n<div>\r\n<div><span class=\"ctaText\">Baca:</span> &nbsp;<a href=\"../../../../posts/internet-5g-indosat-dalam-proses-uji-kelayakan-berikut-ulasannya\">Internet 5G Indosat Dalam Proses Uji Kelayakan, Berikut Ulasannya!</a></div>\r\n<div>&nbsp;</div>\r\n</div>\r\n<p>Sebab Google telah menyebutkan bahwa itu adalah bug perangkat lunak yang akan diperbaiki melalui pembaruan selanjutnya. Ponsel itu pun juga membawa sejumlah spesifikasi menarik yang wajib untuk Anda ketahui sekarang.</p>\r\n<h4><strong>Desain Layar</strong></h4>\r\n<div class=\"google-auto-placed ap_container\">\r\n<p>Pada bagian desain layar Google Pixel 6 Pro ini membawa jenis layar seluas 6,7 inch serta dengan mengusung desain flat pula. Tidak hanya itu saja, melainkan juga dengan resolusi QHD+ serta dukungan refresh rate yang lebih tinggi yakni 120Hz.</p>\r\n<p>Sementara jenis layar itu bernama panel AMOLED yang beresolusi sebesar 1440 x 3120 pixel. Tidak lupa perusahaan Google juga telah menyematkan berupa Corning Gorilla Glass Victus serta sertifikat anti debu dan air IP68.</p>\r\n<p>Sedangkan untuk kamera selfienya sebesar 8MP lengkap dengan sudut gambar yang jauh lebih lebar mencapai 94 derajat. Sehingga, mampu membuat para penggunanya untuk menangkap gambar lebih banyak ketika sedang selfie.</p>\r\n</div>\r\n<h4><strong>Kapasitas Kamera</strong></h4>\r\n<div class=\"google-auto-placed ap_container\">\r\n<p>Pindah kebagian kamera Google Pixel 6 Pro yang mana terdapat dua kamera bagian belakang sebesar 50MP untuk kamera utamanya. Sedangkan 50MP untuk ultrawide serta 48MP untuk telephoto lengkap dengan fitur bernama Super Res Zoom 20x.</p>\r\n<p>Kabar selanjutnya bahwa kamera utama sebesar 50MP namun untuk seri PIxel 6 mampu menangkap cahaya mencapai 150% lebih banyak. Hal ini karena kamera tersebut membawa ukuran pixel 1/1,31 inci yang lebih besar daripada seri Pixel 5.</p>\r\n<p>Tidak hanya itu saja, melainkan Pixel 6 pro ini juga memiliki sejumlah fitur pada bagian mode potret seperti Motion Mode. Dengan demikian bisa menambahkan kedalaman yang ekstra ke foto serta face Unblur yang bisa mempertajam detail wajah para pengguna.</p>\r\n</div>\r\n<h4><strong>Dapur Pacu dan Fitur Lain</strong></h4>\r\n<p>Pada bagian dapur pacu Google Pixel 6 Pro ini membawa jenis chipset Google Tensor bersutan perusahaan besar itu sendiri. Selain itu prosesor tersebut juga membawa delapan inti GPU serta konfigurasi dua Core X1 clock 2.8 GHz.</p>\r\n<div>\r\n<div><span class=\"ctaText\">Baca:</span> &nbsp;<a href=\"../../../../posts/tips-memilih-laptop-untuk-pelajar-sesuai-dengan-kebutuhan-sekolah\">Tips Memilih Laptop untuk Pelajar Sesuai dengan Kebutuhan Sekolah</a></div>\r\n</div>\r\n<div class=\"google-auto-placed ap_container\">&nbsp;</div>\r\n<div class=\"google-auto-placed ap_container\">\r\n<p>Tidak hanya itu saja, namun Google juga telah mengklaim bahwa prosesor tersebut juga memiliki jenis CPU yang jauh lebih cepat. 80% daripada Qualcomm Snapdragon 765G seperti pada seri Pixel 5 dan GPU lebih cepat hingga 370%.</p>\r\n<p>Untuk kapasitas RAM Pixel 6 pro sendiri adalah sebesar 12GB dengan kapasitas baterai sebesar 5000 mAh. Lengkap dengan fitur fast charging sebesar 30W melalui port USB-C dan untuk pengisian nirkabel sebesar 23 Watt.</p>\r\n<p>Untuk soal harga Google Pixel 6 Pro berkisar antara 12 jutaan rupiah dan kini sudah bisa Anda pesan mulai dari sekarang. Sebab HP tersebut sudah berhasil dijual ke publik sejak tanggal 28 Oktober. Bagaimana, apakah Anda tertarik untuk membelinya?</p>\r\n</div>', 'google-pixel-6-pro-hadir-dengan-baterai-5000-mah-ini-spesifikasinya', 'Published', 'assets/post-images/zlDqy00dRmZknNZAbkuCMIWvO2ITwLSfR20piLRb.jpg', 'Google Pixel 6 Pro. Foto: Ist/Net', NULL, '2021-12-06 07:44:03', '2022-03-30 03:01:23'),
(25, 1, 2, NULL, '5 Tren Bahasa Pemrograman yang Wajib Dikuasai 2022', 'AlFatihDev - Bahasa pemrograman adalah sekumpulan perintah yang ditujukan untuk komputer, agar komputer tersebut mampu melaksanakan instruks...', '<p><strong>AlFatihDev </strong>- Bahasa pemrograman adalah sekumpulan perintah yang ditujukan untuk komputer, agar komputer tersebut mampu melaksanakan instruksi sesuai tujuan yang kita inginkan. Sesuai namanya, bahasa pemrograman kebanyakan digunakan dalam proses pembuatan dan pengembangan sebuah software.&nbsp;</p>\r\n<p>Sebagai seorang programmer, menguasai bahasa pemrograman adalah sebuah skill yang wajib Anda miliki. Namun, saat ini ada banyak sekali pilihan bahasa pemrograman yang tersedia untuk berbagai fungsi. Apa saja bahasa pemrograman yang harus dipelajari? Berikut penjelasan lengkapnya.&nbsp;</p>\r\n<h4><strong>5 Bahasa Pemrograman yang Wajib Dikuasai 2022&nbsp;</strong></h4>\r\n<p>Meniti karir di industri teknologi berarti harus selalu siap menghadapi perkembangan yang cepat. Karena itu, Anda yang berminat menjadi seorang developer harus mengetahui juga apa saja bahasa pemrograman yang sedang menjadi tren. Berikut ini adalah tren bahasa pemrograman yang wajib Anda kuasai di tahun 2022.&nbsp;</p>\r\n<p><strong>1. Phyton</strong></p>\r\n<p>Phyton adalah bahasa pemrograman yang menjadi sangat populer dalam beberapa tahun belakangan ini. Kepopuleran ini tentunya sejalan dengan kebutuhan yang meningkat akan orang-orang yang memahami data science, machine learning, dan backend development.&nbsp;</p>\r\n<p>Phyton juga sangat mudah untuk Anda pelajari karena perintah-perintahnya sederhana dan gampang dipahami. Jika ingin berkarier di bidang IT, maka bahasa pemrograman yang satu ini wajib Anda pelajari.&nbsp;</p>\r\n<p><strong>2. C++</strong></p>\r\n<p>Bahasa pemrograman C adalah salah satu bahasa pemrograman yang paling tua. Walaupun begitu, bahasa C masih populer dan digunakan hingga saat ini. Pengembangan dari bahasa C adalah C++, bagi Anda yang ingin menjadi developer wajib mempelajari bahasa pemrograman yang satu ini.&nbsp;</p>\r\n<p>Dengan mempelajari C++ Anda akan mendapatkan pengetahuan tentang bagaimana cara kerja komputer dan coding secara umum. C++ memiliki kontribusi besar terhadap banyak bahasa pemrograman lain yang Anda kenal sekarang. Hingga saat ini, bahasa C dan C++ juga masih sering digunakan untuk pengembangan video game dan berbagai aplikasi.&nbsp;</p>\r\n<p><strong>3. JavaScript</strong></p>\r\n<p>Dari tahun ke tahun, JavaScript selalu menjadi bahasa pemrograman yang paling populer dan menjadi tren di kalangan developer. Walaupun bahasa pemrograman ini sudah digunakan sejak bertahun-tahun yang lalu, tapi hingga saat ini masih banyak yang menggunakan JavaScript untuk berbagai keperluan.</p>\r\n<p>Bahkan, sebuah survei dari Analytics Insight masih menjadi bahasa pemrograman yang memimpin industri hingga saat ini. &nbsp;Kepopuleran ini tentu saja karena JavaScript sangat fleksibel dan multi-fungsi. Bahasa pemrograman satu ini bisa Anda gunakan untuk mengembangkan aplikasi mobile, website, dan lain-lain.&nbsp;</p>\r\n<p><strong>4. Kotlin</strong></p>\r\n<p>Kotlin sebenarnya adalah bahasa pemrograman yang cukup baru jika dibandingkan bahasa lainnya. Kotlin bisa berjalan pada JVM (Java Virtual Machine) secara statis. Anda bisa mengkompilasikan Kotlin ke JavaScript dengan menggunakan compiler LLVM.</p>\r\n<p>Bahasa pemrograman ini pertama kali diciptakan pada tahun 2016 dan berfungsi untuk membuat aplikasi Android. &nbsp;Bahasa pemrograman yang satu ini bersifat open-source, memiliki performa handal, dan bisa menyederhanakan sintaks.</p>\r\n<p>Karena itu, banyak perusahaan besar yang menggunakannya seperti Pinterest, Gojek, Trello, dan lain-lain. Anda yang berminat untuk menjadi seorang Android Developer wajib menguasai bahasa pemrograman yang satu ini. &nbsp;</p>\r\n<p><strong>5. Java</strong></p>\r\n<p>Bahasa pemrograman lain yang harus Anda kuasai adalah Java. Java merupakan bahasa pemrograman yang masih berdampak global karena memiliki sangat banyak kegunaan. Karena itu, Java masih termasuk dalam salah satu bahasa pemrograman yang wajib Anda kuasai di tahun 2022 ini.&nbsp;</p>\r\n<p>Pada dasarnya, Java memiliki format yang mirip dengan C dan C++. Namun, Java memiliki keunggulan lain yang menjadikan bahasa pemrograman ini sebagai favorit para developer. Bahasa pemrograman satu ini sangat cocok bagi developer yang berorientasi pada usability.</p>\r\n<p>Dengan menggunakan Java, aplikasi jadi bisa diakses secara multi-platform.Kompabilitas yang Java tawarkan sangat baik dan mendukung berbagai aplikasi dan device. Selain itu, Java juga mudah untuk Anda pelajari dan memberi kemudahan untuk menyusun sebuah script.</p>', '5-tren-bahasa-pemrograman-yang-wajib-dikuasai-2022', 'Published', 'assets/post-images/eD85YY2nfkTQ438VHcFzWbuXve2voePLj8Kg2tYs.png', 'Foto: Ist/Net', NULL, '2022-03-30 03:26:01', '2022-03-30 03:30:54');

-- --------------------------------------------------------

--
-- Table structure for table `post_tag`
--

CREATE TABLE `post_tag` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_tag`
--

INSERT INTO `post_tag` (`id`, `post_id`, `tag_id`, `created_at`, `updated_at`) VALUES
(2, 2, 2, NULL, NULL),
(3, 4, 2, NULL, NULL),
(4, 5, 2, NULL, NULL),
(5, 6, 2, NULL, NULL),
(6, 7, 2, NULL, NULL),
(7, 7, 3, NULL, NULL),
(8, 8, 2, NULL, NULL),
(9, 9, 1, NULL, NULL),
(10, 10, 2, NULL, NULL),
(11, 11, 2, NULL, NULL),
(12, 12, 2, NULL, NULL),
(13, 13, 2, NULL, NULL),
(14, 14, 2, NULL, NULL),
(15, 15, 2, NULL, NULL),
(16, 16, 3, NULL, NULL),
(17, 17, 4, NULL, NULL),
(18, 18, 2, NULL, NULL),
(19, 19, 2, NULL, NULL),
(20, 20, 2, NULL, NULL),
(21, 21, 2, NULL, NULL),
(22, 22, 1, NULL, NULL),
(23, 23, 2, NULL, NULL),
(24, 24, 2, NULL, NULL),
(25, 25, 1, NULL, NULL),
(26, 25, 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `redactions`
--

CREATE TABLE `redactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `redaction_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `redactions`
--

INSERT INTO `redactions` (`id`, `redaction_content`, `created_at`, `updated_at`) VALUES
(1, '<p>\r\n                Dikelola oleh : <b> PT Code Work</b><br><br>\r\n\r\n                <b>Pimpinan Umum </b>: Agun Wiguna<br><br>\r\n\r\n                <b> Pimpinan Redaksi </b> : Agun Wiguna<br>\r\n                <b> Sekretaris Redaksi </b> : Rina Diah A<br>\r\n                <b> Redaktur Pelaksana </b> : – <br>\r\n                <b> Redaktur </b> : Kurniawan<br>\r\n                <b> Staf Redaksi </b> : <br><br>\r\n\r\n                <b> Penulis Konten </b> : <br><br>\r\n\r\n                <b> Ass. Pimpinan Perusahaan </b> : Kurniawan<br>\r\n                <b> Keuangan </b> : Dede Ahmad F<br>\r\n                <b> Iklan </b> : <br><br>\r\n\r\n                <b> WebMaster </b> : AlFatih Developer Crew</p><p>\r\n                                    </p>', '2021-11-20 02:13:34', '2022-03-30 03:36:57');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Berita Terbaru', 'berita-terbaru', '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(2, 'Berita Teknologi', 'berita-teknologi', '2021-11-20 02:13:34', '2021-11-20 02:13:34'),
(3, 'Android', 'android', '2021-11-20 06:11:52', '2021-11-20 06:11:52'),
(4, 'Smartphone', 'smartphone', '2021-11-20 06:12:07', '2021-11-20 06:12:07');

-- --------------------------------------------------------

--
-- Table structure for table `tag_video`
--

CREATE TABLE `tag_video` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tag_video`
--

INSERT INTO `tag_video` (`id`, `tag_id`, `video_id`, `created_at`, `updated_at`) VALUES
(1, 2, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roles` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `roles`, `profile`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Agun Wiguna', 'admin@alfatihdev.com', NULL, '$2y$10$XnSzsFAwRlFYTkfJZlEr4OHeWUx9gCXCfgxKSuth0uWK1VnqZzFl.', 'Administrator', NULL, NULL, '2021-11-20 02:13:33', '2022-03-30 03:40:20'),
(2, 'Jhon Doe', 'editor@alfatihdev.com', NULL, '$2y$10$4E45CACULWC5giONVZlBJepxpcl7Cs8oP12xvcL09xwQ62gJNS9Oi', 'Editor', NULL, NULL, '2021-11-20 02:13:34', '2022-03-30 08:23:23'),
(3, 'Valeria Luna', 'penulis@alfatihdev.com', NULL, '$2y$10$nzk84mKibebHwad2myCwGe0771xo1jYHvNGfPsp/8dkt3LTyBH0Z.', 'Penulis', NULL, NULL, '2021-11-20 02:13:34', '2022-03-30 08:15:46');

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `users_id` bigint(20) UNSIGNED NOT NULL,
  `categories_id` bigint(20) UNSIGNED NOT NULL,
  `sub_categories` int(11) DEFAULT NULL,
  `post_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_teaser` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_image_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `users_id`, `categories_id`, `sub_categories`, `post_title`, `post_teaser`, `post_content`, `slug`, `post_status`, `post_image`, `post_image_description`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 9, NULL, 'Kargo, Mobil Listrik Pengantar Paket di Masa Depan', 'Bagaimana cara kerja kurir di masa depan?', '<p>Texno.id -&nbsp;Jasa antar barang, kini masih didominasi oleh kurir manusia. Tapi, bagaimana cara kerja kurir di masa depan?</p>\r\n<p><iframe title=\"YouTube video player\" src=\"https://www.youtube.com/embed/vj7B_gLbczk\" width=\"560\" height=\"315\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\"></iframe></p>\r\n<p>Barang bisa saja diantar menggunakan drone, bahkan mungkin robot yang datang mengetuk pintu rumah Anda. Selengkapnya, dalam video di atas.</p>', 'kargo-mobil-listrik-pengantar-paket-di-masa-depan', 'Published', 'assets/videos-images/3KoKHeAUETsyyx1xnmQCgjUzQ540DrZrlOkuYA06.png', 'Foto: Ist/Net', NULL, '2021-12-04 07:28:42', '2021-12-04 07:28:42');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `breaking_news`
--
ALTER TABLE `breaking_news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `breaking_news_categories`
--
ALTER TABLE `breaking_news_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `disclaimers`
--
ALTER TABLE `disclaimers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `guidelines`
--
ALTER TABLE `guidelines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `headlines`
--
ALTER TABLE `headlines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `headlines_categories`
--
ALTER TABLE `headlines_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `photos_slug_unique` (`slug`);

--
-- Indexes for table `photo_galleries`
--
ALTER TABLE `photo_galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `photo_tag`
--
ALTER TABLE `photo_tag`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `posts_slug_unique` (`slug`);

--
-- Indexes for table `post_tag`
--
ALTER TABLE `post_tag`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `redactions`
--
ALTER TABLE `redactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tag_video`
--
ALTER TABLE `tag_video`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `videos_slug_unique` (`slug`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `breaking_news`
--
ALTER TABLE `breaking_news`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `breaking_news_categories`
--
ALTER TABLE `breaking_news_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `disclaimers`
--
ALTER TABLE `disclaimers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guidelines`
--
ALTER TABLE `guidelines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `headlines`
--
ALTER TABLE `headlines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `headlines_categories`
--
ALTER TABLE `headlines_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `photos`
--
ALTER TABLE `photos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `photo_galleries`
--
ALTER TABLE `photo_galleries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `photo_tag`
--
ALTER TABLE `photo_tag`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `post_tag`
--
ALTER TABLE `post_tag`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `redactions`
--
ALTER TABLE `redactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tag_video`
--
ALTER TABLE `tag_video`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
