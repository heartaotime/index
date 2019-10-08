window.Util = (function () {

    // 引入jquery
    document.write('<script src = "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>');
    // document.write('<script src = "http://pv.sohu.com/cityjson?ie=utf-8"></script>');
    // document.write('<script src = "https://code.jquery.com/jquery-3.3.1.min.js"></script>');
    // document.write('<script src = "https://cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>');

    var postJson = function (url, data, callback, async, showLoading) {
        var asyncFlag = true;
        if (async != undefined) {
            asyncFlag = async;
        }

        var showLoadingFlag = true;
        if (showLoading != undefined) {
            showLoadingFlag = showLoading;
        }

        var index;

        try {
            if (showLoadingFlag) {
                try {
                    index = layer.load(1);
                } catch (e) {

                }
                try {
                    $('#loading').modal('show');
                } catch (e) {

                }
            }
        } catch (e) {

        }

        console.log('req url, ', url, '\nreq param, ', data);
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(data),
            // contentType: "application/x-www-form-urlencoded; charset=utf-8",
            // headers: {
            //     "Content-Type": "application/json"
            // },
            contentType: "application/json; charset=utf-8", // 默认值: "application/x-www-form-urlencoded"。发送信息至服务器时内容编码类型。
            //默认值适合大多数情况。如果你明确地传递了一个 content-type 给 $.ajax() 那么它必定会发送给服务器（即使没有数据要发送）
            async: asyncFlag,
            timeout: 30000,
            dataType: "json", // 预期服务器返回的数据类型。如果不指定，jQuery 将自动根据 HTTP 包 MIME 信息来智能判断，比如 XML MIME 类型就被识别为 XML
            success: function (response) {
                try {
                    layer.close(index);
                } catch (e) {

                }
                try {
                    $('#loading').modal('hide');
                } catch (e) {

                }
                console.log('get resopnse sucess, ', response);
                callback(response);
            },
            error: function (e) {
                try {
                    layer.close(index);
                } catch (e) {

                }
                try {
                    $('#loading').modal('hide');
                } catch (e) {

                }
                console.error('ajax post error, ', e);
                // alert('出错了[status=' + e.status + ', statusText=' + e.statusText + ']')
            }
        });
    };

    var setUserInfo = function (userInfo) {
        if (localStorage) {
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
        }
    }

    var getUserInfo = function () {
        // https://www.myindex.top?u=heartaotime&p=123
        var userName = getReqParam('u');
        var password = getReqParam('p');
        if (userName != null && userName != '' && password != null && password != '') {
            var param = {
                username: userName,
                password: password
            };
            Util.postJson("./common-server/user/api/v1/login", param, function (response) {
                if (response.code != 0) {
                    // alert('账号/密码错误');
                    return;
                }
                if (localStorage) {
                    localStorage.clear();
                }
                Util.setUserInfo(response.userInfo);
            }, false);
        }

        if (localStorage && localStorage.getItem("userInfo")) {
            console.log('get userinfo from localStorage is exist');
        } else {
            var param = {
                username: '访客',
                password: '1'
            };
            Util.postJson("./common-server/user/api/v1/login", param, function (response) {
                if (response.code != 0) {
                    // alert('账号/密码错误');
                    return;
                }
                if (localStorage) {
                    localStorage.clear();
                }
                Util.setUserInfo(response.userInfo);
            }, false);
        }

        return JSON.parse(localStorage.getItem("userInfo"));
    }

    var removeUserInfo = function () {
        if (localStorage) {
            localStorage.removeItem("userInfo");
        }
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

    var getUserIP = function (onNewIP) {
        try {
            //compatibility for firefox and chrome
            var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            var pc = new myPeerConnection({
                    iceServers: []
                }),
                noop = function () {
                },
                localIPs = {},
                ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
                key;

            function iterateIP(ip) {
                // 满足192.168.43.108这种格式的ip
                if (!localIPs[ip] && ip.split('.').length == 4) {
                    onNewIP(ip);
                }
                localIPs[ip] = true;
            }

            //create a bogus data channel
            pc.createDataChannel("");

            // create offer and set local description
            pc.createOffer().then(function (sdp) {
                sdp.sdp.split('\n').forEach(function (line) {
                    if (line.indexOf('candidate') < 0) return;
                    line.match(ipRegex).forEach(iterateIP);
                });

                pc.setLocalDescription(sdp, noop, noop);
            }).catch(function (reason) {
                // An error occurred, so handle the failure to connect
            });

            //sten for candidate events
            pc.onicecandidate = function (ice) {
                if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
                ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
            };
        } catch (e) {
            onNewIP('127.0.0.1'); // 获取ip失败
        }

    }

    var statistics = function (pageinfo) {
        var userInfo = getUserInfo();
        // var ip = returnCitySN["cip"];
        var ip = '127.0.0.1';
        var param = {
            userid: userInfo ? userInfo.id : -1,
            clientip: ip,
            pageinfo: pageinfo,
            remark: ''
        };
        // 统计信息
        Util.postJson("./common-server/user/api/v1/statistics", param, function (response) {
        }, true, false);
        // getUserIP(function (ip) {
        //     var param = {
        //         userid: userInfo ? userInfo.id : -1,
        //         clientip: ip,
        //         pageinfo: pageinfo,
        //         remark: ''
        //     };
        //     // 统计信息
        //     Util.postJson("./common-server/user/api/v1/statistics", param, function (response) {
        //     }, true, false);
        // });
    }

    var tips = function (content) {
        $('#tips .modal-body').html(content);
        $('#tips').modal('show');
    }

    var getCurSystem = function () {
        //平台、设备和操作系统
        var system = {
            win: false,
            mac: false,
            xll: false,
            ipad: false
        };
        //检测平台
        var p = navigator.platform;
        system.win = p.indexOf("Win") == 0;
        system.mac = p.indexOf("Mac") == 0;
        system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
        system.ipad = (navigator.userAgent.match(/iPad/i) != null) ? true : false;
        return system;
        // if (system.win || system.mac || system.xll || system.ipad) {
        //
        // } else {
        //     window.location.href = "http://www.jdpatro.com/3g/";
        // }
    }

    var getReqParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
        if (r != null) return unescape(r[2]);
        return null;
    }


    return {
        postJson: postJson,
        setUserInfo: setUserInfo,
        getUserInfo: getUserInfo,
        removeUserInfo: removeUserInfo,
        browser: browser,
        getUserIP: getUserIP,
        statistics: statistics,
        tips: tips,
        getCurSystem: getCurSystem,
        getReqParam: getReqParam
    }
})();