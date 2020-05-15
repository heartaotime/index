Util.statistics('index');
var userInfo = Util.getUserInfo();

var url = document.location.toString();
var splitUrl = url.split('/');
// var imgurl = splitUrl[0] + "//" + splitUrl[2].split(':')[0] + '/';

var searchEngineList, suggestSwitch, historySwitch, menuNameShow;
var clientWidth = document.body.clientWidth; // 网页可见区域宽

$('.form .formright').on('click', function () {
    var searchEngine = $('.formleft span').attr('url');
    if (!searchEngine) {
        searchEngine = 'https://www.baidu.com/s?wd='; // 默认搜索引擎设置为baidu
    }
    var searchKey = $('.form input').val();
    window.open(searchEngine + searchKey);
    setTimeout(function () {
        $(".form input").val("").blur();
    }, 1000);


    // 记录下搜索历史 只最新的5个
    if (localStorage) {
        var searchHistorys = localStorage.getItem("searchHistorys");
        if (!searchHistorys) {
            searchHistorys = JSON.stringify([]);
        }
        searchHistorys = JSON.parse(searchHistorys);
        var needAdd = true;
        $.each(searchHistorys, function (i, v) {
            if (searchKey == v) {
                needAdd = false;
                return false;
            }
        })
        if (needAdd) {
            searchHistorys.push(searchKey);
        }
        if (searchHistorys.length > 5) {
            searchHistorys.splice(-6, 1);
        }
        localStorage.setItem("searchHistorys", JSON.stringify(searchHistorys))
    }
})

function setSuggestHis() {
    if (historySwitch == undefined || !historySwitch) {
        return;
    }
    if (localStorage) {
        var searchHistorys = localStorage.getItem("searchHistorys");
        if (searchHistorys) {
            $.each(JSON.parse(searchHistorys).reverse(), function (i, v) {
                if (i == 5) {
                    return false;
                }
                $('.suggest').append('</i><a href="javascript:void(0);">' + v + '</a>');
            });
            $('.suggest').append('<span>清空历史</span>');
            $('.suggest').show();
        }
    }
}

var winHeight = $(window).height();   //获取当前页面高度
$(window).resize(function () {
    var thisHeight = $(this).height();
    if (winHeight - thisHeight > 50) {
        //当软键盘弹出，在这里面操作
    } else {
        //当软键盘收起，在此处操作
        $('.form input').blur();
    }
});

$('.form input').on('focus', function () {
    $('.searchEngines').fadeOut(500);
    // console.log('focus');
    var $input = $(this);
    if ($input.val() == '') {
        $('.suggest').empty().hide();
        setSuggestHis();
    }
}).on('blur', function () {
    // console.log('blur');
    setTimeout(function () {
        $('.suggest').empty().hide();
    }, 200);
}).on('input', function () {
    // console.log('input');
    var $input = $(this);
    $('.suggest').empty().hide();
    if ($input.val() == '') {
        setSuggestHis();
        return;
    }

    if (suggestSwitch == undefined || !suggestSwitch) {
        return;
    }

    $.ajax({
        // url: 'http://suggestion.baidu.com/su?wd=' + $input.val(),
        url: './suggest?wd=' + $input.val(),
        dataType: 'jsonp',
        jsonp: 'cb', //回调函数的参数名(键值)key
        success: function (data) {
            $('.suggest').empty().hide();
            if (data.s.length == 0) {
                return;
            }
            $.each(data.s, function (i, v) {
                if (i == 5) {
                    return false;
                }
                $('.suggest').append('<a href="javascript:void(0);">' + v + '</a>');
            });
            $('.suggest').fadeIn(500);
        },
        error: function () {
        }
    });
});

$('.suggest').on('click', 'a', function () {
    $('.form input').val($(this).html());
    $('.suggest').empty().fadeOut(500);
}).on('click', 'span', function () {
    if (localStorage) {
        localStorage.removeItem("searchHistorys");
    }
    $('.suggest').empty().fadeOut(500);
}).on('mouseover', 'a', function () {
    $('.suggest a').css('background-color', '');
    $(this).css('background-color', 'rgb(95, 184, 120)');
}).on('mouseout', 'a', function () {
    $('.suggest a').css('background-color', '');
});

$('.searchEngines').on('click', 'a', function () {
    $('.formleft span').attr('url', $(this).attr('url')).html($(this).html());
    $('.searchEngines').hide();
}).on('mouseover', 'a', function () {
    $('.searchEngines a').css('background-color', '');
    $(this).css('background-color', 'rgb(95, 184, 120)');
}).on('mouseout', 'a', function () {
    $('.searchEngines a').css('background-color', '');
});

