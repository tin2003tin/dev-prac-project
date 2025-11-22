const logError = (error, req, context = '') => {
    console.error(`--- ${context} Error ---`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    if (req) {
        const safeBody = { ...req.body };
        if (safeBody.password) safeBody.password = '***';
        if (safeBody.token) safeBody.token = '***';
        if (safeBody.creditCard) safeBody.creditCard = '***';

        console.error('Request Info:', {
            method: req.method,
            url: req.originalUrl,
            query: req.query,
            params: req.params,
            body: safeBody
        });
    }

    console.error('----------------------');
};

module.exports = logError;
