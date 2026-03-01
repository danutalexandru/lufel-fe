# Homepage Hero Video – Your Own Videos (Mobile + Desktop)

The homepage hero uses **two videos**: one for mobile and one for desktop. The right one is shown automatically based on screen size (breakpoint: 768px).

## 1. Add your video files

Create the folder and put your two videos there:

```
lufel-frontend/
  public/
    videos/
      hero-mobile.mp4   ← video for phones / small screens
      hero-desktop.mp4  ← video for tablets and desktops
```

- **Paths in the app:** `/videos/hero-mobile.mp4` and `/videos/hero-desktop.mp4`
- **Format:** MP4 (H.264) is recommended for best support.
- You can use other names; if you do, update the `src` in `src/pages/Home.jsx` to match.

## 2. File names used in code

In `src/pages/Home.jsx` the hero section uses:

- **Mobile:** `src="/videos/hero-mobile.mp4"`
- **Desktop:** `src="/videos/hero-desktop.mp4"`

To use different file names, change these two `src` values in `Home.jsx`.

## 3. Behaviour

- **Mobile:** video with class `md:hidden` is shown below 768px width.
- **Desktop:** video with class `hidden md:block` is shown from 768px up.
- Both videos are: autoplay, loop, muted, `object-cover` (fill the hero area).

## 4. Tips

- **Mobile:** e.g. 720p, portrait or square often works well; keep file size moderate.
- **Desktop:** e.g. 1920×1080 (16:9) for the hero.
- **Size:** compress for web (e.g. &lt; 5–10 MB per file) for faster loading.
- Browsers usually require **muted** for autoplay; the current setup is already muted.