$('.formleft').on('click', function () {
    $('.suggest').empty().fadeOut(500);
    if ($('.searchEngines').css('display') == 'none') {
        $('.searchEngines').fadeIn(500);
    } else {
        $('.searchEngines').fadeOut(500);
    }

});


$(document).keydown(function (event) {
    // console.log(event.keyCode);
    if (event.keyCode == 38) { // 上
        var isThis = false;
        $.each($('.suggest a'), function (i, e) {
            if ($(e).css('background-color') == 'rgb(95, 184, 120)') {
                $(e).removeAttr('style');
                if ($(e).prev('a').length > 0) {
                    $(e).prev('a').css('background-color', 'rgb(95, 184, 120)');
                    isThis = true;
                }
                return false;
            }
        });
        if (!isThis) {
            $('.suggest a:last').css('background-color', 'rgb(95, 184, 120)');
        }
        return;
    }
    if (event.keyCode == 40) { // 下
        var isThis = false;
        $.each($('.suggest a'), function (i, e) {
            if ($(e).css('background-color') == 'rgb(95, 184, 120)') {
                $(e).removeAttr('style');
                if ($(e).next('a').length > 0) {
                    $(e).next().css('background-color', 'rgb(95, 184, 120)');
                    isThis = true;
                }
                return false;
            }
        });
        if (!isThis) {
            $('.suggest a:first').css('background-color', 'rgb(95, 184, 120)');
        }
        return;
    }

    if (event.keyCode == 13) { // 回车
        var isThis = false;
        $.each($('.suggest a'), function (i, e) {
            if ($(e).css('background-color') == 'rgb(95, 184, 120)') {
                $('.form input').val($(e).html());
                isThis = true;
                return false;
            }
        });
        if (!isThis) {
            // 搜索
            $('.form .formright').click();
        }
        $('.suggest').empty().hide();
    }

});


function getIndex() {
    var param = {
        userid: userInfo.id
    };

    var key = 'index_' + userInfo.id;
    var result;
    if (localStorage && localStorage.getItem(key)) {
        result = JSON.parse(localStorage.getItem(key));
        setIndexInfo(result);
    } else {
        Util.postJson("./common-server/user/api/v1/index", param, function (response) {
            if (response.code != 0) {
                alert(response.message);
                return;
            }
            result = response.result;
            setIndexInfo(result);
            if (localStorage && userInfo.id != -1) {
                localStorage.setItem(key, JSON.stringify(result));
            }
        });
    }

}

function setIndexInfo(result) {
    var html = '';
    $.each(result, function (i, v) {
        $('#copy a').attr('href', v.menuUrl);
        $('#copy img').attr('src', v.menuImgUrl);
        if (menuNameShow == undefined || menuNameShow == true) {
            $('#copy span').html(v.menuName);
        }
        html += $('#copy').html();
        // $('.boxs').append($('#copy').html());
    });

    $('.boxs').append(html).hide().fadeIn(1000);
    // .animate({'margin-top': '30px'}, 'slow');
}


