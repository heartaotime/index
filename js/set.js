var layer, element, form, upload, userInfo, rowid, searchEngineList;

var url = document.location.toString();
// var imgurl = "http://" + url.split('/')[2].split(':')[0] + ':2000/';

var splitUrl = url.split('/');
// var imgurl = splitUrl[0] + "//" + splitUrl[2].split(':')[0] + '/';
var imgurl = Util.imgurl;
var imgtempurl = Util.imgtempurl;


function init() {
    Util.statistics('setting');
    userInfo = Util.getUserInfo();
    if (userInfo) {
        // $('.layui-tab-title li:eq(3)').html(userInfo.userName);
    }
    if (!userInfo || userInfo.id == -1) {
        window.location.href = './user.html?code=login';
        return;
    }

    $('#menuimgurl-add').attr('src', Util.getDefaultImg());
    $('#menuimgurl-edit').attr('src', Util.getDefaultImg());

    searchEngineList = Util.getStaticData('SEARCH_ENGINES');
    for (var i = 0; i < searchEngineList.length; i++) {
        var re = searchEngineList[i];
        var html = '<option value="' + re.codeValue + '">' + re.codeName + '</option>';
        $('select[name=searchengines]').append(html);
    }
    form.render('select', 'config'); //刷新select选择框渲染

    // 默认选择标签
    var code = Util.getReqParam('code');
    if (code && code != null && code != '') {
        element.tabChange('tab', code);
    }

}

