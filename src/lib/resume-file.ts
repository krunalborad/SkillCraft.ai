/** Client-side resume file text extraction (PDF, DOCX, TXT). */

export const ACCEPTED = ".pdf,.docx,.txt,.md";

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return (await file.text()).trim();
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import(/* @vite-ignore */ "mammoth/mammoth.browser.js" as any);
    const buf = await file.arrayBuffer();
    const res = await (mammoth as any).extractRawText({ arrayBuffer: buf });
    return String(res.value || "").trim();
  }

  if (name.endsWith(".pdf")) {
    const pdfjs: any = await import("pdfjs-dist");
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((it: any) => it.str ?? "").join(" "));
    }
    return pages.join("\n\n").replace(/[ \t]{2,}/g, " ").trim();
  }

  throw new Error("Unsupported file — upload a PDF, DOCX or TXT resume.");
}