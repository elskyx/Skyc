// public/js/utils/pdfHelper.js

/**
 * Compiles a list of image URLs or Blobs into a single PDF document
 * @param {Array<string>} imageUrls - List of image URLs
 * @param {string} title - Document title
 * @param {function} onProgress - Progress callback (percentage, text)
 * @returns {Promise<Blob>} Compiled PDF Blob
 */
export async function compileImagesToPdf(imageUrls, title = "Skyc-Album", onProgress = () => {}) {
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error("No images provided for PDF compilation");
  }

  onProgress(10, "Initializing PDF compiler...");

  // Check if PDFLib is available globally (from pdf-lib.min.js)
  const PDFLib = window.PDFLib;

  if (PDFLib && PDFLib.PDFDocument) {
    const pdfDoc = await PDFLib.PDFDocument.create();
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor("Skyc Media Downloader");

    const total = imageUrls.length;

    for (let i = 0; i < total; i++) {
      const url = imageUrls[i];
      onProgress(10 + Math.floor((i / total) * 80), `Embedding image ${i + 1} of ${total}...`);

      try {
        const imgRes = await fetch(url);
        const imgBytes = await imgRes.arrayBuffer();

        let embeddedImg;
        if (url.toLowerCase().includes(".png")) {
          embeddedImg = await pdfDoc.embedPng(imgBytes);
        } else {
          embeddedImg = await pdfDoc.embedJpg(imgBytes);
        }

        const { width, height } = embeddedImg.scale(1.0);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width,
          height,
        });
      } catch (err) {
        console.warn(`[Skyc PDF] Failed to embed image ${url}:`, err);
      }
    }

    onProgress(95, "Generating final PDF file...");
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  }

  // Canvas Fallback if pdf-lib is not available
  throw new Error("PDFLib is not loaded in this environment.");
}