function getConfig() {
    var param = {
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/getConfig", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }

        var result = response.result;
        if (result.length > 0) {
            var config = result[0].config;
            config = JSON.parse(config);

            var weatherSwitch = config.weatherSwitch;
            if (weatherSwitch) {

                var weatherCity = config.weatherCity;
                if (weatherCity && weatherCity.replace(/\s+/g, '') != '') {
                    setWeather(weatherCity);
                } else {
                    AMap.plugin('AMap.Geolocation', function () {
                        var geolocation = new AMap.Geolocation({
                            enableHighAccuracy: true,//是否使用高精度定位，默认:true
                            timeout: 10000,          //超过10秒后停止定位，默认：5s
                        });
                        geolocation.getCurrentPosition(function (status, result) {
                            if (status == 'complete') {
                                setWeather(result.addressComponent.city);
                            } else {
                                AMap.plugin('AMap.CitySearch', function () {
                                    var citySearch = new AMap.CitySearch()
                                    citySearch.getLocalCity(function (status, result) {
                                        if (status === 'complete' && result.info === 'OK') {
                                            // 查询成功，result即为当前所在城市信息
                                            setWeather(result.city);
                                        }
                                    })
                                });
                            }
                        });
                    });


                }
            }

            var searchInputShow = config.searchInputShow;
            if (searchInputShow) {
                $.ajax({
                    url: 'https://v2.jinrishici.com/one.json',
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (result, status) {
                        console.log(result);
                        if (result && result.status == 'success') {
                            var content = result.data.content.split('，')[0];
                            $('title').html('主页-' + content + '～');
                            // $(document).attr("title",'主页-' + content);
                            // $('.form input').attr('placeholder', '✎...  ' + content + '～');
                            // document.title = content;
                        }
                    }
                });
            } else {
                $('.form input').attr('placeholder', '');
            }

            menuNameShow = config.menuNameShow;


            var logoShow = config.logoShow;
            if (logoShow) {
                var logoImgUrl = config.logoImgUrl;
                if (logoImgUrl) {
                    logoImgUrl = Util.imgurl + Util.getFileName(logoImgUrl);
                    $(".logoimg img").attr('src', logoImgUrl).hide().fadeIn(1000);
                }
            }

            var searchEngineC = config.searchEngines;
            if (searchEngineC && searchEngineC != '') {
                for (var i = 0; i < searchEngineList.length; i++) {
                    var re = searchEngineList[i];
                    if (re.codeValue == searchEngineC) {
                        $('.formleft span').attr('url', re.codeValue).html(re.codeName);
                    }
                }
            }

            var autoChangeBgImgShow = config.autoChangeBgImgShow;
            if (autoChangeBgImgShow) {
                // 获取随机壁纸
                // var imageUrl = 'https://api.btstu.cn/sjbz/api.php?lx=fengjing';
                // var clientWidth = document.body.clientWidth; // 网页可见区域宽
                // if (clientWidth > 700) {
                //     imageUrl += '&method=pc';
                // } else {
                //     imageUrl += '&method=mobile';
                // }
                // var imageUrl = 'https://uploadbeta.com/api/pictures/random/?key=BingEverydayWallpaperPicture';
                // var imageUrl = 'https://bing.ioliu.cn/v1/rand?';
                // if (clientWidth > 700) {
                //     imageUrl += '&w=1920&h=1080';
                // } else {
                //     imageUrl += '&w=1080&h=2340';
                // }
                // // center no-repeat fixed
                // var imageUrl = 'https://api.imo6.cn/nice/api.php?type=pola';
                // $('body').css("background", "url('" + imageUrl + "') center no-repeat fixed ");
                // return;

                // 获取必应每日精选壁纸
                $.ajax({
                    // https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=1572487353393&pid=hp&video=0
                    url: './bingBgImg?format=js&idx=0&n=1&nc=' + new Date().getTime() + '&pid=hp&video=0',
                    type: "GET",
                    success: function (result, status) {
                        console.log(result);
                        if (result && result.images && result.images.length > 0) {
                            // 是否存在视频文件
                            // var vid = result.images[0].vid;
                            // if (vid && vid != '') {
                            //     // <video id="vid" onended="_w.VM &amp;&amp; VM.play();"
                            //     //     muted="muted" loop="loop" autobuffer="autobuffer"
                            //     //     preload="auto" oncontextmenu="return false" data-hasaudio="1"
                            //     //     src="//az29176.vo.msecnd.net/videocontent/VampireCastle_HP_FULL_1920x1080_HD_ZH-CN.mp4"
                            //     //     style="width: 1519px; height: 855px; top: -128px; left: 0px; opacity: 1; visibility: visible;"></video>
                            //     var html = '<video src="https://cn.bing.com//az29176.vo.msecnd.net/videocontent/VampireCastle_HP_FULL_1920x1080_HD_ZH-CN.mp4"></video>';
                            //     $('body').append(html);
                            // }
                            var imageUrl = result.images[0].url;
                            // $('body').css("background-image", "url('https://cn.bing.com/" + imageUrl + "')");
                            // center no-repeat fixed
                            $('body').css("background", "url('https://cn.bing.com/" + imageUrl + "') center no-repeat fixed");
                        }
                    }
                });
            } else {
                // var curSystem = Util.getCurSystem();
                var clientWidth = document.body.clientWidth; // 网页可见区域宽
                // if (curSystem.win || curSystem.mac || curSystem.xll || curSystem.ipad) {
                if (clientWidth > 700) {
                    var backgroundImgPcShow = config.backgroundImgPcShow;
                    if (backgroundImgPcShow) {
                        var backgroundImgUrlPc = config.backgroundImgUrlPc;
                        if (backgroundImgUrlPc) {
                            backgroundImgUrlPc = Util.imgurl + Util.getFileName(backgroundImgUrlPc);
                            $('body').css("background-image", "url('" + backgroundImgUrlPc + "')");
                        }
                    }
                } else {
                    var backgroundImgShow = config.backgroundImgShow;
                    if (backgroundImgShow) {
                        var backgroundImgUrl = config.backgroundImgUrl;
                        if (backgroundImgUrl) {
                            backgroundImgUrl = Util.imgurl + Util.getFileName(backgroundImgUrl);
                            $('body').css("background-image", "url('" + backgroundImgUrl + "')");
                        }
                    }
                }
                // var backgroundImgShow = config.backgroundImgShow;
                // if (backgroundImgShow) {
                //     var backgroundImgUrl = config.backgroundImgUrl;
                //     if (backgroundImgUrl) {
                //         backgroundImgUrl = imgurl + 'imgproxy/' + backgroundImgUrl.split("/")[5];
                //         // $('body').css("background-image", "url('" + backgroundImgUrl + "')");
                //         //
                //         // $('body').css("background", "url('" + backgroundImgUrl + "') center no-repeat fixed");
                //         // if (clientWidth > 700) {
                //         //     $('body').css("background", "url('" + backgroundImgUrl + "') center no-repeat fixed");
                //         // } else {
                //         //     // $('body').css("background-repeat", "no-repeat");
                //         //     // $('body').css("background-position", "center");
                //         //     // $('body').css("background-attachment", "fixed");
                //         //     $('body').css("background-image", "url('" + backgroundImgUrl + "')");
                //         // }
                //         // $('body').css("background", "url('" + backgroundImgUrl + "') cover no-repeat fixed");
                //         $('body').css("background-image", "url('" + backgroundImgUrl + "')");
                //         // $('body').css("background-size", "cover");
                //         // $('body').css("background-repeat", "no-repeat");
                //         // $('body').css("background-attachment", "fixed");
                //         // $('body').css("background-position", "center");
                //
                //     }
                // }
            }

            suggestSwitch = config.suggestSwitch;
            historySwitch = config.historySwitch;
        }
    }, false);
}


