declare module "html2pdf.js" {
  type PdfOptions = {
    margin?: number;
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: { scale?: number };
    jsPDF?: {
      unit?: "in" | "mm" | "cm" | "pt" | string;
      format?: "letter" | string;
      orientation?: "portrait" | "landscape" | string;
    };
  };

  interface Html2PdfWorker {
    set(options: PdfOptions): Html2PdfWorker;
    from(element: HTMLElement): Html2PdfWorker;
    save(): Promise<void>;
  }

  export default function html2pdf(): Html2PdfWorker;
}
