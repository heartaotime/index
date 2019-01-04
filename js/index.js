var userInfo = Util.getUserInfo();
var searchEngines;

var url = document.location.toString();
var imgurl = "http://" + url.split('/')[2].split(':')[0] + ':2000/';

function search() {
    if ($("#search_input").val() != "") {
        // window.location.href = "https://www.baidu.com/s?word=" + document.getElementById("search_input").value;
        if (!searchEngines) {
            searchEngines = 'https://www.baidu.com/s?wd='; // 默认搜索引擎设置为baidu
        }
        window.open(searchEngines + $("#search_input").val());
        // window.open("https://www.baidu.com/s?wd=" + $("#search_input").val());
        // window.open("http://www.google.com.hk/" + $("#search_input").val());
        // window.open("http://www.bing.com/search?q=" + $("#search_input").val());
        // window.open("http://www.bing.com/search?q=" + $("#search_input").val());
        // window.open("http://www.so.com/s?q=" + $("#search_input").val());
        // window.open("http://www.sogou.com/sogou?query=" + $("#search_input").val());
        $("#search_input").val("");
    }
    return false;
}


function getIndex() {
    var param = {
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/index", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }
        $.each(response.result, function (i, v) {
            $('#copy a').attr('href', v.menuUrl);
            $('#copy img').attr('src', v.menuImgUrl);
            $('#copy p:eq(1)').html(v.menuName);
            $('.boxs').append($('#copy').html());
        });
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
                if (weatherCity) {
                    //加载天气查询插件
                    AMap.plugin('AMap.Weather', function () {
                        //创建天气查询实例
                        var weather = new AMap.Weather();
                        //执行实时天气信息查询
                        weather.getForecast(weatherCity, function (err, data) {
                            console.log(err, data);
                            if (data && data.info == 'OK') {
                                var city = data.city;
                                var c = data.forecasts[0].nightTemp + '℃ ~ ' + data.forecasts[0].dayTemp + '℃';
                                var dayWeather = data.forecasts[0].dayWeather;
                                var html = '<span>' + city + ' ' + dayWeather + ' ' + c + '</span>';
                                $('.weather').append(html);
                            }
                        });
                    });
                }

                // Util.getWeather(function (res) {
                //     if (res && res.status == 1000) {
                //         var data = res.data;
                //         var city = data.city;
                //         var c = data.forecast[0].low.split(' ')[1] + '~' + data.forecast[0].high.split(' ')[1];
                //         var type = data.forecast[0].type;
                //
                //         var html = '<span>' + city + ' ' + type + ' ' + c + '</span>';
                //         $('.weather').append(html);
                //     }
                // });

                // $('.weather').append('<iframe scrolling="no" src="https://tianqiapi.com/api.php?style=te&skin=cake"' +
                //     'frameborder="0" width="200" height="24" allowtransparency="true"></iframe>')
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
                            $('.search').attr('placeholder', '✎...  ' + content + '～');
                        }
                    }
                });
            } else {
                $('.search').attr('placeholder', '');
            }

            var logoShow = config.logoShow;
            if (logoShow) {
                $('.logo').attr('href', 'https://www.google.com');
                $(".smaller").attr('src', 'img/google.gif');
            }

            searchEngines = config.searchEngines;

            var backgroundImgShow = config.backgroundImgShow;
            if (backgroundImgShow) {
                var backgroundImgUrl = config.backgroundImgUrl;
                if (backgroundImgUrl) {
                    var url = imgurl + backgroundImgUrl.split("/")[5];
                    $('body').css("background-image", "url('" + url + "')");
                }
            }
        }
    });
}


$(function () {
    if (userInfo) {
        getIndex();
        getConfig();
    }


    // AMap.plugin('AMap.Geolocation', function () {
    //     var geolocation = new AMap.Geolocation({
    //         enableHighAccuracy: true,//是否使用高精度定位，默认:true
    //         timeout: 10000,          //超过10秒后停止定位，默认：5s
    //         buttonPosition: 'RB',    //定位按钮的停靠位置
    //         buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
    //         zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
    //     });
    //     geolocation.getCurrentPosition(function (status, result) {
    //         if (status == 'complete') {
    //             onComplete(result)
    //         } else {
    //             onError(result)
    //         }
    //     });
    // });
    //
    // //解析定位结果
    // function onComplete(data) {
    //     var str = [];
    //     str.push('定位结果：' + data.position);
    //     str.push('定位类别：' + data.location_type);
    //     if (data.accuracy) {
    //         str.push('精度：' + data.accuracy + ' 米');
    //     }//如为IP精确定位结果则没有精度信息
    //     str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
    //
    //     console.log(str);
    // }
    //
    // //解析定位错误信息
    // function onError(data) {
    //     console.log(data);
    // }


    //获取用户所在城市信息
    // function showCityInfo() {
    //     //实例化城市查询类
    //     var citysearch = new AMap.CitySearch();
    //     //自动获取用户IP，返回当前城市
    //     citysearch.getLocalCity(function (status, result) {
    //         if (status === 'complete' && result.info === 'OK') {
    //             if (result && result.city && result.bounds) {
    //                 var cityinfo = result.city;
    //                 var citybounds = result.bounds;
    //                 var str = '您当前所在城市：' + cityinfo;
    //                 console.log(str);
    //                 alert(str);
    //             }
    //         } else {
    //             alert(result.info);
    //         }
    //     });
    // }
    // showCityInfo();

    // if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
    //     navigator.geolocation.getCurrentPosition(function (position) {
    //         alert(1);
    //         console.log("Latitude: " + position.coords.latitude);
    //         console.log("Longitude: " + position.coords.longitude);
    //     }, function (error) {
    //         alert(error.message);
    //         console.log(error);
    //     }, {
    //         enableHighAccuracy: false,
    //         maximumAge: 30000,
    //         timeout: 20000
    //     });
    // } else {
    //     alert('当前浏览器不支持获取位置信息');
    // }

});