function setWeather(weatherCity) {
    //加载天气查询插件
    AMap.plugin('AMap.Weather', function () {
        //创建天气查询实例
        var weather = new AMap.Weather();
        //执行实时天气信息查询
        weather.getForecast(weatherCity, function (err, data) {
            // console.log(data);
            if (data && data.info == 'OK') {
                var city = data.city;
                var c = data.forecasts[0].nightTemp + '℃ ~ ' + data.forecasts[0].dayTemp + '℃';
                var dayWeather = data.forecasts[0].dayWeather;
                var html = city + ' ' + dayWeather + ' ' + c;
                if (clientWidth > 700) {
                    var date = new Date();
                    var time = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 ';
                    html = time + html;
                }
                $('.weather span').append(html);
            }
        });
    });
}

function defaultSet() {
    // 该用户 未注册，展示默认背景
    // 1.获取开关
    var defaultSwitch = Util.getStaticData('DEFAULT_SWITCH');
    if (defaultSwitch && defaultSwitch.length > 0 && defaultSwitch[0].codeValue == '1') {
        // 1. 设置默认的Logo
        var defaultLogoImg = Util.getStaticData('DEFAULT_LOGO_IMG');
        if (defaultLogoImg && defaultLogoImg.length > 0) {
            var logoImgUrlDe = defaultLogoImg[0].codeValue;
            logoImgUrlDe = Util.imgurl + Util.getFileName(logoImgUrlDe);
            $(".logoimg img").attr('src', logoImgUrlDe);
        }
        // 2. 设置默认展示的导航
        var defaultIndex = Util.getStaticData('DEFAULT_INDEX');
        var deReselt = [];
        if (defaultIndex && defaultIndex.length > 0) {
            for (var i = 0; i < defaultIndex.length; i++) {
                var deIndex = defaultIndex[i];
                deReselt.push({
                    "menuUrl": deIndex.codeValue,
                    "menuImgUrl": deIndex.bigData,
                    "menuName": deIndex.codeName,
                })
            }
            setIndexInfo(deReselt);
        }
        // 3.设置默认的背景图
        var defaultBgImgList = Util.getStaticData('DEFAULT_BG_IMG');
        var backgroundImgUrl = '';
        var backgroundImgUrlPc = '';
        if (defaultBgImgList && defaultBgImgList.length > 0) {
            for (var i = 0; i < defaultBgImgList.length; i++) {
                var ext1 = defaultBgImgList[i].ext1;
                var codeValue = defaultBgImgList[i].codeValue;
                if ('PHONE' == ext1) {
                    backgroundImgUrl = codeValue;
                }
                if ('PC' == ext1) {
                    backgroundImgUrlPc = codeValue;
                }
            }
        }

        var curSystem = Util.getCurSystem();
        if (curSystem.win || curSystem.mac || curSystem.xll || curSystem.ipad) {
            if (backgroundImgUrlPc != '') {
                backgroundImgUrlPc = Util.imgurl + Util.getFileName(backgroundImgUrlPc);
                $('body').css("background-image", "url('" + backgroundImgUrlPc + "')");
            }
        } else {
            if (backgroundImgUrl != '') {
                backgroundImgUrl = Util.imgurl + Util.getFileName(backgroundImgUrl);
                $('body').css("background-image", "url('" + backgroundImgUrl + "')");
            }
        }
    }
}


