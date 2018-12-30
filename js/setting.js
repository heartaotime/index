var rowid = -1;
var userInfo;

var result = [];
var menuname;
var menuurl;
var sort;

var url = document.location.toString();
var imgurl = "http://" + url.split('/')[2].split(':')[0] + ':2000/';

$(function () {
    userInfo = Util.getUserInfo();
    if (userInfo) {
        $('#loginText').html('当前登陆账号为：');
        $('a[data-target="#logindiv"]').html(userInfo.userName);
    }
});


$('#addIndex').on('click', function () {
    if (!userInfo) {
        alert('请先登陆');
        return;
    }
    reset();
});

$('#editIndex').on('click', function () {
    if (!userInfo) {
        alert('请先登陆');
        return;
    }
    reset();

    $('#confirm').html('修改').attr('btntype', '1');
    $('#delIndex').css('display', 'block');

    getIndex();
});

function reset() {
    $('#menuname').val('');
    $('#menuurl').val('');
    $('#menuimgurl').attr('src', 'data:image/png;base64,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');
    $('#sort').val('');
    $('#delIndex').css('display', 'none');

    if ($('#list').attr('class') == 'collapse show') {
        $('#list').attr('class', 'collapse');
    }

    $('#confirm').html('新增').attr('btntype', '0');

    rowid = -1;

    $('.config').hide();
    $('.index').show();
}


function getIndex() {
    $('#list ul').empty();
    var param = {
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/index", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }
        result = response.result;
        $.each(result, function (i, v) {
            var html =
                '<li class="list-inline-item">' +
                '<a href="javascript:void(0);" rowid="' + v.id + '">' + v.menuName + '</a>' +
                '</li>';
            $('#list ul').append(html);
        });
    });
}

$('#list').on('click', 'a[rowid]', function () {
    // $('#editIndex').trigger('click');

    rowid = $(this).attr('rowid');


    var res = {};
    $.each(result, function (i, v) {
        if (v.id == rowid) {
            res = v;
            return false;
        }
    });

    $('#menuname').val(res.menuName);
    $('#menuurl').val(res.menuUrl);
    $('#menuimgurl').attr('src', res.menuImgUrl);
    $('#sort').val(res.sort);

});

function check() {
    menuname = $('#menuname').val();
    if (menuname == "") {
        alert("请输入网址名称");
        return false;
    }

    menuurl = $('#menuurl').val();
    if (menuurl == "") {
        alert("请输入网址链接");
        return false;
    }

    // menuimgurl = $('#menuimgurl').val();
    // if (menuimgurl == "") {
    //     alert("请选择网址对应图片");
    //     return false;
    // }

    sort = $('#sort').val();
    if (sort == "") {
        alert("请输入排序");
        return false;
    }

    return true;
}


$('#menuimg').on('change', function () {
    var reader = new FileReader();
    reader.readAsDataURL($('#menuimg')[0].files[0]);
    reader.onload = function (event) {
        $('#menuimgurl').attr('src', event.target.result);
    }
});

$('#backgroundimg').on('change', function () {
    var reader = new FileReader();
    reader.readAsDataURL($('#backgroundimg')[0].files[0]);
    reader.onload = function (event) {
        $('#backgroundimgurl').attr('src', event.target.result);
    }
});

function addIndex() {
    if (!check()) {
        return;
    }

    var param = {
        menuname: menuname,
        menuurl: menuurl,
        menuimgurl: $('#menuimgurl').attr('src'),
        sort: sort,
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/addIndex", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }
        alert("新增成功，返回到导航页刷新页面即可看到效果哦");
        reset();
    });


}

function editIndex() {
    if (rowid == -1) {
        alert('请选择一条记录修改');
        return;
    }

    if (!check()) {
        return;
    }

    var param = {
        rowid: rowid,
        menuname: menuname,
        menuurl: menuurl,
        menuimgurl: $('#menuimgurl').attr('src'),
        sort: sort,
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/editIndex", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }
        alert("修改成功，返回到导航页刷新页面即可看到效果哦");
        $('#editIndex').trigger('click');
    });
}

