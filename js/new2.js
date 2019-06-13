Util.statistics('index');
var userInfo = Util.getUserInfo();

var url = document.location.toString();
var splitUrl = url.split('/');
var imgurl = splitUrl[0] + "//" + splitUrl[2].split(':')[0] + '/';

var form, searchEngines;
layui.use(['form'], function () {
    form = layui.form;

    form.on('select(suggest)', function (data) {
        $('#search_input').val(data.value);
    });

    form.on('submit(form-submit)', function (data) {
        console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
        console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
        console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}
        if (!searchEngines) {
            searchEngines = 'https://www.baidu.com/s?wd='; // 默认搜索引擎设置为baidu
        }
        window.open(searchEngines + data.field.search_input);
        $("#search_input").val("");

        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });

});

$('#search_input').on('input', function () {
    var $input = $(this);
    var seTag = $('<select name="suggest" lay-filter="suggest"></select>');
    $.ajax({
        // url: 'http://suggestion.baidu.com/su?wd=' + $input.val(),
        url: './suggest?wd=' + $input.val(),
        dataType: 'jsonp',
        jsonp: 'cb', //回调函数的参数名(键值)key
        success: function (data) {
            $('select[name=suggest]').remove();
            $('.layui-form-select').remove();

            if (data.s.length == 0) {
                return;
            }
            $.each(data.s, function (i, v) {
                if (i == 5) {
                    return false;
                }
                seTag.append('<option><a class="sugurl" href="javascript:void(0);">' + v + '</a></option>');
            });
            $('#search_input').after(seTag);
            // 重新渲染 select
            form.render('select', 'search');

            $('.layui-select-title').remove();
            $('.layui-form-select').addClass('layui-form-selected');
            $('.layui-form-select dl').css('top', '0px').removeClass('layui-anim');
            $('.layui-form-select dl dd').removeClass('layui-this');
        },
        error: function () {
        }
    });
});


$(document).keydown(function (event) {
    // console.log(event.keyCode);
    if (event.keyCode == 38) { // 上
        var isThis = false;
        $.each($('.layui-form-select dl dd'), function (i, e) {
            if ($(e).hasClass('layui-this')) {
                $(e).removeClass('layui-this');
                if ($(e).prev('dd').length > 0) {
                    $(e).prev('dd').addClass('layui-this');
                } else {
                    $(e).parent('dl').children('dd:eq(4)').addClass('layui-this');
                }
                isThis = true;
                return false;
            }
        });
        if (!isThis) {
            $('.layui-form-select dl dd:eq(0)').addClass('layui-this');
        }
        return;
    }
    if (event.keyCode == 40) { // 下
        var isThis = false;
        $.each($('.layui-form-select dl dd'), function (i, e) {
            if ($(e).hasClass('layui-this')) {
                $(e).removeClass('layui-this');
                if ($(e).next('dd').length > 0) {
                    $(e).next('dd').addClass('layui-this');
                } else {
                    $(e).parent('dl').children('dd:eq(0)').addClass('layui-this');
                }
                isThis = true;
                return false;
            }
        });
        if (!isThis) {
            $('.layui-form-select dl dd:eq(0)').addClass('layui-this');
        }
        return;
    }

    if (event.keyCode == 13) { // 回车
        var isThis = false;
        $.each($('.layui-form-select dl dd'), function (i, e) {
            if ($(e).hasClass('layui-this')) {
                $('#search_input').val($(e).html());
                $('.layui-form-select').remove();
                isThis = true;
                return false;
            }
        });
        if (!isThis) {
            // 搜索
            $('button[lay-submit]').click();
        }
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
                            $('#search_input').attr('placeholder', '✎...  ' + content + '～');
                            // document.title = content;
                        }
                    }
                });
            } else {
                $('#search_input').attr('placeholder', '');
            }

            var logoShow = config.logoShow;
            if (logoShow) {
                var logoImgUrl = config.logoImgUrl;
                if (logoImgUrl) {
                    logoImgUrl = imgurl + 'imgproxy/' + logoImgUrl.split("/")[5];
                    $(".smaller").attr('src', logoImgUrl);
                }
            }

            searchEngines = config.searchEngines;

            var backgroundImgShow = config.backgroundImgShow;
            if (backgroundImgShow) {
                var backgroundImgUrl = config.backgroundImgUrl;
                if (backgroundImgUrl) {
                    backgroundImgUrl = imgurl + 'imgproxy/' + backgroundImgUrl.split("/")[5];
                    $('body').css("background-image", "url('" + backgroundImgUrl + "')");
                }
            }
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
    if (userInfo) {
        getIndex();
        getConfig();
    }
});