const express = require('express');
const { main_check, authorize_session, close_session} = require('./session');

const app = express();

app.use(express.json());

app.post('/session', async (req, res) => {
    let session = main_check(req.body.session);
    res.send(session);
    //let response = await authorize_session(session.url, session.data)
    //if (response.type == "success") {
    //    res.send(response.data);
    //}
});

app.post('/close_session', async (req, res) => {
    let session = main_check(req.body.session);
    let response =  await close_session(session.data);
    res.send(response.data);
});

app.listen(18, () => console.log('Server running or port 18'));
