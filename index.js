
const path = require('path')
const express = require('express')
const ejsMate = require('ejs-mate')
const https = require('https')
const fs = require('fs')
const { default: axios } = require('axios')
const openBrowser = require('react-dev-utils/openBrowser')
const FormData = require('form-data')

const httpsOptions = {
    key: fs.readFileSync('./config/cert.key'),
    cert: fs. readFileSync('./config/cert.crt')
}

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/', (req, res) => {
    res.send("<script>window.close();</script>")
})


app.get('/insta/testuser/authenticate', (req, res) => {

    res.render('authenticate')
})

app.post('/insta/testuser/authenticate', async(req, res) => {

    const { client_id, redirect_uri, scope, response_type  } = req.body

    openBrowser(`https://api.instagram.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=${response_type}`)

    res.redirect('/closeWindow')
})


app.get('/InstaApi/Auth', async(req, res) => {

    try {
        const code = req.query.code
        console.log(code)

        const form = new FormData();
        form.append('client_id', process.env.CLIENT_ID);
        form.append('client_secret', process.env.CLIENT_SECRET);
        form.append('grant_type', 'authorization_code');
        form.append('redirect_uri', 'https://localhost:3000/InstaApi/Auth');
        form.append('code', code);
        
        const response = await axios.post(
          'https://api.instagram.com/oauth/access_token',
          form,
          {
            headers: {
              ...form.getHeaders()
            }
          }
        );
        
        // const { access_token, user_id } = response.data

        // console.log(response.data)

        const media = await axios.get(`https://graph.instagram.com/me/media?fields=caption,media_url,username,media_type&access_token=${access_token}`);  

        res.render('instapage', { medias: media.data.data })

    } catch (error) {
        console.log(error)
    }
    
})


https.createServer(httpsOptions, app).listen(3000, () => {
    console.log(`HTTPS server started on port 3000`);
  });