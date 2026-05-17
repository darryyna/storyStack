const axios = require('axios');
const googleBooksService = require('../../src/shared/services/googleBooks.service');

jest.mock('axios');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

describe('GoogleBooksService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('search', () => {
        it('should return normalized books when API call is successful', async () => {
            const mockResponse = {
                data: {
                    items: [
                        {
                            id: '1',
                            volumeInfo: {
                                title: 'Test Book',
                                authors: ['Author A'],
                                imageLinks: { thumbnail: 'http://thumb.url' },
                                description: 'Description',
                                pageCount: 100,
                                categories: ['Category A']
                            }
                        }
                    ]
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            const result = await googleBooksService.search('test query');

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: '1',
                source: 'google',
                title: 'Test Book',
                authors: ['Author A'],
                thumbnail: 'http://thumb.url',
                description: 'Description',
                pageCount: 100,
                categories: ['Category A']
            });
            expect(axios.get).toHaveBeenCalledWith(undefined, {
                params: {
                    q: 'test query',
                    key: undefined
                }
            });
        });

        it('should return an empty array if no items are found', async () => {
            axios.get.mockResolvedValue({ data: {} });

            const result = await googleBooksService.search('unknown');

            expect(result).toEqual([]);
        });

        it('should throw an error if axios call fails', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));

            await expect(googleBooksService.search('test')).rejects.toThrow('Network Error');
        });
    });
});
