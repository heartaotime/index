window.DataUtils = (function () {

    var setList = function () {
        return [
            {
                'title': '删除导航',
                'class': 'hide',
                'iClass': 'fa fa-trash',
                'href': 'set.html?code=modify'
            },
            {
                'title': '添加导航',
                'class': 'hide',
                'iClass': 'fa fa-plus',
                'href': 'set.html?code=add'
            },
            {
                'title': '导航设置',
                'class': 'hide',
                'iClass': 'fa fa-cog',
                'href': 'set.html?code=set'
            },
            {
                'title': '登陆/注册',
                'class': 'hide',
                'iClass': 'fa fa-user',
                'href': 'set.html?code=login'
            },
            {
                'title': '设置',
                'class': 'show',
                'iClass': 'fa fa-angle-up',
                'href': 'javascript:void(0);'
            }
        ];
    }

    var newsTab = function () {
        return [
            {
                'type': 'news_hot',
                'desc': '头条',
                'active': true,
                'iClass': 'fa fa-home'
            },
            {
                'type': 'news_military',
                'desc': '军事',
                'active': false,
                'iClass': 'fa fa-film'
            },
            {
                'type': 'news_tech',
                'desc': '科技',
                'active': false,
                'iClass': 'fa fa-film'
            },
            {
                'type': 'news_entertainment',
                'desc': '娱乐',
                'active': false,
                'iClass': 'fa fa-film'
            },
            {
                'type': 'news_sports',
                'desc': '体育',
                'active': false,
                'iClass': 'fa fa-film'
            }
        ]
    }


    return {
        setList: setList,
        newsTab: newsTab
    }
})();