$(function () {

    layui.use(['layer', 'element', 'form', 'upload'], function () {
        layer = layui.layer;
        element = layui.element;
        form = layui.form;
        upload = layui.upload;

        element.on('tab(tab)', function (data) {
            var index = data.index;

            if (index == 0) {// 新增导航
                if (!userInfo) {
                    layer.msg('请先 登陆/注册');
                    return;
                }

                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }

            }

            if (index == 1) { // 修改导航
                refreshSelect(function () {
                    form.val("index-edit", {
                        "index": rowid
                    });
                });
            }
            if (index == 2) { // 全局配置
                getConfig();
            }
            if (index == 3) { // 登陆
                if (userInfo) {
                    // $(this).html(userInfo.userName);
                    // form.val('login', {
                    //     'username': userInfo.userName
                    // });
                    $('#userName').html(userInfo.userName);
                    var eMail = userInfo.eMail;
                    if(!eMail || eMail == null || eMail == '') {
                        eMail = '暂无 <a style="color: #009688; line-height: 30px;" href="./user.html?code=update">点此绑定邮箱</a>'
                    }
                    $('#eMail').html(eMail);
                }
            }
            if (index == 4) { // 登陆
                // window.location.href = 'https://www.myindex.top/';
                // window.location.href = splitUrl[0] + "//" + splitUrl[2].split(':')[0] + '/';
                window.location.href = './';
            }
        });

        init();

        form.on('submit(submit-add)', function (data) {
            if (!userInfo) {
                layer.msg("请先 登陆/注册");
                return;
            }

            if (userInfo.userName == '访客') {
                layer.msg("请先 登陆/注册，访客用户不可操作");
                return;
            }

            var field = data.field;
            var param = {
                menuname: field.menuname,
                menuurl: field.menuurl,
                menuimgurl: $('#menuimgurl-add').attr('src'),
                sort: field.sort,
                userid: userInfo.id
            };
            if (param.menuurl.indexOf('http') < 0) {
                layer.msg("网址链接必须存在 http ");
                return;
            }
            Util.postJson("./common-server/user/api/v1/addIndex", param, function (response) {
                if (response.code != 0) {
                    layer.msg(response.message);
                    return;
                }
                layer.msg("新增成功，返回到导航页刷新页面即可看到效果哦");
                if (localStorage) {
                    localStorage.removeItem('index_' + userInfo.id);
                }
                form.val("index-add", {
                    "menuname": "",
                    "menuurl": "",
                    "sort": ""
                });
                $('#menuimgurl-add').attr('src', Util.getDefaultImg());
            });
            return false;
        });

        form.on('submit(submit-login)', function (data) {
            var field = data.field;
            var param = {
                username: field.username,
                password: field.password
            };
            Util.postJson("./common-server/user/api/v1/login", param, function (response) {
                if (response.code != 0) {
                    // layer.msg(response.message);
                    layer.msg('密码错误，请重新输入');
                    form.val('login', {
                        'password': ''
                    });
                    return;
                }
                userInfo = response.userInfo;
                if (localStorage) {
                    localStorage.clear();
                }
                Util.setUserInfo(response.userInfo);
                // $('.layui-tab-title li:eq(3)').html(response.userInfo.userName);
                layer.msg("登陆成功[" + response.userInfo.userName + "]，正在重新载入...");

                setTimeout(function () {
                    window.history.go(0);
                }, 500)

            });
            return false;
        });

        form.on('submit(submit-modifyUser)', function (data) {
            var field = data.field;
            var param = {
                username: field.username,
                password: field.password,
                usernameNew: field.usernameNew,
                passwordNew: field.passwordNew
            };
            Util.postJson("./common-server/user/api/v1/modifyUser", param, function (response) {
                if (response.code != 0) {
                    layer.msg(response.message);
                    form.val('modifyUser', {
                        // 'username': '',
                        'password': '',
                        'usernameNew': '',
                        'passwordNew': ''
                    });
                    return;
                }
                userInfo = response.userInfo;
                if (localStorage) {
                    localStorage.clear();
                }
                Util.setUserInfo(response.userInfo);
                var msg = '新账号：' + response.userInfo.userName + '<br>新密码：' + response.userInfo.passWord;
                layer.alert(msg, {
                    title: '修改成功',
                    closeBtn: 0,
                    offset: '100px'
                }, function (index) {
                    window.location.reload();
                });


            });
            return false;
        });

        form.on('select(select-index)', function (data) {
            rowid = data.value;
            getIndexInfo(function (res) {
                var selected;
                $.each(res, function (i, v) {
                    if (v.id == data.value) {
                        selected = v;
                        return false;
                    }
                });
                form.val("index-edit", {
                    "rowid": selected.id,
                    "menuname": selected.menuName,
                    "menuurl": selected.menuUrl,
                    "sort": selected.sort
                });
                $('#menuimgurl-edit').attr('src', selected.menuImgUrl);
                $('[name^=btn-]').removeAttr('disabled').removeClass('layui-btn-disabled');
            });
        });

        form.on('submit(submit-edit)', function (data) {
            if (!userInfo) {
                layer.msg("请先 登陆/注册");
                return;
            }

            if (userInfo.userName == '访客') {
                layer.msg("请先 登陆/注册，访客用户不可操作");
                return;
            }

            if (!rowid) {
                layer.msg("请先选择要修改的导航");
                return;
            }


            var field = data.field;
            var param = {
                rowid: field.rowid,
                menuname: field.menuname,
                menuurl: field.menuurl,
                menuimgurl: $('#menuimgurl-edit').attr('src'),
                sort: field.sort,
                userid: userInfo.id
            };
            if (param.menuurl.indexOf('http') < 0) {
                layer.msg("网址链接必须存在 http ");
                return;
            }
            Util.postJson("./common-server/user/api/v1/editIndex", param, function (response) {
                if (response.code != 0) {
                    layer.msg(response.message);
                    return;
                }
                if (localStorage) {
                    localStorage.removeItem('index_' + userInfo.id);
                }
                refreshSelect(function () {
                    layer.msg('修改成功，返回到导航页刷新页面即可看到效果哦');
                    form.val("index-edit", {
                        "index": field.rowid
                    });
                });

            });
            return false;
        });


        form.on('submit(submit-config)', function (data) {
            if (!userInfo) {
                layer.msg("请先 登陆/注册");
                return;
            }

            if (userInfo.userName == '访客') {
                layer.msg("请先 登陆/注册，访客用户不可操作");
                return;
            }

            var field = data.field;
            if (field.logoshow == 'on' && ($('#logoimgurl').attr('realpath') == undefined || $('#logoimgurl').attr('realpath') == '')) {
                layer.msg("如果开关打开，请选择一张图片上传哦");
                return;
            }
            if (field.autochangebgimgshow != 'on' && field.backgroundimgshow == 'on' && ($('#backgroundimgurl').attr('realpath') == undefined || $('#backgroundimgurl').attr('realpath') == '')) {
                layer.msg("如果开关打开，请选择一张图片上传哦");
                return;
            }
            if (field.backgroundimgpcshow == 'on' && ($('#backgroundimgurlpc').attr('realpath') == undefined || $('#backgroundimgurlpc').attr('realpath') == '')) {
                layer.msg("如果开关打开，请选择一张图片上传哦");
                return;
            }
            var param = {
                userid: userInfo.id,
                weatherSwitch: field.weatherswitch == 'on' ? true : false,
                weatherCity: field.weathercity,
                searchInputShow: field.searchinputshow == 'on' ? true : false,
                menuNameShow: field.menunameshow == 'on' ? true : false,
                searchEngines: field.searchengines,
                logoShow: field.logoshow == 'on' ? true : false,
                suggestSwitch: field.suggestswitch == 'on' ? true : false,
                historySwitch: field.historyswitch == 'on' ? true : false,
                logoImgUrl: $('#logoimgurl').attr('realpath') == undefined ? "" : $('#logoimgurl').attr('realpath'),
                autoChangeBgImgShow: field.autochangebgimgshow == 'on' ? true : false,
                backgroundImgShow: field.backgroundimgshow == 'on' ? true : false,
                backgroundImgUrl: $('#backgroundimgurl').attr('realpath') == undefined ? "" : $('#backgroundimgurl').attr('realpath'),
                backgroundImgPcShow: field.backgroundimgpcshow == 'on' ? true : false,
                backgroundImgUrlPc: $('#backgroundimgurlpc').attr('realpath') == undefined ? "" : $('#backgroundimgurlpc').attr('realpath')
            }

            Util.postJson("./common-server/user/api/v1/editConfig", param, function (response) {
                if (response.code != 0) {
                    layer.msg(response.message);
                    return;
                }

                var result = response.result;
                if (result.length > 0) {
                    var config = result[0].config;
                    config = JSON.parse(config);

                    $('#logoimgurl').remove();
                    if (field.logoshow == 'on') {
                        var logoImgUrl = Util.imgurl + Util.getFileName(config.logoImgUrl);
                        $img = $('<img id="logoimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                        $img.attr('src', logoImgUrl).attr('realpath', config.logoImgUrl);
                        $('#logoimgupload').after($img);
                        $('#logoimgurldiv').show();
                    }

                    $('#backgroundimgurl').remove();
                    if (field.backgroundimgshow == 'on') {
                        var backgroundImgUrl = Util.imgurl + Util.getFileName(config.backgroundImgUrl);
                        $img = $('<img id="backgroundimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                        $img.attr('src', backgroundImgUrl).attr('realpath', config.backgroundImgUrl);
                        $('#backgroundimgupload').after($img);
                        $('#backgroundimgurldiv').show();
                    }

                    $('#backgroundimgurlpc').remove();
                    if (field.backgroundimgpcshow == 'on') {
                        var backgroundImgUrlPc = Util.imgurl + Util.getFileName(config.backgroundImgUrlPc);
                        $img = $('<img id="backgroundimgurlpc" style="width: 50px;height: 50px;margin-left: 5px;">');
                        $img.attr('src', backgroundImgUrlPc).attr('realpath', config.backgroundImgUrlPc);
                        $('#backgroundimguploadpc').after($img);
                        $('#backgroundimgurlpcdiv').show();
                    }
                    layer.msg("保存成功，返回到导航页刷新页面即可看到效果哦");
                }
            });
            return false;
        });

        form.on('switch(logoshow-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "logoshow": false
                    });
                    return;
                }

                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }

                $('#logoimgurldiv').show();
            } else {
                $('#logoimgurldiv').hide();
            }
        });

        form.on('switch(autochangebgimgshow-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "autochangebgimgshow": false
                    });
                    return;
                }

                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }

                $('#changeBg').hide();
            } else {
                $('#changeBg').show();
            }
        });

        form.on('switch(backgroundimg-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "backgroundimgshow": false
                    });
                    return;
                }

                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }

                $('#backgroundimgurldiv').show();
            } else {
                $('#backgroundimgurldiv').hide();
            }
        });

        form.on('switch(backgroundimgpc-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "backgroundimgpcshow": false
                    });
                    return;
                }
                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }
                $('#backgroundimgurlpcdiv').show();
            } else {
                $('#backgroundimgurlpcdiv').hide();
            }
        });

        form.on('switch(weatherswitch-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "weatherswitch": false
                    });
                    return;
                }
                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }
                $('#weathercitydiv').show();
            } else {
                $('#weathercitydiv').hide();
            }
        });

        form.on('switch(searchinput-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "searchinputshow": false
                    });
                    return;
                }
                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }
            }
        });

        form.on('switch(menunameshow-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "menunameshow": false
                    });
                    return;
                }
                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }
            }
        });

        form.on('switch(suggestswitch-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "suggestswitch": false
                    });
                    return;
                }
                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }
            }
        });

        form.on('switch(historyswitch-filter)', function (data) {
            if (data.elem.checked) {
                if (!userInfo) {
                    layer.msg("请先 登陆/注册");
                    form.val("config", {
                        "historyswitch": false
                    });
                    return;
                }
                if (userInfo.userName == '访客') {
                    layer.msg("请先 登陆/注册，访客用户不可操作");
                    return;
                }
            }
        });


        var logoimgupload;
        //执行实例
        upload.render({
            elem: '#logoimgupload', //绑定元素
            url: './common-server/user/api/v1/upload/', //上传接口
            acceptMime: 'image/*',
            data: {
                name: 'logoimg',
                userid: userInfo ? userInfo.id : "-1"
            },
            size: 20480, // 设置文件最大可允许上传的大小，单位 KB。不支持ie8/9
            before: function () {
                logoimgupload = layer.load(1);
                // layer.load(); //上传loading
            },
            done: function (res) {
                layer.close(logoimgupload);
                //上传完毕回调
                console.log(res);
                $('#logoimgurl').remove();
                var logoImgUrl = Util.imgtempurl + res.fileName;
                $img = $('<img id="logoimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', logoImgUrl).attr("realpath", res.path);
                $('#logoimgupload').after($img);
            },
            error: function () {
                //请求异常回调
                layer.close(logoimgupload);
            }
        });

        var backgroundimgupload;
        upload.render({
            elem: '#backgroundimgupload', //绑定元素
            url: './common-server/user/api/v1/upload/', //上传接口
            acceptMime: 'image/*',
            data: {
                name: 'bgimg',
                userid: userInfo ? userInfo.id : "-1"
            },
            size: 20480, // 设置文件最大可允许上传的大小，单位 KB。不支持ie8/9
            before: function () {
                backgroundimgupload = layer.load(1);
            },
            done: function (res) {
                layer.close(backgroundimgupload);
                //上传完毕回调
                console.log(res);
                $('#backgroundimgurl').remove();
                var backgroundImgUrl = Util.imgtempurl + res.fileName;
                $img = $('<img id="backgroundimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', backgroundImgUrl).attr("realpath", res.path);
                $('#backgroundimgupload').after($img);
            },
            error: function () {
                //请求异常回调
                layer.close(backgroundimgupload);
            }
        });
        var backgroundimguploadpc;
        upload.render({
            elem: '#backgroundimguploadpc', //绑定元素
            url: './common-server/user/api/v1/upload/', //上传接口
            acceptMime: 'image/*',
            data: {
                name: 'bgimgpc',
                userid: userInfo ? userInfo.id : "-1"
            },
            size: 20480, // 设置文件最大可允许上传的大小，单位 KB。不支持ie8/9
            before: function () {
                backgroundimguploadpc = layer.load(1);
            },
            done: function (res) {
                layer.close(backgroundimguploadpc);
                //上传完毕回调
                console.log(res);
                $('#backgroundimgurlpc').remove();
                var backgroundImgUrlPc = Util.imgtempurl + res.fileName;
                $img = $('<img id="backgroundimgurlpc" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', backgroundImgUrlPc).attr("realpath", res.path);
                $('#backgroundimguploadpc').after($img);
            },
            error: function () {
                //请求异常回调
                layer.close(backgroundimguploadpc);
            }
        });
    });
});


