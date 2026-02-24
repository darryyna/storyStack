export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: {
            thumbnail: string;
        };
    };
}

export const BookStatus = {
    Planned: 'planned',
    Reading: 'reading',
    Completed: 'completed',
    OnHold: 'onHold',
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
}
