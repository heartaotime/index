var userInfo = Util.getUserInfo();
var searchEngines;

function search() {
    if ($("#search_input").val() != "") {
        // window.location.href = "https://www.baidu.com/s?word=" + document.getElementById("search_input").value;
        if(!searchEngines) {
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
                $('.weather').show();
            } else {
                $('.weather').hide();
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

            searchEngines = config.searchEngines;

        }
    });
}

// $('.search').on('change', function () {
//     $(this).val('');
// });

$(function () {
    if (userInfo) {
        getIndex();
        getConfig();
    }
});