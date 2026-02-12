const twilio = require('twilio');

let client = null;

function getClient() {
    if (!client) {
        client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
    return client;
}

async function sendSMS(to, message) {
    try {
        // Check if Twilio credentials exist
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.log('📱 SMS would be sent:', to, message);
            return true; // Demo mode
        }
        
        const client = getClient();
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
        return true;
    } catch (error) {
        console.error('SMS error:', error);
        return false;
    }
}

module.exports = { sendSMS };
