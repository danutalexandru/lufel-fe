# Video Replacement Instructions

The homepage currently uses a placeholder YouTube video. When you receive the client's video, you have two options:

## Option 1: Using a Local Video File (Recommended)

1. Place the video file in the `public/videos/` directory (create the `videos` folder if it doesn't exist)
2. Supported formats: `.mp4`, `.webm`, `.ogg`
3. Open `src/pages/Home.jsx`
4. Find the video section (around line 7-45)
5. Comment out or remove the `<iframe>` YouTube embed
6. Uncomment the `<video>` tag section
7. Update the `src` path to match your video file name

Example:
```jsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute top-0 left-0 w-full h-full object-cover"
>
  <source src="/videos/pottery-video.mp4" type="video/mp4" />
  <source src="/videos/pottery-video.webm" type="video/webm" />
  Your browser does not support the video tag.
</video>
```

## Option 2: Using YouTube/Vimeo Embed

If the client provides a YouTube or Vimeo URL:

1. Extract the video ID from the URL
2. Replace `L5JhHGKbKYQ` in the iframe `src` with the new video ID
3. For YouTube: `https://www.youtube.com/watch?v=-YCGK33c0xs`
4. For Vimeo: Use Vimeo's embed URL format

## Video Best Practices

- **Format**: MP4 (H.264) is most widely supported
- **Resolution**: 1920x1080 (Full HD) or higher recommended
- **File Size**: Optimize for web (aim for < 10MB for good performance)
- **Aspect Ratio**: 16:9 works best for full-width hero sections
- **Duration**: 30-60 seconds for background videos is ideal

## Mobile Considerations

The current implementation is mobile-responsive. Videos will:
- Scale appropriately on all screen sizes
- Maintain aspect ratio
- Play automatically (muted, as required by most browsers)
- Loop seamlessly

