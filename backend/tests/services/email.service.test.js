describe('EmailService', () => {
    let emailService;
    let sendMailMock;

    beforeEach(() => {
        jest.resetModules();
        sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });
        
        jest.doMock('nodemailer', () => ({
            createTransport: jest.fn().mockReturnValue({
                sendMail: sendMailMock
            })
        }));
        
        emailService = require('../../src/shared/services/email.service');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendPasswordResetEmail', () => {
        it('should call sendMail with correct parameters', async () => {
            const to = 'user@example.com';
            const resetUrl = 'http://reset.url';

            await emailService.sendPasswordResetEmail(to, resetUrl);

            expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
                to,
                subject: 'Password Reset Request',
                html: expect.stringContaining(resetUrl)
            }));
        });

        it('should propagate error if sendMail fails', async () => {
            sendMailMock.mockRejectedValue(new Error('SMTP Error'));

            await expect(emailService.sendPasswordResetEmail('a@b.c', 'url'))
                .rejects.toThrow('SMTP Error');
        });
    });
});
