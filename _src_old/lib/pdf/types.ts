export interface PDFBlock {
  type: "title" | "subtitle" | "paragraph" | "space";
  content?: string;
}

export interface ConcordiaStyle {
  primaryColor: string;
  textColor: string;
  titleSize: number;
  subtitleSize: number;
  paragraphSize: number;
  lineHeight: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}
