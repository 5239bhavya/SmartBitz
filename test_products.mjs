import 'dotenv/config';

const url = 'http://127.0.0.1:54321/functions/v1/get-business-products';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ businessName: "AI Data Analytics Startup" })
})
    .then(res => res.json())
    .then(console.log)
    .catch(console.error);
