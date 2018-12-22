window.Util = (function () {

    // 引入jquery
    document.write('<script src = "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>');
    document.write('<script src = "https://cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>');

    var postJson = function (url, data, callback, async, showLoading) {
        var asyncFlag = true;
        if (async != undefined) {
            asyncFlag = async;
        }

        var showLoadingFlag = true;
        if (showLoading != undefined) {
            showLoadingFlag = showLoading;
        }

        try {
            if (showLoadingFlag) {
                $('#loading').modal('show');
            }
        } catch (e) {

        }

        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            headers: {
                "Content-Type": "application/json"
            },
            async: asyncFlag,
            timeout: 30000,
            success: function (response) {
                try {
                    $('#loading').modal('hide');
                } catch (e) {

                }
                console.log('get resopnse sucess, ', response);
                callback(response);
            },
            error: function (e) {
                try {
                    $('#loading').modal('hide');
                } catch (e) {

                }
                console.error('ajax post error, ', e);
                alert('出错了[status=' + e.status + ', statusText=' + e.statusText + ']')
            }
        });
    };

    var getUserInfo = function getUserInfo() {
        var userInfo;
        var userInfo_cookie = $.cookie("userInfo");
        if (userInfo_cookie) {
            userInfo = JSON.parse(userInfo_cookie);
            console.log('get userinfo from cookie is exist, ', userInfo);
        }
        return userInfo;
    }

    var browser = {
        versions: function () {
            var u = window.navigator.userAgent;
            return {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者安卓QQ浏览器
                iPad: u.indexOf('iPad') > -1, //是否为iPad
                webApp: u.indexOf('Safari') == -1,//是否为web应用程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') == -1 //是否为微信浏览器
            };
        }()
    }

    return {
        postJson: postJson,
        getUserInfo: getUserInfo,
        browser: browser
    }
})();