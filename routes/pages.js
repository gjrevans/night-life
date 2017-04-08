var PageRoutes = function(thing){};

PageRoutes.prototype.index = function(req, res) {
    res.render('index.html', {
        breadcrumbs: req.breadcrumbs(),
        page: {title: 'Page Title'}
    });
}

module.exports = PageRoutes;
