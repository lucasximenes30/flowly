const fetch = require('node-fetch');

async function testWebhook() {
  const payload = {
    event: 'payment.approved',
    status: 'approved',
    customer: { email: 'test@example.com', name: 'Test User' },
    id: 'tx_123456',
    metadata: { userId: '123' },
    secret: 'bf0b31ef-556e-4d67-9c06-f86998642da9'
  };

  const res = await fetch('http://localhost:3000/api/webhooks/blackpayments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  console.log(res.status, await res.text());
}

testWebhook();