$('img').on('error', function () {
    $(this).attr('src', Util.getDefaultImg());
    layer.msg('获取网站图标失败');
});

$('#del').on('click', function () {
    if (!userInfo) {
        layer.msg("请先 登陆/注册");
        return;
    }

    if (userInfo.userName == '访客') {
        layer.msg("请先 登陆/注册，访客用户不可操作");
        return;
    }

    if (!rowid) {
        layer.msg("请先选择要删除的导航");
        return;
    }

    var selected;
    getIndexInfo(function (res) {
        $.each(res, function (i, v) {
            if (v.id == rowid) {
                selected = v;
                return false;
            }
        });
    });

    layer.confirm('确认删除[<span style="color: #FFB800;"> ' + selected.menuName + ' </span>]吗?', {
        icon: 3,
        title: '提示'
    }, function (index) {
        layer.close(index);

        var param = {
            rowid: rowid,
            userid: userInfo.id
        };
        Util.postJson("./common-server/user/api/v1/delIndex", param, function (response) {
            if (response.code != 0) {
                layer.msg(response.message);
                return;
            }
            if (localStorage) {
                localStorage.removeItem('index_' + userInfo.id);
            }
            refreshSelect(function () {
                rowid = undefined;
                layer.msg('删除[' + selected.menuName + ']成功，返回到导航页刷新页面即可看到效果哦');
                form.val("index-edit", {
                    "index": rowid,
                    "menuname": "",
                    "menuurl": "",
                    "sort": ""
                });
                $('#menuimgurl-edit').attr('src', Util.getDefaultImg());
                $('[name^=btn-]').attr('disabled', true).addClass('layui-btn-disabled');
            })
        });
    });
});

