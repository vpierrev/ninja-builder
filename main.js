const express = require('express');
const app = express();
const port = 8080;

app.use(express.static('static'));

app.get('/', (req, res) => {
    console.log('GET /');
    res.sendFile('views/index.html', { root: __dirname });
});

app.get('/offline', (req, res) => {
    console.log('GET /offline');
    res.sendFile('views/offline.html', { root: __dirname });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));