// mouseover与 mouseenter
// 不论鼠标指针穿过被选元素或其子元素，都会触发 mouseover 事件。
// 只有在鼠标指针穿过被选元素时，才会触发 mouseenter 事件。
// mouseout与 mouseleave
// 不论鼠标指针离开被选元素还是任何子元素，都会触发 mouseout 事件。
// 只有在鼠标指针离开被选元素时，才会触发 mouseleave 事件。
$('.sets').on('mouseleave', function () {
    if (clientWidth < 700) {
        return;
    }
    $('.sets a:eq(4)').children('i').attr('class', 'fa fa-angle-up');
    $('.sets a:lt(4)').fadeOut(500);
});
$('.sets a').on('mouseenter', function () {
    if (clientWidth < 700) {
        return;
    }
    // $('.sets').stop(true);
    var index = $('.sets a').index(this);
    if (index == 4) {
        $('.sets a:lt(4)').fadeIn(500);
        $(this).children('i').attr('class', 'fa fa-angle-down');
    }
}).on('click', function () {
    var index = $('.sets a').index(this);
    if (index == 4) {
        if ($(this).children('i').attr('class') == 'fa fa-angle-up') {
            // $('.sets .setting:lt(3)').show();
            $('.sets .setting:lt(4)').fadeIn(500);
            $(this).children('i').attr('class', 'fa fa-angle-down');
        } else {
            $(this).children('i').attr('class', 'fa fa-angle-up');
            $('.sets .setting:lt(4)').fadeOut(500);
        }
        return;
    }
    var code = '';
    if (index == 0) {
        code = 'modify';
    }
    if (index == 1) {
        code = 'add';
    }
    if (index == 2) {
        code = 'set';
    }
    if (index == 3) {
        code = 'login';
    }
    window.location.href = 'set.html?code=' + code;
});


$('.tips a').on('click', function () {
    $('.tips').parent('div').fadeOut(500);
    // 记录本次点击的时间 下次在1天后出现，保证一天只能出现一次
    if (localStorage) {
        localStorage.setItem("tipstime", new Date().getTime());
    }
});

// $(window).resize(function () {
//     $(".main").css({
//         position: "fixed",
//         left: ($(window).width() - $(".main").outerWidth()) / 2,
//         top: ($(window).height() - $(".main").outerHeight()) / 2 - 110
//     });
// });
// $(window).resize();

$(function () {

    $('.suggest').width($('.form').width());
    // grid-template-columns: 3fr 10fr 2fr;
    if (clientWidth < 700) {
        // $('.form').css('grid-template-columns', '30% 50% 20%');
        // $('.form').css('grid-template-columns', '3fr 4fr 2f');
    }

    searchEngineList = Util.getStaticData('SEARCH_ENGINES');

    for (var i = 0; i < searchEngineList.length; i++) {
        var re = searchEngineList[i];
        var html = '<a url="' + re.codeValue + '">' + re.codeName + '</a>';
        $('.searchEngines').append(html);
        if (i == 0) {
            $('.formleft span').attr('url', re.codeValue).html(re.codeName);
        }
    }

    if (userInfo == undefined) {
        if (localStorage) {
            var date = localStorage.getItem("tipstime");
            if (date && date != '') {
                var now = new Date();
                if (now.getTime() - date > 24 * 60 * 60 * 1000) { // 1天
                    $('.tips').parent('div').fadeIn(500);
                }
            } else {
                $('.tips').parent('div').fadeIn(500);
            }
        }

        userInfo = {
            id: -1
        }
    }

    getConfig();
    getIndex();

});