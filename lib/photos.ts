/**
 * ============================================================================
 * PUSAT PENGATURAN FOTO WEBSITE (URL GAMBAR)
 * ============================================================================
 * Anda cukup mengganti link URL di bawah ini dengan URL foto Anda sendiri!
 * Bisa menggunakan link langsung dari internet (misal: Imgur, Discord CDN, Unsplash, Cloudinary, dll).
 */

// ── NOMOR WHATSAPP UNTUK KLAIM HADIAH (Ganti dengan nomor WA kamu, format: 628...) ──
export const WHATSAPP_NUMBER = "6289515444097"; // <-- GANTI NOMOR WA KAMU DI SINI (Contoh: 6281234567890)

export interface SongItem {
  id: number;
  title: string;
  artist?: string;
  url: string;
}

// ── PLAYLIST LAGU LOKAL WEBSITE (SIMPAN DI FOLDER: public/music/) ───────────────
// Letakkan file-file lagu MP3 kamu ke dalam folder: "public/music/" di proyek ini!
// Contoh nama file: public/music/lagu1.mp3, public/music/lagu2.mp3, dst.
// Kamu bisa ganti judul lagu (title) dan nama filenya sesuai keinginanmu:
export const PLAYLIST: SongItem[] = [
  {
    id: 1,
    title: "Love.",
    artist: "Wave to Earth",
    url: "/music/love.mp3", // Simpan file lagu ke: public/music/lagu3.mp3
  },
   {
    id: 2,
    title: "About You",
    artist: "1975",
    url: "/music/About You.mp3", // Simpan file lagu ke: public/music/lagu2.mp3
  },
  {
    id: 3,
    title: "Shape of My Heart",
    artist: "Backstreet Boys",
    url: "/music/Shape of My Heart.mp3", // Simpan file lagu ke: public/music/lagu1.mp3
  },
 

];

// Fallback untuk backward compatibility
export const BACKGROUND_MUSIC_URL = PLAYLIST[0]?.url || "/music.mp3";

// ── TEMPLATE KATA-KATA CHAT WHATSAPP UNTUK TUKAR HADIAH ───────────────────────
// Kamu bisa bebas ubah kata-kata di bawah ini sesuai keinginan kamu!
export const getWhatsAppMessage = ({
  clicks,
  title,
  code,
}: {
  clicks: number;
  title: string;
  code: string;
}) => {
  return `Halo Bae! 

Aku udah klik tombol I Love You sebanyak ${clicks} kali di website kita!

Aku mau tukar hadiah ini dong:
- Hadiah: *${title}*
- Kode Voucher: *${code}*

Thankyouu baee! `;
};

// ── 1. SECTION JOURNEY (TIMELINE KISAH KITA) ──────────────────────────────────
export const TIMELINE_PHOTOS = {
  // Foto Kartu 1: Awal kenal di Roblox (Violence District)
  robloxMeeting: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265088/WhatsApp_Image_2026-09-24_at_22.31.0332323_bfplm7.jpg",

  // Foto Kartu 2: Pertama kali ketemu langsung (300+ km)
  firstRealMeeting: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790268712/WhatsApp_Image_2026-09-24_at_23.51.01_qx2lfd.jpg",
};

// ── 2. SECTION EVERY MOMENT WITH YOU (DOLLY GALLERY 3D) ────────────────────────
export const DOLLY_PHOTOS = [
  {
    id: 1,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265088/WhatsApp_Image_2026-09-24_at_22.31.0332323_bfplm7.jpg", // <-- URL Foto Momen 1
    alt: "Sunset Ocean Waves at Golden Hour",
    side: "left" as const,
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265062/1117276372_18649596490_1768069123799_cpni4c.png", // <-- URL Foto Momen 2
    alt: "Mountain Lake Cabin and Wooden Dock at Twilight",
    side: "right" as const,
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265061/1117276372_18649596490_1768069038685_e3xjic.png", // <-- URL Foto Momen 3
    alt: "Starlit Night Sky with Moon and Nebula",
    side: "left" as const,
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265058/2222222222222222222_f78krj.jpg", // <-- URL Foto Momen 4
    alt: "Holding Hands in Golden Hour Sunlight",
    side: "right" as const,
  },
  {
    id: 5,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265060/2222_yc6abm.jpg", // <-- URL Foto Momen 5
    alt: "Lush Blooming Roses with Morning Dew Drops",
    side: "left" as const,
  },
  {
    id: 6,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265060/3342_qob4tx.jpg", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "right" as const,
  },
    {
    id: 7,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265058/412412412_hfcw0k.jpg", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "left" as const,
  },
    {
    id: 8,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265058/2323_d0mgn4.jpg", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "right" as const,
  },
    {
    id: 9,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265059/5231541234_veceej.jpg", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "left" as const,
  },
    {
    id: 10,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265059/WhatsApp_Image_2026-09-24_at_22.30.46421623631_llldca.jpg", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "right" as const,
  },
     {
    id: 11,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265059/WhatsApp_Image_2026-09-24_at_22.30.52441243_ykfhru.jpg", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "left" as const,
  },
     {
    id: 12,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265061/9938701600_121864768012064_1767319770112_g76i2a.png", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "right" as const,
  },
     {
    id: 13,
    src: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790265061/it_isb1mg.jpg", // <-- URL Foto Momen 6
    alt: "Glowing Sparklers and Twilight City Bokeh",
    side: "left" as const,
  },
  
  
];

// ── 3. SECTION YOUR BEAUTIFUL PICTURES (GALERI KHUSUS AMELIA / BAE) ────────────
export const HER_PHOTOS = [
  {
    id: 1,
    url: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790270368/axdaxda_oelus1.jpg", // <-- URL Foto Amelia 1
    caption: "you",
    alt: "Amelia's beautiful smile",
    position: "center 20%",
  },
  {
    id: 2,
    url: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790270368/adadada_s7bxum.jpg", // <-- URL Foto Amelia 2
    caption: "are",
    alt: "Amelia's gentle eyes",
    position: "center 15%",
  },
  {
    id: 3,
    url: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790270368/adcada_horqdv.jpg", // <-- URL Foto Amelia 3
    caption: "so",
    alt: "Amelia's sweet laughter",
    position: "center 15%",
  },
  {
    id: 4,
    url: "https://res.cloudinary.com/dpxd2wzjr/image/upload/v1790270369/WhatsApp_Image_2026-09-25_at_00.15.17_h6hhke.jpg", // <-- URL Foto Amelia 4
    caption: "beautiful",
    alt: "Amelia, my favorite person",
    position: "center top", // <-- Fokus ke atas (center top) agar muka Amelia tidak terpotong!
  },
];
