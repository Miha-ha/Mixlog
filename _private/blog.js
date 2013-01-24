var yml = require('js-yaml'),
    fs = require('fs'),
    underscore = require('underscore')._,
    wrench = require('wrench'),
    jade = require('jade'),
    moment = require('moment');

moment.lang('ru');

exports = module.exports = new Blog();
/**
 *
 * @constructor
 */
function Blog(){

}

/**
 * Инициализация блога
 */
Blog.prototype.init = function (){
    this.config = require('./config.yml');
    this.config.page = {};
    this.config.posts = [];
    this.config.tags = {};

    //config path layouts
    this.config.path.assets = __dirname + '/themes/' + this.config.theme + '/assets'
    this.config.path.templates = __dirname + '/themes/' + this.config.theme + '/templates';
};

/**
 * Генерация блога
 */
Blog.prototype.generate = function (){
    var config = this.config,
        postsDir = 'posts',
        files = fs.readdirSync(__dirname + '/' + postsDir);


    wrench.rmdirSyncRecursive(postsDir);
    wrench.mkdirSyncRecursive(postsDir, 0777);

    function replaceTemplate(str, template){
        return 'extends '+'../themes/'+config.theme+'/templates/'+template
    }

    for (var file in files) {
        if (!files.hasOwnProperty(file)) continue;
        //сбрасываю настройки предыдущей страницы
        config.page = {};

        var postName = files[file],
            path = __dirname + '/posts/' + postName,
            str = fs.readFileSync(path, 'utf8').replace(/^extends\s+(\w+)/g, replaceTemplate),
            fn = jade.compile(str, { filename: path, pretty: config.pretty }),
            html = fn(config),
            page = underscore.clone(config.page);

        page.uri = postsDir+'/'+this.escape(config.page.title)+ '.html';
        page.date = moment(config.page.date).format('DD MMMM YYYYг.');

        fs.writeFileSync(page.uri, html, 'UTF-8');

        config.posts.push(page);
        if (page.tags) {
            page.tags.forEach(function (tag){
                if(config.tags[tag]){
                    config.tags[tag].count++;
                    config.tags[tag].posts.push(page);
                }else{
                    config.tags[tag] = {
                        count: 1,
                        posts: [page]
                    }

                }
            });
        }
    }

    //delete config.page;
    config.page.title = '';
    //создаю index
    str = fs.readFileSync(config.path.templates+'/index.jade');
    html = jade.compile(str, { filename: config.path.templates+'/index.jade', pretty: config.pretty })(config);
    fs.writeFileSync('index.html', html, 'UTF-8');

    console.log(config);
};

Blog.prototype.copyAssets = function(){
    var srcPath = fs.realpathSync(this.config.path.assets),
        dstPath = fs.realpathSync(__dirname+'/..')+'/assets/';
//    wrench.rmdirRecursive(path, function(err){
//        //if(err) throw err;
//
//        wrench.copyDirRecursive(config.path.assets, path, function(err){
//            if(err) throw err;
//        });
//    });
    //TODO: разобраться с сиволическими ссылками
//    fs.link(srcPath, dstPath, function(err){
//        if(err) throw err;
//    });
};

Blog.prototype.escape = function(title){
    return title.replace(/[^A-Za-zА-Яа-я0-9]/, '_');
};

