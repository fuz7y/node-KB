const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// connect to db
mongoose.connect('mongodb://localhost/test');

const db = mongoose.connection;

db.on('error', function (err) {
    console.error(err);
});

db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Setup middleware

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// setup body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create static folder
app.use(express.static(path.join(__dirname, 'static')));

//get model
var Article = require('./models/article');

// routes
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.error(err);
        } else {
            res.render('index',
                {
                    title: 'Home',
                    articles: articles
                });
        }
    })
});

app.get('/test', (req, res) => {
    res.render('test', { title: 'Test Page' })
});

app.get('/articles', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.error(err);
        } else {
            res.render('articles',
                {
                    title: 'Articles',
                    articles: articles
                });
        }
    })
});

app.get('/articles/add', (req, res) => {
    res.render('articles_add', { title: 'New Article' });
});

app.post('/articles/add', (req, res) => {
    var article = new Article();

    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save((err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('an article was created.');
            res.redirect('/');
        }
    });
});

app.get('/articles/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.error(err);
        } else {
            res.render('articles_details',
                {
                    title: 'Articles',
                    article: article
                });
        }
    })
});

app.get('/articles/:id/edit', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.error(err);
        } else {
            res.render('articles_edit',
                {
                    title: 'Articles',
                    article: article
                });
        }
    })
});

app.post('/articles/:id/edit', (req, res) => {
    if (req.params.id != req.body.id) {
        console.error('Id missmatch');
    } else {
        Article.findById(req.params.id, (err, article) => {
            if (err) {
                console.error(err);
            } else {
                article.title = req.body.title || article.title;
                article.author = req.body.author || article.author;
                article.body = req.body.body || article.body;

                article.save((err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('article ' + article.id + ' was updated.');
                        res.redirect('/articles/' + article.id);
                    }
                });
            }
        })
    }
});

app.get('/articles/:id/remove', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.error(err);
        } else {
            res.render('articles_remove',
                {
                    title: 'Remove Articles',
                    article: article
                });
        }
    })
});

app.post('/articles/:id/remove', (req, res) => {
    if (req.params.id != req.body.id) {
        console.error('Id missmatch');
    } else {
        Article.findByIdAndRemove(req.params.id, (err, article) => {
            if (err) {
                console.error(err);
            } else {
                console.log('article ' + article.id + ' was removed.');
                res.redirect('/');
            }
        })
    }
});

// start server
const port = 5001;

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});