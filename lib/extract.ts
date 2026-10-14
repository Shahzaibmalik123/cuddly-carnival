import mammoth from "mammoth";
import * as XLSX from "xlsx";

// pdf-parse's index file runs a debug routine on import; load the inner module directly.
async function parsePdf(buffer: Buffer): Promise<string> {
  // @ts-expect-error - no type declarations for the inner module
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const result = await pdfParse(buffer);
  return result.text as string;
}

export async function extractText(name: string, buffer: Buffer): Promise<string> {
  const ext = name.toLowerCase().split(".").pop() ?? "";

  switch (ext) {
    case "pdf":
      return parsePdf(buffer);
    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "xlsx":
    case "xls": {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      return workbook.SheetNames.map((sheet) => {
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet]);
        return `# Sheet: ${sheet}\n${csv}`;
      }).join("\n\n");
    }
    case "csv":
    case "txt":
    case "md":
    case "json":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}
