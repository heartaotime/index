Util.statistics('index');
var userInfo = Util.getUserInfo();

var url = document.location.toString();
var splitUrl = url.split('/');
var imgurl = splitUrl[0] + "//" + splitUrl[2].split(':')[0] + '/';

var searchEngines, suggestSwitch, historySwitch;

$('.form button').on('click', function () {
    if (!searchEngines) {
        searchEngines = 'https://www.baidu.com/s?wd='; // 默认搜索引擎设置为baidu
    }
    var searchKey = $('.form input').val();
    window.open(searchEngines + searchKey);
    $(".form input").val("").blur();

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
            $('.suggest').show();
        },
        error: function () {
        }
    });
});

$('.suggest').on('click', 'a', function () {
    $('.form input').val($(this).html());
    $('.suggest').empty().hide();
}).on('click', 'span', function () {
    if (localStorage) {
        localStorage.removeItem("searchHistorys");
    }
    $('.suggest').empty().hide();
}).on('mouseover', 'a', function () {
    $('.suggest a').css('background-color', '');
    $(this).css('background-color', 'rgb(95, 184, 120)');
}).on('mouseout', 'a', function () {
    $('.suggest a').css('background-color', '');
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
            $('.form button').click();
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
            if (localStorage) {
                localStorage.setItem(key, JSON.stringify(result));
            }
        });
    }

}

function setIndexInfo(result) {
    $.each(result, function (i, v) {
        $('#copy a').attr('href', v.menuUrl);
        $('#copy img').attr('src', v.menuImgUrl);
        $('#copy span').html(v.menuName);
        $('.boxs').append($('#copy').html());
    });
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
                            $('.form input').attr('placeholder', '✎...  ' + content + '～');
                            // document.title = content;
                        }
                    }
                });
            } else {
                $('.form input').attr('placeholder', '');
            }

            var logoShow = config.logoShow;
            if (logoShow) {
                var logoImgUrl = config.logoImgUrl;
                if (logoImgUrl) {
                    logoImgUrl = imgurl + 'imgproxy/' + logoImgUrl.split("/")[5];
                    $(".logoimg img").attr('src', logoImgUrl);
                }
            }

            searchEngines = config.searchEngines;

            var curSystem = Util.getCurSystem();
            if (curSystem.win || curSystem.mac || curSystem.xll || curSystem.ipad) {
                var backgroundImgPcShow = config.backgroundImgPcShow;
                if (backgroundImgPcShow) {
                    var backgroundImgUrlPc = config.backgroundImgUrlPc;
                    if (backgroundImgUrlPc) {
                        backgroundImgUrlPc = imgurl + 'imgproxy/' + backgroundImgUrlPc.split("/")[5];
                        $('body').css("background-image", "url('" + backgroundImgUrlPc + "')");
                    }
                }
            } else {
                var backgroundImgShow = config.backgroundImgShow;
                if (backgroundImgShow) {
                    var backgroundImgUrl = config.backgroundImgUrl;
                    if (backgroundImgUrl) {
                        backgroundImgUrl = imgurl + 'imgproxy/' + backgroundImgUrl.split("/")[5];
                        $('body').css("background-image", "url('" + backgroundImgUrl + "')");
                    }
                }
            }
            suggestSwitch = config.suggestSwitch;
            historySwitch = config.historySwitch;
        }
    });
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
                $('.weather span').append(html);
            }
        });
    });
}


$(function () {
    $('.suggest').width($('.form').width());
    if (userInfo) {
        getIndex();
        getConfig();
    }
});