function delIndex() {
    if (rowid == -1) {
        alert('请选择一条记录删除');
        return;
    }

    if (confirm('确认删除吗？')) {
        var param = {
            rowid: rowid,
            userid: userInfo.id
        };
        Util.postJson("./common-server/user/api/v1/delIndex", param, function (response) {
            if (response.code != 0) {
                alert(response.message);
                return;
            }
            alert("删除成功");
            $('#editIndex').trigger('click');
        });
    }

}


$('#confirm').on('click', function () {
    var btntype = $(this).attr('btntype');
    if (btntype == 0) {
        addIndex();
    }
    if (btntype == 1) {
        editIndex();
    }
});

$('#delIndex').on('click', function () {
    delIndex();
});

$('#submit').on('click', function () {
    var username = $('#name').val();
    if (username == "") {
        alert("请填写用户名");
        return;
    }

    var password = $('#pwd').val();
    if (password === "") {
        alert("请填写密码");
        return;
    }

    var param = {
        username: username,
        password: password
    };
    Util.postJson("./common-server/user/api/v1/login", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }

        $('#logindiv').modal('hide');
        $('a[data-target="#logindiv"]').html(response.userInfo.userName);

        $('.login a:eq(0)').css('display', 'none');
        $('.login a:eq(1)').css('display', 'block');

        $('#loginname').html(response.userInfo.userName);

        userInfo = response.userInfo;

        // 设置cookie的有效期为10天
        $.cookie("userInfo", JSON.stringify(response.userInfo), {
            expires: 10
        });
    });
});


$("#config").on("click", function () {
    if (!userInfo) {
        alert('请先登陆');
        return;
    }

    $('.index').hide();
    $('.config').show();

    if ($('#list').attr('class') == 'collapse show') {
        $('#list').attr('class', 'collapse');
    }

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
                $("#weatherswitch").attr('checked', true);
            }
            $("#weatherswitch").bootstrapSwitch();

            var searchInputShow = config.searchInputShow;
            if (searchInputShow) {
                $("#searchinputshow").attr('checked', true);
            }
            $("#searchinputshow").bootstrapSwitch();

            var logoShow = config.logoShow;
            if (logoShow) {
                $("#logoshow").attr('checked', true);
            }
            $("#logoshow").bootstrapSwitch();

            var searchEngines = config.searchEngines;
            $('#searchengines').find('option[value="' + searchEngines + '"]').attr('selected', true);

            var backgroundImgShow = config.backgroundImgShow;
            if (backgroundImgShow) {
                $("#backgroundimgshow").attr('checked', true);
            }
            $("#backgroundimgshow").bootstrapSwitch();

            var backgroundImgUrl = config.backgroundImgUrl;
            if (backgroundImgUrl) {
                var url = imgurl + backgroundImgUrl.split("/")[5];
                // var reader = new FileReader();
                // reader.readAsDataURL(url);
                // reader.onload = function (event) {
                //     $('#backgroundimgurl').attr('src', event.target.result);
                // }
                $('#backgroundimgurl').attr('src', url);
            }
        }
    });

});

// $("#backgroundimgshow").on('click', function () {
//     if ($(this).is(":checked")) {
//         $("label[for=backgroundimg]").show();
//     } else {
//         $("label[for=backgroundimg]").hide();
//     }
// });

$("#editconfig").on("click", function () {
    var weatherswitch = $("#weatherswitch").is(':checked');
    var searchinputshow = $("#searchinputshow").is(':checked');
    var searchengines = $("#searchengines").val();

    var logoshow = $("#logoshow").is(':checked');

    var backgroundimgshow = $("#backgroundimgshow").is(':checked');
    var backgroundimgurl = $('#backgroundimgurl').attr('src');
    var param = {
        userid: userInfo.id,
        weatherSwitch: weatherswitch,
        searchInputShow: searchinputshow,
        searchEngines: searchengines,
        logoShow: logoshow,
        backgroundImgShow: backgroundimgshow,
        backgroundImgUrl: backgroundimgurl
    };
    Util.postJson("./common-server/user/api/v1/editConfig", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }
        alert("修改成功，返回到导航页刷新页面即可看到效果哦");
    });

});

