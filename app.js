var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var mongoose = require('mongoose');

// connect to db
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', function (err) {
    console.error(err);
});

db.once('open', function () {
    console.log('Connected to MongoDB...');
});

// init app
var app = express();

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
app.get('/', function (req, res) {
    Article.find({}, function (err, articles) {
        if (err) {
            console.error(err);
        } else {
            res.render('index',
                {
                    title: 'Articles',
                    articles: articles
                });
        }
    })
});

app.get('/test', function (req, res) {
    res.render('test', { title: 'Test' })
});

app.get('/articles/add', function (req, res) {
    res.render('articles_add', { title: 'New Article' });
});

app.post('/articles/add', function (req, res) {
    var article = new Article();

    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function (err) {
        if (err) {
            console.error(err);
        } else {
            res.redirect('/');
        }
    });
});

app.get('/articles/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (err) {
            console.error(err);
        } else {
            res.render('articles',
                {
                    title: 'Articles',
                    article: article
                });
        }
    })
});

app.get('/articles/:id/edit', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
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

app.post('/articles/:id/edit', function (req, res) {
    if (req.params.id != req.body.id) {
        console.error('Id missmatch');
    } else {
        Article.findById(req.params.id, function (err, article) {
            if (err) {
                console.error(err);
            } else {
                article.title = req.body.title || article.title;
                article.author = req.body.author || article.author;
                article.body = req.body.body || article.body;

                article.save(function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(article._id + ' was updated.');
                        res.redirect('/articles/' + article.id);
                    }
                });
            }
        })
    }
});

app.get('/articles/:id/remove', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
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

app.post('/articles/:id/remove', function (req, res) {
    if (req.params.id != req.body.id) {
        console.error('Id missmatch');
    } else {
        Article.findByIdAndRemove(req.params.id, function (err, article) {
            if (err) {
                console.error(err);
            } else {
                console.log(article._id + ' was removed.');
                res.redirect('/');
            }
        })
    }
});

// start server
app.listen(3000, function () {
    console.log('Server started on port 3000...');
});