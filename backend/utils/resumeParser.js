import pdfParse from "pdf-parse";
import mammoth from "mammoth"; // for .docx
import { Buffer } from "buffer";

// ─── constants ───────────────────────────────────────────────────────────────

/** If extracted text is shorter than this, the resume is flagged for review */
const MIN_PARSEABLE_CHARS = 100;

// ─── text normalisation ───────────────────────────────────────────────────────

/**
 * Normalise Unicode so non-ASCII names (José, 张伟, Андрей, Søren …)
 * don't cause downstream encoding errors.
 *
 *  • NFC compose  – keeps é, ñ, 中 intact
 *  • strip C0/C1 control characters except \n, \r, \t
 *  • collapse excessive blank lines
 */
export function normalizeText(text) {
  if (typeof text !== "string") return "";

  // NFC keeps accented/CJK characters intact
  let out = text.normalize("NFC");

  // Remove control characters (but keep whitespace we want)
  out = out.replace(/[^\P{C}\n\r\t]/gu, "");

  // Collapse 3+ consecutive blank lines → 1 blank line
  out = out.replace(/(\n\s*){3,}/g, "\n\n");

  return out.trim();
}

// ─── format-specific extractors ──────────────────────────────────────────────

/**
 * Extract text from a PDF buffer.
 *
 * pdf-parse reads all pages and, with pagerender set to extract raw strings,
 * does a far better job on two-column and table-heavy PDFs than the default
 * single-pass regex approach that was here before.
 */
async function extractPDF(buffer) {
  // Custom page renderer – collects text from every page individually
  // so column order is respected within each page.
  const pageTexts = [];

  const options = {
    // Called once per page; we accumulate page text ourselves
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: true,      // merge nearby characters
        disableCombineTextItems: false, // keep words joined
      });

      // Sort text items top-to-bottom, left-to-right so two-column layouts
      // read in the correct visual order.
      const items = textContent.items.slice().sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5]; // descending Y (top first)
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.transform[4] - b.transform[4];         // ascending X (left first)
      });

      const pageText = items.map((item) => item.str).join(" ");
      pageTexts.push(pageText);
      return pageText;
    },
  };

  await pdfParse(buffer, options);
  return pageTexts.join("\n\n");
}

/**
 * Extract text from a DOCX buffer using mammoth.
 * mammoth preserves table content as plain text rows.
 */
async function extractDOCX(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  if (result.messages?.length) {
    console.warn("[resumeParser] DOCX warnings:", result.messages);
  }
  return result.value;
}

/**
 * Extract text from a plain-text buffer.
 * Tries UTF-8 first, falls back to latin-1 so we never throw on encoding issues.
 */
function extractTXT(buffer) {
  try {
    return buffer.toString("utf-8");
  } catch {
    return buffer.toString("latin1");
  }
}

// ─── review queue ─────────────────────────────────────────────────────────────

/**
 * Returns a review-queue entry object.
 * The caller (studentController) is responsible for persisting this to the DB.
 */
function buildReviewQueueEntry(originalName, mimeType, reason) {
  return {
    originalName,
    mimeType,
    reason,
    flaggedAt: new Date(),
  };
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Parse a resume file uploaded via multer (req.file).
 *
 * @param {object} file  – multer file object { buffer, mimetype, originalname }
 * @returns {object} { text, flagged, reviewEntry, error }
 *   - text        {string}  normalised extracted text (may be "" on failure)
 *   - flagged     {boolean} true when queued for manual review
 *   - reviewEntry {object|null} data to store in the review queue (if flagged)
 *   - error       {string|null} human-readable error message
 */
export async function parseResume(file) {
  const { buffer, mimetype, originalname } = file;

  const result = {
    text: "",
    flagged: false,
    reviewEntry: null,
    error: null,
  };

  // ── 1. dispatch by MIME type / extension ──────────────────────────────────
  let rawText = "";
  const ext = (originalname || "").split(".").pop().toLowerCase();

  try {
    if (
      mimetype === "application/pdf" ||
      ext === "pdf"
    ) {
      rawText = await extractPDF(buffer);

    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      rawText = await extractDOCX(buffer);

    } else if (
      mimetype === "text/plain" ||
      ext === "txt"
    ) {
      rawText = extractTXT(buffer);

    } else {
      const msg = `Unsupported file type: ${mimetype || ext}`;
      result.error = msg;
      result.flagged = true;
      result.reviewEntry = buildReviewQueueEntry(originalname, mimetype, msg);
      return result;
    }
  } catch (err) {
    const msg = `Extraction failed: ${err.message}`;
    console.error(`[resumeParser] ${msg}`, err);
    result.error = msg;
    result.flagged = true;
    result.reviewEntry = buildReviewQueueEntry(originalname, mimetype, msg);
    return result;
  }

  // ── 2. normalise ──────────────────────────────────────────────────────────
  result.text = normalizeText(rawText);

  // ── 3. quality check → flag if too short ──────────────────────────────────
  if (result.text.length < MIN_PARSEABLE_CHARS) {
    const msg =
      "Extracted text is too short – possibly a scanned/image-only PDF or empty file.";
    result.error = msg;
    result.flagged = true;
    result.reviewEntry = buildReviewQueueEntry(originalname, mimetype, msg);
  }

  return result;
}