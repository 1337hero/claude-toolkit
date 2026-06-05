package main

import (
	"bytes"
	"context"
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
	"github.com/fogleman/gg"
	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/goregular"
)

const phi = 1.618033988749895

func main() {
	width := flag.Int64("width", 1920, "Viewport width")
	height := flag.Int64("height", 1080, "Viewport height")
	fullPage := flag.Bool("full-page", false, "Capture full scrollable page")
	output := flag.String("output", "./audit-output", "Output directory")
	flag.Parse()

	if flag.NArg() < 1 {
		fmt.Fprintln(os.Stderr, "Usage: audit <url> [--width 1920] [--height 1080] [--full-page]")
		os.Exit(1)
	}
	url := flag.Arg(0)

	printBanner(url)

	img, rawPNG, err := captureScreenshot(url, *width, *height, *fullPage)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	fileSize := len(rawPNG)

	if err := os.MkdirAll(*output, 0o755); err != nil {
		fmt.Fprintf(os.Stderr, "Error creating output dir: %v\n", err)
		os.Exit(1)
	}

	origPath := filepath.Join(*output, "original.png")
	if err := os.WriteFile(origPath, rawPNG, 0o644); err != nil {
		fmt.Fprintf(os.Stderr, "Error saving original: %v\n", err)
		os.Exit(1)
	}

	bounds := img.Bounds()
	w, h := bounds.Dx(), bounds.Dy()

	fmt.Println("📐 DIMENSIONS ANALYSIS:")
	dims := analyzeDimensions(w, h)
	for _, k := range []string{"width", "height", "aspect_ratio", "golden_ratio", "ratio_difference", "orientation", "fibonacci_levels"} {
		fmt.Printf("  %s: %v\n", k, dims[k])
	}

	fmt.Println("\n✨ GOLDEN RATIO ANALYSIS:")
	gra := analyzeGoldenRatio(w, h)
	for _, k := range []string{"golden_width", "golden_height", "golden_x", "golden_y", "fibonacci_circles"} {
		fmt.Printf("  %s: %v\n", k, gra[k])
	}

	golden := drawGoldenRatioOverlay(img)
	goldenPath := filepath.Join(*output, "golden-ratio.png")
	golden.SavePNG(goldenPath)

	full := drawCompositionOverlay(img)
	overlayPath := filepath.Join(*output, "full-overlay.png")
	full.SavePNG(overlayPath)

	fmt.Printf("\n📊 COMPOSITION ANALYSIS:\n")
	fmt.Printf("  Intersection Points: %d (at thirds grid intersections - power points for visual focus)\n", 4)
	labels := []string{"TL", "TR", "BL", "BR"}
	thirdX, thirdY := w/3, h/3
	twoThirdX, twoThirdY := 2*w/3, 2*h/3
	positions := [][2]int{{thirdX, thirdY}, {twoThirdX, thirdY}, {thirdX, twoThirdY}, {twoThirdX, twoThirdY}}
	for i, pt := range positions {
		fmt.Printf("    %s: (%d, %d)\n", labels[i], pt[0], pt[1])
	}
	innerMargin := int(math.Min(float64(w), float64(h)) * (1 - 1/phi) / 2)
	fmt.Printf("  Bounding Box: %dpx margin (%.1f%% of shorter side)\n", innerMargin, (1-1/phi)/2*100)
	fmt.Printf("  Safe Area: Inner rectangle within golden ratio bounds\n")

	fmt.Println("\n🎯 SUGGESTIONS:")
	fmt.Println("  1. Place key elements at intersection points for maximum visual impact")
	fmt.Println("  2. Align text and images with the golden spiral flow")
	fmt.Println("  3. Use Fibonacci circles for secondary element placement")
	fmt.Println("  4. Keep important content within the bounding box safe area")

	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Printf("✅ Golden Ratio Analysis Complete!")
	fmt.Printf("\n📊 Screenshots saved to '%s/'\n", *output)
	fmt.Printf("📐 Original: %s\n", origPath)
	fmt.Printf("🌀 Golden:   %s\n", goldenPath)
	fmt.Printf("🎯 Overlay:  %s\n", overlayPath)
	fmt.Printf("📦 Size: %.1fKB | 📐 Dimensions: %dx%dpx\n", float64(fileSize)/1024, w, h)
	fmt.Println(strings.Repeat("=", 60))
}

func printBanner(url string) {
	fmt.Println(`
╔═══════════════════════════════════════════════════════════╗
║       GOLDEN RATIO VISUAL AUDIT - SCREENSHOT              ║
╚═══════════════════════════════════════════════════════════╝`)
	fmt.Printf("Analyzing: %s\n", url)
	fmt.Println(strings.Repeat("=", 60))
}

// --- Screenshot ---

