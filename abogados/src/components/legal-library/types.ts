// Tipos para la Biblioteca Legal

export type LegalSection = 
  | 'search' 
  | 'constitution' 
  | 'codes' 
  | 'boe' 
  | 'jurisprudencia' 
  | 'favorites';

export interface LegalArticle {
  id: string;
  number: string;
  title?: string;
  content: string;
  chapter?: string;
  section?: string;
  subsection?: string;
}

export interface LegalChapter {
  id: string;
  number: string;
  title: string;
  articles: LegalArticle[];
}

export interface LegalTitle {
  id: string;
  number: string;
  title: string;
  chapters?: LegalChapter[];
  articles?: LegalArticle[];
}

export interface Constitution {
  preamble: string;
  titles: LegalTitle[];
}

export interface LegalCode {
  id: string;
  name: string;
  shortName: string;
  description: string;
  date: string;
  titles: LegalTitle[];
}

export interface BOEDocument {
  id: string;
  number: string;
  date: string;
  title: string;
  type: 'ley' | 'real-decreto' | 'orden' | 'resolucion' | 'circular' | 'instruccion';
  ministry: string;
  summary: string;
  pdfUrl?: string;
}

export interface BOEDay {
  date: string;
  number: string;
  documents: BOEDocument[];
}

export interface Jurisprudence {
  id: string;
  tribunal: 'supremo' | 'audiencia-nacional' | 'constitucional';
  sala: string;
  number: string;
  date: string;
  ponente: string;
  materia: string;
  summary: string;
  fullText?: string;
}

export interface LegalFavorite {
  id: string;
  type: 'constitution' | 'code' | 'boe' | 'jurisprudencia';
  title: string;
  reference: string;
  dateAdded: string;
  notes?: string;
  folder?: string;
}

export interface SearchResult {
  id: string;
  type: 'constitution' | 'code' | 'boe' | 'jurisprudencia';
  title: string;
  excerpt: string;
  source: string;
  date?: string;
}
