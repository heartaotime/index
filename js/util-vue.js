window.Util = (function () {

    var postJson = function (url, data, callback, async) {
        console.log('req url, ', url, '\nreq param, ', data);
        axios.post(url, data).then(function (response) {
            console.log('get resopnse sucess, ', response.data);
            callback(response.data);
        }).catch(function (error) {
            console.error('axios post error, ', error);
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
            return JSON.parse(localStorage.getItem("userInfo"));
        }
        return;
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

    var getStaticData = function (codeType) {
        var param = {
            'codeType': codeType
        };
        var result = [];
        Util.postJson("./common-server/user/api/v1/getStaticData", param, function (response) {
            if (response.code != 0) {
                alert(response.message);
                return;
            }
            result = response.result;
        }, false);
        return result;
    }

    var getDefaultImg = function () {
        return "data:image/png;base64,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";
    }


    return {
        postJson: postJson,
        getDefaultImg: getDefaultImg,
        setUserInfo: setUserInfo,
        getUserInfo: getUserInfo,
        removeUserInfo: removeUserInfo,
        browser: browser,
        getUserIP: getUserIP,
        statistics: statistics,
        tips: tips,
        getCurSystem: getCurSystem,
        getReqParam: getReqParam,
        getStaticData: getStaticData
    }
})();