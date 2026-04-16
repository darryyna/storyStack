export type BookSource = 'google' | 'openlibrary';

export interface SearchBook {
    id: string;
    source: BookSource;
    title: string;
    authors: string[];
    thumbnail: string | null;
    description?: string | null;
}

export const BookStatus = {
    Planned: 'planned',
    Reading: 'reading',
    Completed: 'completed',
    Dropped: 'dropped'
} as const;

export type BookStatus = typeof BookStatus[keyof typeof BookStatus];

export interface Book {
    id: string; // UserBook ID
    status: BookStatus;
    rating?: number;
    notes?: string;
    quotes?: string[];
    tags?: string[];
    startedAt?: Date;
    finishedAt?: Date;
    currentPage?: number;
    bookId: { // populated ExternalBookId
        _id: string;
        sourceId: string;
        title: string;
        authors?: string[];
        thumbnail?: string;
    };
}

export interface CabinetSection {
    title: string;
    count: number;
    books: Book[];
    isOpen: boolean;
    type: BookStatus;
}

export interface BookFilters {
    status?: string;
    rating?: number;
    tags?: string[];
    page?: number;
    limit?: number;
}

  export interface PaginatedBooksResponse {
    books: Book[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    countsByStatus: {
      reading: number;
      planned: number;
      completed: number;
      dropped: number;
    };
  }

export interface ManualBookModalData {
  book?: SearchBook;
  isCustom?: boolean;
}
