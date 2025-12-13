#!/usr/bin/env python3
"""
Script to create a video from images in images_for_video folder
with a final frame containing "Meet us at Galilai Group @ Brown" and the logo.
"""

import os
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Configuration
IMAGE_DURATION = 3  # seconds per image (also used for final frame)
TRANSITION_DURATION = 0.5  # seconds for crossfade transition between frames
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
FPS = 30
LOGO_SIZE = 350  # Logo size in pixels

# Specify which images to use and their order (by filename)
# Leave empty list [] to use all images in alphabetical order
IMAGE_ORDER = [
    "extrapolation_talk.jpg",
    "llm_talk.jpg",
    "spline_talk.jpg",
    "necv2025_group_photo.jpg",
]

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
IMAGES_DIR = PROJECT_ROOT / "public" / "assets" / "images_for_video"
LOGO_PATH = PROJECT_ROOT / "public" / "assets" / "logos" / "lab-logo.svg"
OUTPUT_VIDEO = PROJECT_ROOT / "public" / "assets" / "videos" / "homepage.mp4"
TEMP_DIR = PROJECT_ROOT / "temp_video_frames"

def check_dependencies():
    """Check if required tools are available."""
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: ffmpeg is not installed or not in PATH")
        print("Please install ffmpeg: https://ffmpeg.org/download.html")
        sys.exit(1)
    
    try:
        import PIL
    except ImportError:
        print("Error: Pillow is not installed")
        print("Please install it: pip install Pillow")
        sys.exit(1)

def get_image_files():
    """Get image files from the images_for_video directory in specified order."""
    image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
    
    if not IMAGES_DIR.exists():
        print(f"Error: Images directory not found: {IMAGES_DIR}")
        sys.exit(1)
    
    # Get all available images
    available_images = {}
    for file in IMAGES_DIR.iterdir():
        if file.suffix in image_extensions:
            available_images[file.name] = file
    
    if not available_images:
        print(f"Error: No images found in {IMAGES_DIR}")
        sys.exit(1)
    
    # Use specified order or all images in alphabetical order
    if IMAGE_ORDER:
        images = []
        missing_images = []
        for img_name in IMAGE_ORDER:
            if img_name in available_images:
                images.append(available_images[img_name])
            else:
                missing_images.append(img_name)
        
        if missing_images:
            print(f"Warning: Some specified images not found: {missing_images}")
        
        if not images:
            print("Error: None of the specified images were found!")
            sys.exit(1)
    else:
        # Use all images in alphabetical order
        images = sorted(available_images.values(), key=lambda x: x.name)
    
    print(f"Using {len(images)} images in order:")
    for img in images:
        print(f"  - {img.name}")
    
    return images

def resize_image(input_path, output_path, width, height):
    """Resize image to fill video dimensions (cover behavior)."""
    img = Image.open(input_path)
    
    # Calculate scaling to fill the entire frame
    img_ratio = img.width / img.height
    target_ratio = width / height
    
    if img_ratio > target_ratio:
        # Image is wider - fit to height and crop width
        new_height = height
        new_width = int(height * img_ratio)
    else:
        # Image is taller - fit to width and crop height
        new_width = width
        new_height = int(width / img_ratio)
    
    # Resize image
    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Crop to center
    left = (new_width - width) // 2
    top = (new_height - height) // 2
    right = left + width
    bottom = top + height
    img = img.crop((left, top, right, bottom))
    
    img.save(output_path, 'JPEG', quality=95)
    return output_path

def create_final_frame(output_path, logo_path):
    """Create the final frame with text and logo."""
    # Create a white background
    img = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), (255, 255, 255))
    
    draw = ImageDraw.Draw(img)
    
    # Try to load a nice font, fallback to default
    font_large = None
    font_medium = None
    
    # Try different font paths
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    
    for font_path in font_paths:
        try:
            if os.path.exists(font_path):
                font_large = ImageFont.truetype(font_path, 72)
                font_medium = ImageFont.truetype(font_path, 48)
                break
        except:
            continue
    
    if font_large is None:
        try:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
        except:
            pass
    
    # Add logo if it exists
    logo_y = VIDEO_HEIGHT // 4
    if logo_path.exists():
        try:
            if logo_path.suffix.lower() == '.svg':
                # For SVG, try to use PNG version if available
                png_logo = logo_path.with_suffix('.png')
                if png_logo.exists():
                    logo = Image.open(png_logo)
                else:
                    # Skip SVG for now (would need cairosvg or similar)
                    print(f"Warning: SVG logo found but PNG conversion not available. Skipping logo.")
                    logo = None
            else:
                logo = Image.open(logo_path)
            
            if logo:
                logo.thumbnail((LOGO_SIZE, LOGO_SIZE), Image.Resampling.LANCZOS)
                logo_x = (VIDEO_WIDTH - logo.width) // 2
                if logo.mode == 'RGBA':
                    img.paste(logo, (logo_x, logo_y), logo)
                else:
                    img.paste(logo, (logo_x, logo_y))
                logo_y += logo.height + 40
        except Exception as e:
            print(f"Warning: Could not load logo: {e}")
    
    # Add text
    text = "Meet us at Galilai Group @ Brown"
    text_lines = text.split('@')
    
    # Calculate text positions
    y_position = logo_y + 100 if logo_y > VIDEO_HEIGHT // 4 else VIDEO_HEIGHT // 2 - 50
    
    # Main text (black)
    main_text = text_lines[0].strip()
    if font_large:
        bbox = draw.textbbox((0, 0), main_text, font=font_large)
        text_width = bbox[2] - bbox[0]
        text_x = (VIDEO_WIDTH - text_width) // 2
        draw.text((text_x, y_position), main_text, fill=(0, 0, 0), font=font_large)
    else:
        # Fallback without font
        text_x = (VIDEO_WIDTH - len(main_text) * 20) // 2
        draw.text((text_x, y_position), main_text, fill=(0, 0, 0))
    
    # Location text (black)
    if len(text_lines) > 1:
        location_text = "@" + text_lines[1].strip()
        if font_medium:
            bbox = draw.textbbox((0, 0), location_text, font=font_medium)
            text_width = bbox[2] - bbox[0]
            text_x = (VIDEO_WIDTH - text_width) // 2
            draw.text((text_x, y_position + 100), location_text, fill=(0, 0, 0), font=font_medium)
        else:
            text_x = (VIDEO_WIDTH - len(location_text) * 15) // 2
            draw.text((text_x, y_position + 100), location_text, fill=(0, 0, 0))
    
    img.save(output_path, 'JPEG', quality=95)
    return output_path