$('#logout, #userName').on('click', function () {
    if (!userInfo) {
        layer.msg('请先 登陆/注册');
        return;
    }

    if (userInfo.userName == '访客') {
        layer.msg("请先 登陆/注册，访客用户不可操作");
        return;
    }

    var html = '确认退出[<span style="color: #FFB800;"> ' + userInfo.userName + ' </span>]吗?';
    layer.confirm(html, {icon: 3, title: '提示'}, function (index) {
        if (localStorage) {
            localStorage.clear();
        }
        layer.msg('退出成功');
        history.go(0);
    });
});

function refreshSelect(callback) {
    getIndexInfo(function (data) {
        $('select[name=index]').empty();
        // var init = '<option value="-1">请选择</option>';
        // $('select[name=index]').append(init);
        $.each(data, function (i, v) {
            var html = '<option value="' + v.id + '">' + v.menuName + '</option>';
            $('select[name=index]').append(html);
        });
        form.render('select', 'index-edit');
        if (callback instanceof Function) {
            callback();
        }
    });
}


function getIndexInfo(callback) {
    if (!userInfo) {
        layer.msg('请先 登陆/注册');
        return;
    }

    var param = {
        userid: userInfo.id
    };
    var key = 'index_' + userInfo.id;
    var result;
    if (localStorage && localStorage.getItem(key)) {
        result = JSON.parse(localStorage.getItem(key));
        callback(result);
    } else {
        Util.postJson("./common-server/user/api/v1/index", param, function (response) {
            if (response.code != 0) {
                layer.msg(response.message);
                return;
            }
            result = response.result;
            callback(result);
            if (localStorage) {
                localStorage.setItem(key, JSON.stringify(result));
            }
        });
    }

}

