const axios = require('axios');
const openLibraryService = require('../../src/shared/services/openLibrary.service');

jest.mock('axios');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

describe('OpenLibraryService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('search', () => {
        it('should return normalized books when API call is successful', async () => {
            const mockResponse = {
                data: {
                    docs: [
                        {
                            key: '/works/123',
                            title: 'OL Book',
                            author_name: ['Author B'],
                            cover_i: 456,
                            first_sentence: ['First sentence'],
                            number_of_pages_median: 200,
                            subject: ['Subject X']
                        }
                    ]
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            const result = await openLibraryService.search('query');

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: '/works/123',
                source: 'openlibrary',
                title: 'OL Book',
                authors: ['Author B'],
                thumbnail: 'https://covers.openlibrary.org/b/id/456-M.jpg',
                description: 'First sentence',
                pageCount: 200,
                categories: ['Subject X']
            });
        });

        it('should handle missing fields gracefully', async () => {
            axios.get.mockResolvedValue({ data: { docs: [{ key: 'k1' }] } });

            const result = await openLibraryService.search('q');

            expect(result[0].title).toBe('Unknown Title');
            expect(result[0].thumbnail).toBeNull();
        });

        it('should throw error if axios fails', async () => {
            axios.get.mockRejectedValue(new Error('Fail'));
            await expect(openLibraryService.search('q')).rejects.toThrow('Fail');
        });
    });
});