def create_video_from_images(image_files, final_frame_path, output_path):
    """Create video from images using ffmpeg with smooth crossfade transitions."""
    TEMP_DIR.mkdir(exist_ok=True)
    
    # Resize all images
    resized_images = []
    for i, img_path in enumerate(image_files):
        resized_path = TEMP_DIR / f"frame_{i:04d}.jpg"
        resize_image(img_path, resized_path, VIDEO_WIDTH, VIDEO_HEIGHT)
        resized_images.append(resized_path)
    
    # Resize final frame
    final_resized = TEMP_DIR / "final_frame.jpg"
    resize_image(final_frame_path, final_resized, VIDEO_WIDTH, VIDEO_HEIGHT)
    
    # Calculate video segment duration (image duration + transition for overlap)
    segment_duration = IMAGE_DURATION + TRANSITION_DURATION
    
    # Create individual video segments for each image
    video_segments = []
    print("\nCreating video segments...")
    for i, img_path in enumerate(resized_images):
        segment_path = TEMP_DIR / f"segment_{i:04d}.mp4"
        cmd = [
            "ffmpeg",
            "-loop", "1",
            "-i", str(img_path),
            "-t", str(segment_duration),
            "-vf", f"fps={FPS},scale={VIDEO_WIDTH}:{VIDEO_HEIGHT}",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-y",
            str(segment_path)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        video_segments.append(segment_path)
        print(f"  Created segment {i+1}/{len(resized_images)}")
    
    # Create final frame segment
    final_segment_path = TEMP_DIR / "final_segment.mp4"
    cmd = [
        "ffmpeg",
        "-loop", "1",
        "-i", str(final_resized),
        "-t", str(segment_duration),
        "-vf", f"fps={FPS},scale={VIDEO_WIDTH}:{VIDEO_HEIGHT}",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-y",
        str(final_segment_path)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    video_segments.append(final_segment_path)
    print(f"  Created final segment")
    
    # Build filter_complex for crossfade transitions
    num_segments = len(video_segments)
    filter_parts = []
    
    # Label all inputs first
    for i in range(num_segments):
        filter_parts.append(f"[{i}:v]setpts=PTS-STARTPTS[v{i}in]")
    
    # Chain crossfades starting from first two inputs
    current_label = "v0in"
    for i in range(1, num_segments):
        next_label = f"v{i}out"
        # Offset is when transition starts (end of previous segment minus transition)
        offset = i * IMAGE_DURATION - TRANSITION_DURATION
        filter_parts.append(
            f"[{current_label}][v{i}in]xfade=transition=fade:duration={TRANSITION_DURATION}:offset={offset:.2f}[{next_label}]"
        )
        current_label = next_label
    
    filter_complex = ";".join(filter_parts)
    
    # Create output directory if it doesn't exist
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Build final ffmpeg command with crossfades
    # Need to input all segments
    cmd = ["ffmpeg"]
    for segment in video_segments:
        cmd.extend(["-i", str(segment)])
    final_output_label = f"v{num_segments-1}out"
    cmd.extend([
        "-filter_complex", filter_complex,
        "-map", f"[{final_output_label}]",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-y",
        str(output_path)
    ])
    
    print(f"\nCreating video with smooth transitions: {output_path}")
    print(f"Transition duration: {TRANSITION_DURATION}s")
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"\n✓ Video created successfully: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Error creating video: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        sys.exit(1)
    finally:
        # Clean up temp files
        if TEMP_DIR.exists():
            import shutil
            shutil.rmtree(TEMP_DIR)
            print("Cleaned up temporary files")

def main():
    print("=" * 60)
    print("Galilai Group Homepage Video Creator")
    print("=" * 60)
    
    check_dependencies()
    
    # Get images
    image_files = get_image_files()
    
    # Create final frame
    print(f"\nCreating final frame...")
    final_frame_path = TEMP_DIR / "final_frame_temp.jpg"
    TEMP_DIR.mkdir(exist_ok=True)
    create_final_frame(final_frame_path, LOGO_PATH)
    print("✓ Final frame created")
    
    # Create video
    create_video_from_images(image_files, final_frame_path, OUTPUT_VIDEO)
    
    print("\n" + "=" * 60)
    print("Done!")
    print(f"Video saved to: {OUTPUT_VIDEO}")
    print("=" * 60)

if __name__ == "__main__":
    main()