function getBase64(url, callback, type) {
    //通过构造函数来创建的 img 实例，在赋予 src 值后就会立刻下载图片，
    // 相比 createElement() 创建 <img> 省去了 append()，也就避免了文档冗余和污染
    var Img = new Image(),
        dataURL = '';
    Img.src = url + '?v=' + Math.random();
    // Img.crossOrigin = '*';
    Img.crossOrigin = 'Anonymous';  // 这个也可以
    Img.onload = function () { //要先确保图片完整获取到，这是个异步事件
        try {
            var canvas = document.createElement("canvas"), //创建canvas元素
                width = Img.width, //确保canvas的尺寸和图片一样
                height = Img.height;
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(Img, 0, 0, width, height); //将图片绘制到canvas中
            // dataURL = canvas.toDataURL(type || 'image/jpeg'); //转换图片为dataURL
            dataURL = canvas.toDataURL(type || 'image/x-icon'); //转换图片为dataURL
        } catch (e) {
            console.error('获取网站 icon 失败');
        } finally {
            callback ? callback(dataURL) : null; //调用回调函数
        }
    };

}

$('[name=getIcon]').on('click', function () {
    var ele = '';
    var index = $('[name=getIcon]').index(this);
    if (index == 0) {
        ele = 'menuimgurl-add';
    } else {
        ele = 'menuimgurl-edit';
    }
    $('#' + ele).attr('src', Util.getDefaultImg());
    var urlTmp = $('[name=menuurl]:eq(' + index + ')').val();
    if (urlTmp == '' || urlTmp.indexOf('http') < 0) {
        layer.msg('请填写正确的网址后再获取图标');
        return;
    }
    var splitUrlTmp = urlTmp.split('/');
    var iconUrl = splitUrlTmp[0] + "//" + splitUrlTmp[2].split(':')[0] + '/' + 'favicon.ico';
    console.log(iconUrl);
    $('#' + ele).attr('src', iconUrl);
});

