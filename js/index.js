var userInfo = Util.getUserInfo();

function search() {
    if ($("#search_input").val() != "") {
        // window.location.href = "https://www.baidu.com/s?word=" + document.getElementById("search_input").value;
        window.open("https://www.baidu.com/s?word=" + $("#search_input").val());
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
            var searchInputShow = config.searchInputShow;
            if (weatherSwitch) {
                $('.weather').show();
            } else {
                $('.weather').hide();
            }

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