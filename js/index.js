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
                Util.getWeather(function (res) {
                    if (res && res.status == 1000) {
                        var data = res.data;
                        var city = data.city;
                        var c = data.forecast[0].low.split(' ')[1] + '~' + data.forecast[0].high.split(' ')[1];
                        var type = data.forecast[0].type;

                        var html = '<span>' + city + ' ' + type + ' ' + c + '</span>';
                        $('.weather').append(html);
                    }
                });
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


    // if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
    //     navigator.geolocation.getCurrentPosition(function (position) {
    //         alert(1);
    //         // console.log("Latitude: " + position.coords.latitude);
    //         // console.log("Longitude: " + position.coords.longitude);
    //     }, function (error) {
    //         console.log(error);
    //     }, {
    //         enableHighAccuracy: true,
    //         maximumAge: 30000,
    //         timeout: 20000
    //     });
    // } else {
    //     alert('当前浏览器不支持获取位置信息');
    // }

});