$('#menuimg-add').on('change', function () {
    var reader = new FileReader();
    reader.readAsDataURL($('#menuimg-add')[0].files[0]);
    reader.onload = function (event) {
        $('#menuimgurl-add').attr('src', event.target.result);
    }
});

$('#menuimg-edit').on('change', function () {
    var reader = new FileReader();
    reader.readAsDataURL($('#menuimg-edit')[0].files[0]);
    reader.onload = function (event) {
        $('#menuimgurl-edit').attr('src', event.target.result);
    }
});

$('#logoimg').on('change', function () {
    var reader = new FileReader();
    reader.readAsDataURL($('#logoimg')[0].files[0]);
    reader.onload = function (event) {
        $('#logoimgurl').attr('src', event.target.result);
    }
});

$('#backgroundimg').on('change', function () {
    var reader = new FileReader();
    reader.readAsDataURL($('#backgroundimg')[0].files[0]);
    reader.onload = function (event) {
        $('#backgroundimgurl').attr('src', event.target.result);
    }
});

$('#donate').on('click', function () {
    layer.open({
        title: '扫一扫',
        offset: '100px',
        // area: '280px',
        content: '<span style="margin-left: 30px;">支付宝</span><span style="margin-left: 80px">微信</span><br/>' +
            '<image src="./img/zfb.png" width="109px"/>' +
            '<image src="./img/wx.png" width="109px" style="margin-left: 2px;"/><br/><br/>' +
            '或复制支付宝账号：<br/>heartaotime@foxmail.com<br/>',
        // '目前已收到总计 7 笔，共 31.18 元',
        closeBtn: 0, // 不显示关闭按钮
        btn: ['关闭'],
        btnAlign: 'c',
        // yes: function (index, layero) {
        //     // layer.close(index); //如果设定了yes回调，需进行手工关闭
        //     // layer.title('打开微信扫一扫', index);
        //     return false;// 开启该代码可禁止点击该按钮关闭
        // }
    });
});

$('#readme').on('click', function () {
    var userName = "访客";
    var num = "~";
    var createTimeStr = "~";
    if (userInfo) {
        userName = userInfo.userName;
        num = userInfo.id;
        // createTimeStr = userInfo.createTimeStr;
        // 2018-12-14 14:12:09
        var createTime = new Date(userInfo.createTime);
        createTimeStr = createTime.getFullYear() + '年' + (createTime.getMonth() + 1) + '月' + createTime.getDate() + '日'

    }
    Util.postJson("./common-server/user/api/v1/getCount", {}, function (response) {
        layer.open({
            // title: '<img src="../img/readme.png" width="40px;"/> ' + userName + ' 你好',
            // title: '<i class="layui-icon layui-icon-face-smile-b" style="font-size: 20px; color: #009688;"></i>&nbsp;&nbsp;' + userName + ' 你好',
            title: '<i class="layui-icon layui-icon-face-smile-b" style="font-size: 20px; color: #009688;"></i>&nbsp;&nbsp;' + userName + ' 你好',
            offset: '100px',
            // area: '280px',
            content: '<blockquote class="layui-elem-quote">\n' +
                '        你是第 ' + num + ' 位注册用户<br>\n' +
                '        注册于 ' + createTimeStr + '<br>\n' +
                '        总注册人数 ' + response.userCountAll + '<br>\n' +
                '        今日注册人数 ' + response.userDayCountAll + '<br>\n' +
                '        总访问主页次数 ' + response.accessCountAll + '<br>\n' +
                '        今日访问主页次数 ' + response.accessDayCountAll + '<br>\n' +
                // '        友情链接 <a style="color: #009688;" target="_blank" href="http://igeeka.tk/">极咖网</a><br>\n' +
                '    </blockquote>',
            closeBtn: 0, // 不显示关闭按钮
            btn: ['关闭'],
            btnAlign: 'c',
        });
    });
});