func captureScreenshot(url string, width, height int64, fullPage bool) (image.Image, []byte, error) {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	if err := chromedp.Run(ctx,
		chromedp.EmulateViewport(width, height),
		chromedp.Navigate(url),
		chromedp.WaitReady("body"),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		return nil, nil, fmt.Errorf("navigate: %w", err)
	}

	if fullPage {
		var scrollHeight float64
		if err := chromedp.Run(ctx,
			chromedp.Evaluate("document.documentElement.scrollHeight", &scrollHeight),
		); err != nil {
			return nil, nil, fmt.Errorf("eval scrollHeight: %w", err)
		}
		if int64(scrollHeight) > height {
			if err := chromedp.Run(ctx,
				chromedp.EmulateViewport(width, int64(scrollHeight)),
				chromedp.Sleep(500*time.Millisecond),
			); err != nil {
				return nil, nil, fmt.Errorf("resize viewport: %w", err)
			}
		}
	}

	var buf []byte
	if err := chromedp.Run(ctx, chromedp.CaptureScreenshot(&buf)); err != nil {
		return nil, nil, fmt.Errorf("capture: %w", err)
	}

	img, err := png.Decode(bytes.NewReader(buf))
	if err != nil {
		return nil, nil, fmt.Errorf("decode png: %w", err)
	}

	return img, buf, nil
}

// --- Analysis ---

func analyzeDimensions(w, h int) map[string]any {
	aspect := float64(w) / float64(h)
	levels := 0
	dim := math.Max(float64(w), float64(h))
	for dim > 1 {
		dim /= phi
		levels++
	}

	orient := "square"
	if w > h {
		orient = "landscape"
	} else if h > w {
		orient = "portrait"
	}

	return map[string]any{
		"width":             w,
		"height":            h,
		"aspect_ratio":      fmt.Sprintf("%.4f", aspect),
		"golden_ratio":      fmt.Sprintf("%.4f", phi),
		"ratio_difference":  fmt.Sprintf("%.2f%%", math.Abs(aspect-phi)*100),
		"orientation":       orient,
		"fibonacci_levels":  levels,
	}
}

func analyzeGoldenRatio(w, h int) map[string]any {
	gw := int(float64(w) / phi)
	gh := int(float64(h) / phi)
	gx := (w - gw) / 2
	gy := (h - gh) / 2
	fibPoints := fmt.Sprintf("4 circles at (%d,%d), (%d,%d), (%d,%d), (%d,%d)",
		int(float64(w)*(1/phi)), int(float64(h)*(1/phi)),
		int(float64(w)*(1/phi)), int(float64(h)*(1-1/phi)),
		int(float64(w)*(1-1/phi)), int(float64(h)*(1/phi)),
		int(float64(w)*(1-1/phi)), int(float64(h)*(1-1/phi)),
	)
	return map[string]any{
		"golden_width":    gw,
		"golden_height":   gh,
		"golden_x":        gx,
		"golden_y":        gy,
		"fibonacci_circles": fibPoints,
	}
}

// --- Font ---

func setFont(dc *gg.Context, size float64) {
	f, err := truetype.Parse(goregular.TTF)
	if err != nil {
		return
	}
	face := truetype.NewFace(f, &truetype.Options{
		Size:    size,
		DPI:     72,
		Hinting: font.HintingFull,
	})
	dc.SetFontFace(face)
}

// --- Arc helper ---

