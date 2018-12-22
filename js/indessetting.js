var rowid = -1;
var userInfo;
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
    clear();
    if ($('#list').attr('class') == 'collapse show') {
        $('#list').attr('class', 'collapse');
    }
    $('#confirm').html('新增').attr('btntype', '0');
});

$('#editIndex').on('click', function () {
    if (!userInfo) {
        alert('请先登陆');
        return;
    }
    clear();
    $('#confirm').html('修改').attr('btntype', '1');
    $('#delIndex').css('display', 'block');

    getIndex();
});

function clear() {
    $('#menuname').val('');
    $('#menuurl').val('');
    $('#menuimgurl').val('');
    $('#sort').val('');
    $('#delIndex').css('display', 'none');

    rowid = -1;
}

var result = [];

function getIndex() {
    if ($('#list').attr('class') == 'collapse') {
        $('#list').empty();
        var param = {
            userid: userInfo.id
        };
        Util.postJson("./proxyapi/douyu/api/v1/index", param, function (response) {
            if (response.code != 0) {
                alert(response.message);
                return;
            }

            result = response.result;
            $.each(result, function (i, v) {
                var html = '<a href="#" rowid="' + v.id + '" menuid="' + v.menuId + '">' + v.menuName + '</a>';
                $('#list').append(html + '&nbsp;&nbsp;&nbsp;');
            });

        });
    }
}

var menuname;
var menuurl;
var menuimgurl;
var sort;

function check() {
    menuname = $('#menuname').val();
    if (menuname == "") {
        alert("请输入网址名称");
        return false;
    }

    menuurl = $('#menuurl').val();
    if (menuurl == "") {
        alert("请填写URL");
        return false;
    }

    menuimgurl = $('#menuimgurl').val();
    if (menuimgurl == "") {
        alert("请填写网址图片URL");
        return false;
    }

    sort = $('#sort').val();
    if (sort == "") {
        alert("请填写排序");
        return false;
    }

    return true;
}

function addIndex() {
    if (!check()) {
        return;
    }


    var param = {
        menuname: menuname,
        menuurl: menuurl,
        menuimgurl: menuimgurl,
        sort: sort,
        userid: userInfo.id
    };
    Util.postJson("./proxyapi/douyu/api/v1/addIndex", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }

        alert("新增成功");
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
        menuimgurl: menuimgurl,
        sort: sort
    };
    Util.postJson("./proxyapi/douyu/api/v1/editIndex", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }
        alert("修改成功");
    });
}

function delIndex() {
    if (rowid == -1) {
        alert('请选择一条记录删除');
        return;
    }

    if (confirm('确认删除吗？')) {
        var param = {
            rowid: rowid
        };
        Util.postJson("./proxyapi/douyu/api/v1/delIndex", param, function (response) {
            if (response.code != 0) {
                alert(response.message);
                return;
            }
            alert("删除成功");
            $('#editIndex').trigger('click');
        });
    }

}


$('#list').on('click', 'a[menuid]', function () {
    $('#editIndex').trigger('click');


    var menuId = $(this).attr('menuid');
    rowid = $(this).attr('rowid');

    var res = {};
    $.each(result, function (i, v) {
        if (v.menuId == menuId) {
            res = v;
            return false;
        }
    });

    $('#menuname').val(res.menuName);
    $('#menuurl').val(res.menuUrl);
    $('#menuimgurl').val(res.menuImgUrl);
    $('#sort').val(res.sort);

});

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
    Util.postJson("./proxyapi/douyu/api/v1/login", param, function (response) {
        if (response.code != 0) {
            alert(response.message);
            return;
        }

        $('#logindiv').modal('hide');
        $('a[data-target="#logindiv"]').html(response.userInfo.userName);

        $('.login a:eq(0)').css('display', 'none');
        $('.login a:eq(1)').css('display', 'block');

        $('#loginname').html(response.userInfo.userName);

        // 设置cookie的有效期为10天
        $.cookie("userInfo", JSON.stringify(response.userInfo), {
            expires: 10
        });
    });
});