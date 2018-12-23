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

$(function () {
    if (userInfo) {
        getIndex();
    }
});