func drawArc(dc *gg.Context, cx, cy, r, startDeg, endDeg float64) {
	steps := 40
	for i := 0; i < steps; i++ {
		t1 := (startDeg + (endDeg-startDeg)*float64(i)/float64(steps)) * math.Pi / 180
		t2 := (startDeg + (endDeg-startDeg)*float64(i+1)/float64(steps)) * math.Pi / 180
		x1 := cx + r*math.Cos(t1)
		y1 := cy + r*math.Sin(t1)
		x2 := cx + r*math.Cos(t2)
		y2 := cy + r*math.Sin(t2)
		dc.DrawLine(x1, y1, x2, y2)
	}
	dc.Stroke()
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func minFloat64(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

// --- Overlay drawing ---

func drawThirds(dc *gg.Context, w, h int) {
	c := color.RGBA{255, 255, 0, 128}
	dc.SetColor(c)
	dc.SetLineWidth(2)
	for i := 1; i <= 2; i++ {
		y := float64(h * i / 3)
		dc.DrawLine(0, y, float64(w), y)
		dc.Stroke()
		x := float64(w * i / 3)
		dc.DrawLine(x, 0, x, float64(h))
		dc.Stroke()
	}
}

func drawDiagonals(dc *gg.Context, w, h int) {
	dc.SetColor(color.RGBA{255, 215, 0, 180})
	dc.SetLineWidth(2)
	dc.DrawLine(0, 0, float64(w), float64(h))
	dc.Stroke()
	dc.DrawLine(float64(w), 0, 0, float64(h))
	dc.Stroke()
}

func drawIntersectionPoints(dc *gg.Context, w, h int) {
	setFont(dc, 14)

	points := [][2]int{
		{w / 3, h / 3}, {2 * w / 3, h / 3},
		{w / 3, 2 * h / 3}, {2 * w / 3, 2 * h / 3},
	}
	labels := []string{"TL", "TR", "BL", "BR"}

	for i, pt := range points {
		x, y := float64(pt[0]), float64(pt[1])

		dc.SetColor(color.RGBA{255, 100, 100, 100})
		dc.DrawCircle(x, y, 8)
		dc.Fill()

		dc.SetColor(color.RGBA{255, 0, 0, 220})
		dc.SetLineWidth(2)
		dc.DrawCircle(x, y, 8)
		dc.Stroke()

		var lx, ly float64
		switch i {
		case 0:
			lx, ly = x-30, y-15
		case 1:
			lx, ly = x+15, y-15
		case 2:
			lx, ly = x-30, y+25
		case 3:
			lx, ly = x+15, y+25
		}

		dc.SetColor(color.RGBA{255, 0, 0, 230})
		dc.DrawString(labels[i], lx, ly+12)
	}
}

func drawBoundingBox(dc *gg.Context, w, h int) {
	setFont(dc, 12)

	margin := int(minFloat64(float64(w), float64(h)) * 0.05)

	dc.SetColor(color.RGBA{255, 106, 0, 128})
	dc.SetLineWidth(3)
	dc.DrawRectangle(float64(margin), float64(margin), float64(w-2*margin), float64(h-2*margin))
	dc.Stroke()

	innerMargin := int(minFloat64(float64(w), float64(h)) * (1 - 1/phi) / 2)

	dc.SetColor(color.RGBA{46, 139, 87, 128})
	dc.SetLineWidth(2)
	dc.DrawRectangle(float64(innerMargin), float64(innerMargin), float64(w-2*innerMargin), float64(h-2*innerMargin))
	dc.Stroke()

	dc.SetColor(color.RGBA{255, 106, 0, 200})
	dc.DrawString(fmt.Sprintf("Bounding box: %dpx margin", margin), float64(margin+10), float64(margin+20))

	dc.SetColor(color.RGBA{46, 139, 87, 200})
	dc.DrawString("Safe area within golden ratio bounds", float64(innerMargin+10), float64(h-innerMargin-10))
}

func drawGoldenSpiral(dc *gg.Context, w, h int) {
	x, y := float64(w/3), float64(h/3)
	size := float64(minInt(w, h) / 3)

	dc.SetColor(color.RGBA{139, 0, 139, 200})
	dc.SetLineWidth(3)

	for i := 0; i < 8; i++ {
		if size <= 0 {
			break
		}

		var cx, cy, startDeg, endDeg float64

		switch i % 4 {
		case 0:
			cx, cy = x+1.5*size, y+0.5*size
			startDeg, endDeg = 180, 270
		case 1:
			cx, cy = x+0.5*size, y+1.5*size
			startDeg, endDeg = 90, 180
		case 2:
			cx, cy = x-0.5*size, y+0.5*size
			startDeg, endDeg = 0, 90
		case 3:
			cx, cy = x+0.5*size, y-0.5*size
			startDeg, endDeg = 270, 360
		}

		drawArc(dc, cx, cy, size/2, startDeg, endDeg)

		size = math.Max(1, math.Floor(size/phi))

		shift := size * phi
		switch i % 4 {
		case 0:
			x += shift
		case 1:
			y += shift
		case 2:
			x -= shift
		case 3:
			y -= shift
		}
	}
}

func drawFibonacciCircles(dc *gg.Context, w, h int) {
	invPhi := 1 / phi
	points := [][2]float64{
		{float64(w) * invPhi, float64(h) * invPhi},
		{float64(w) * invPhi, float64(h) * (1 - invPhi)},
		{float64(w) * (1 - invPhi), float64(h) * invPhi},
		{float64(w) * (1 - invPhi), float64(h) * (1 - invPhi)},
	}

	minDim := minInt(w, h)

	for i, pt := range points {
		r := float64(maxInt(5, minDim/(8+i*2)))

		dc.SetColor(color.RGBA{0, 152, 204, 80})
		dc.DrawCircle(pt[0], pt[1], r)
		dc.Fill()

		dc.SetColor(color.RGBA{0, 122, 204, 180})
		dc.SetLineWidth(2)
		dc.DrawCircle(pt[0], pt[1], r)
		dc.Stroke()
	}
}

// --- Composite overlays ---

func drawGoldenRatioOverlay(img image.Image) *gg.Context {
	dc := gg.NewContextForImage(img)
	w, h := dc.Width(), dc.Height()

	drawGoldenSpiral(dc, w, h)
	drawFibonacciCircles(dc, w, h)
	return dc
}

func drawCompositionOverlay(img image.Image) *gg.Context {
	dc := gg.NewContextForImage(img)
	w, h := dc.Width(), dc.Height()

	drawThirds(dc, w, h)
	drawDiagonals(dc, w, h)
	drawIntersectionPoints(dc, w, h)
	drawBoundingBox(dc, w, h)
	drawGoldenSpiral(dc, w, h)
	drawFibonacciCircles(dc, w, h)
	return dc
}
