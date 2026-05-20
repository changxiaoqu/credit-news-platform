const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('OK - ' + new Date()));
app.get('/api/articles', (req, res) => res.json([{id:1,title:'test'}]));

app.listen(PORT, () => {
    console.log('Listen on', PORT);
});
