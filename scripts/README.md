# Video Creation Script

This script creates a homepage video from images in the `images_for_video` folder.

## Requirements

- Python 3.6+
- ffmpeg (must be installed and in PATH)
- Pillow library: `pip install Pillow`

## Usage

```bash
cd /path/to/bal-github.io
python scripts/create_home_video.py
```

The script will:
1. Load all images from `public/assets/images_for_video/`
2. Display each image for 3 seconds
3. Create a final frame with "Meet us at Galilai Group @ Brown" text and logo
4. Combine everything into a video at `public/assets/videos/homepage.mp4`

## Configuration

You can modify these variables in the script:
- `IMAGE_DURATION`: Seconds per image and final frame (default: 3)
- `VIDEO_WIDTH` and `VIDEO_HEIGHT`: Video dimensions (default: 1920x1080)
- `FPS`: Frames per second (default: 30)
- `LOGO_SIZE`: Logo size in pixels (default: 350)
- `IMAGE_ORDER`: List of image filenames in the order you want them to appear
  - Example: `["necv2025_group_photo.jpg", "extrapolation_talk.jpg", ...]`
  - Leave as empty list `[]` to use all images in alphabetical order

