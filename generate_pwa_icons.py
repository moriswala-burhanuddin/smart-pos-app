from PIL import Image, ImageDraw

def create_pwa_icon(size, filename):
    # Create image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Red Squircle Background
    radius = int(size * 0.22)
    margin = int(size * 0.04)
    # Draw rounded rectangle
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=radius,
        fill="#DC2626"
    )

    # Draw Barcode Symbol inside
    # Center bounds
    bw = int(size * 0.58)
    bh = int(size * 0.42)
    left = (size - bw) // 2
    top = (size - bh) // 2

    # Barcode bars patterns (widths relative)
    bar_widths = [3, 2, 5, 2, 4, 2, 6, 3, 2, 4, 3, 2]
    total_units = sum(bar_widths) + len(bar_widths) * 2
    unit_px = bw / total_units

    curr_x = left
    for i, w in enumerate(bar_widths):
        bar_w = max(2, int(w * unit_px))
        draw.rounded_rectangle(
            [curr_x, top, curr_x + bar_w, top + bh],
            radius=max(1, int(size * 0.01)),
            fill="#FFFFFF"
        )
        curr_x += bar_w + int(unit_px * 2)

    # Horizontal Laser Scanner Beam across the barcode
    laser_h = max(3, int(size * 0.024))
    laser_y = top + bh // 2 - laser_h // 2
    draw.rounded_rectangle(
        [left - int(size * 0.02), laser_y, left + bw + int(size * 0.02), laser_y + laser_h],
        radius=laser_h // 2,
        fill="#FFFFFF"
    )

    img.save(filename, "PNG")
    print(f"Generated {filename} ({size}x{size})")

if __name__ == "__main__":
    out_dir = r"d:\burhani-eco-web\smartbill-pos\public"
    create_pwa_icon(192, f"{out_dir}\\pwa-icon-192.png")
    create_pwa_icon(512, f"{out_dir}\\pwa-icon-512.png")
    create_pwa_icon(180, f"{out_dir}\\apple-touch-icon.png")
    create_pwa_icon(64, f"{out_dir}\\pwa-favicon.png")