$('#modifyUser').on('click', function () {
    if (!userInfo) {
        layer.msg('请先 登陆/注册');
        return
    }

    if (userInfo.userName == '访客') {
        layer.msg("请先 登陆/注册，访客用户不可操作");
        return;
    }

    form.val('modifyUser', {
        'username': userInfo.userName,
        'usernameNew': userInfo.userName
    });

    layer.open({
        title: '<i class="layui-icon layui-icon-face-smile-b" style="font-size: 20px; color: #009688;"></i>&nbsp;&nbsp;' + userInfo.userName + ' 你好',
        offset: '100px',
        type: 1,
        content: $('#modifyUserPage'),
        closeBtn: 0, // 不显示关闭按钮
        btnAlign: 'c',
        btn: ['确认', '关闭'],
        yes: function (index, layero) {
            $('[lay-filter=submit-modifyUser]').click();
        },
        btn1: function (index, layero) {

        }
    });
});


function getConfig() {
    $('#logoimgurldiv').hide();
    $('#backgroundimgurldiv').hide();
    $('#backgroundimgurlpcdiv').hide();
    $('#weathercitydiv').hide();


    if (!userInfo) {
        layer.msg('请先 登陆/注册');
        return;
    }

    var param = {
        userid: userInfo.id
    };
    Util.postJson("./common-server/user/api/v1/getConfig", param, function (response) {
        if (response.code != 0) {
            layer.msg(response.message);
            return;
        }

        var result = response.result;
        if (result.length > 0) {
            var config = result[0].config;
            config = JSON.parse(config);

            var res = {
                "searchengines": config.searchEngines,
                "logoshow": config.logoShow,
                "weatherswitch": config.weatherSwitch,
                "weathercity": config.weatherCity,
                "suggestswitch": config.suggestSwitch,
                "historyswitch": config.historySwitch,
                "searchinputshow": config.searchInputShow,
                "menunameshow": config.menuNameShow,
                "autochangebgimgshow": config.autoChangeBgImgShow,
                "backgroundimgshow": config.backgroundImgShow,
                "backgroundimgpcshow": config.backgroundImgPcShow
            }
            form.val("config", res);


            if (config.logoShow) {
                $('#logoimgurl').remove();
                var logoImgUrl = Util.imgurl + Util.getFileName(config.logoImgUrl);
                $img = $('<img id="logoimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', logoImgUrl).attr('realpath', config.logoImgUrl);
                $('#logoimgupload').after($img);
                $('#logoimgurldiv').show();
            }

            if (config.backgroundImgShow) {
                // 手机端背景
                $('#backgroundimgurl').remove();
                var backgroundImgUrl = Util.imgurl + Util.getFileName(config.backgroundImgUrl);
                $img = $('<img id="backgroundimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', backgroundImgUrl).attr('realpath', config.backgroundImgUrl);
                $('#backgroundimgupload').after($img);
                $('#backgroundimgurldiv').show();
            }

            if (config.backgroundImgPcShow) {
                // PC端背景
                $('#backgroundimgurlpc').remove();
                var backgroundImgUrlPc = Util.imgurl + Util.getFileName(config.backgroundImgUrlPc);
                $img = $('<img id="backgroundimgurlpc" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', backgroundImgUrlPc).attr('realpath', config.backgroundImgUrlPc);
                $('#backgroundimguploadpc').after($img);
                $('#backgroundimgurlpcdiv').show();
            }

            if (config.autoChangeBgImgShow) {
                $('#changeBg').hide();
            } else {
                $('#changeBg').show();
            }


            if (config.weatherSwitch) {
                $('#weathercitydiv').show();
            }
            // form.render('checkbox', 'config');
        }
    });

}


