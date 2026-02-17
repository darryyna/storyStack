export interface Book {
  id: string;
  title: string;
}

export interface ExternalBookResponse {
  id: string; // Mongo ID
  sourceId: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}
