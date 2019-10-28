var layer, element, form, upload, userInfo, rowid, searchEngineList;

var url = document.location.toString();
// var imgurl = "http://" + url.split('/')[2].split(':')[0] + ':2000/';

var splitUrl = url.split('/');
var imgurl = splitUrl[0] + "//" + splitUrl[2].split(':')[0] + '/';

$(function () {
    userInfo = Util.getUserInfo();
    if (userInfo) {
        $('.layui-tab-title li:eq(3)').html(userInfo.userName);
    }


});

function init() {
    Util.statistics('setting');
    searchEngineList = Util.getStaticData('SEARCH_ENGINES');
    for (var i = 0; i < searchEngineList.length; i++) {
        var re = searchEngineList[i];
        var html = '<option value="' + re.codeValue + '">' + re.codeName + '</option>';
        $('select[name=searchengines]').append(html);
    }
    form.render('select', 'config'); //刷新select选择框渲染
}

$(function () {
    layui.use(['layer', 'element', 'form', 'upload'], function () {
        layer = layui.layer;
        element = layui.element;
        form = layui.form;
        upload = layui.upload;

        init();

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
                    $(this).html(userInfo.userName);
                    form.val('login', {
                        'username': userInfo.userName
                    });
                }
            }
        });


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
                $('#menuimgurl-add').attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAANZklEQVR4Xu2dacyuxxjHf8cu2nPsoWKLL5ra1VaUhFCUxt5aEmLf9+0DEhq01L5HbKG2KKnaSUiEKqJB6gORiJ2irWNXleu4T/L2Oc/zvNcs9yz3/OfL+XCumbnmd83/fWbua+6596AiAiKwkcAesREBEdhMQALR7BCBLQQkEE0PEZBANAdEII6AfkHiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRkEDiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRkEDiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRkEDiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRiBXIWcBhcV2qlghUIbAfOD6051iBXAjsDe1M9iJQkYDN2auG9i+BhBKTfa8EJJBeIye/ixCQQIpgVie9EpBAeo2c/C5CQAIpglmd9EpAAuk1cvK7CAEJpAhmddIrAQmk18jJ7yIEJJAimNVJrwSKCuQCYJ+D1EXACQ47mYhALIEzgcMdlYsKxHvU5E/ANRzOy0QEYgnYHLuao7IE4oAkk+URkECWF1ONKCMBCSQjTDW1PAISyPJiqhFlJCCBZISpppZHQAJZXkw1oowEJJCMMNXU8ghIIMuLqUaUkYAEkhGmmloegSYF4j1q8kfgmsuLiUY0Ebg68BDg/sANp1MTRwB/A84HLP7nAWcAnwP+MQM568P82K0UzaRLILuFY9n/fyvglYHX6JhoPgS8DPhdRjwSSEaYaiqNwPWAU4FHJDRjvyKnASdn+kVpUiA6rJgwQzqtegxgJ2dzHT79/vQL9OtEHtqDJAJU9XQCjwY+mN7MIS38BjgO+EFC2/oFSYCnqukE7gF8CbhMelNrW/g9cHPA/o0pTf6CaIkVE8r+6lwf+KHz5biU0Z0NHAv8O6KRJgWip1gRkeywyjnA7Qr5bZv2l0b0pSVWBDRVSSdwEnB6ejPuFuzp1o0iHgE3+QuiJZY77l0aXh74yZT8KzmA9wKPC+xQAgkEJvN0Ag8FPp7eTHALF09Zcbvsw1skEC+pDHZvA54duVnM0H0zTdjSypZYNcojA5d2EkihKN0U+DHwLuDJhfpssZsrTOeoPFfpzOH/J4CHBTQsgQTASjG1IxQvmBp4DPCBlMY6rnsU8KOK/v982qx7XZBAvKQS7CwJ9lvgWlMb9jz+LoA95hyt3A34WsVBG/srApc4fZBAnKBSzO4LfHalgT8A9tfU/h2p2PF1W+bULNcJeNzbpECWlii0Jzb25Ga1WIb3TjVnSoW+bXn5vgr97uzSjp54l3lNCmRJeRD78qmdA7Jn/+uK7UVs0oxS7FPJn6k82OtOS16PGxKIh1KCzVMBe7y7rdhTLXu6NUK5DfC9igO1vcdle9+DLGmJ9W3g9o4JcWfgmw673k3sQUXsydocYw99iqWzWDmob2jjYO7D04Vt1m8J2DsMSy/2HvmRlQb5fuCxAX1riRUAK9R0Z+7DU9fegrvDAJn2VwEv8QCZweYBgXugJgWylCWWXR5w7cAgvwd4QmCd3sxvC3y3gtN/AfYG9qslViAwr/m63Ie37lOAd3qNO7X7InCvwr6/HHhFYJ9N/oIs4THvptyHJz4jZNotF3HujK/arnK2PZ69wfhPTwB22DQpkN6XWPbJLgObUuxiNLsf6lcpjTRe1x5tP7GQj3Z6+KMRfTUpkN5/QTy5D0+slr5ptzNR35kuVfDwiLWx5aotW2OKBBJDbZc6Od+1Xnqm/QaA/SHwXO8ZEyqLhR0MjbmwwfqTQGKob6kTkvvwdv004O1e4w7tjJld/WN7hJzlK8CDgZA3CFf7l0ByRmS6OvPgex+5mrZXRe3mwSUfj7cbFe1mRRtnjvIm4LnAfxMbk0ASAe6svvreR8amDxyLX3qm3c5IPR6wx7F2oDCmWH7l+cDXYyqvqdOkQHp9ipWS+/DE0w75He0x7NzmysAzgUcBN3OO5cuA3VoS86RqWxcSiDMAHrOPBb7v7Glz1Wbpm/bV8d4EeNC0P7FvwdhS7D/Te+32KNze8/8k8OcYmI46yqQ7IHlMdnvvw9OG1+YZwFu9xrJLItDkL0iPeRB7zl7qSdMIm/akWZ2xsgSSCab3vY9M3Q2xac/FKqUdCSSF3lR3jtyHxy1LsNk77aHnizxty+b/BCSQDDPhFOCFGdqJacIeDJwYU1F1XAQkEBemzUZz5j68rtkj0bd4jWUXREACCcJ1qPF9pk8QJzaTVN027XcHvpHUiiqvIyCBJM6LErkPj4sWSEuqjfBOu4dHLhsJJIFkydyHx01t2j2UwmwkkDBel7IumfvwuqlNu5eUz04C8XFaa1U69+F11b5BYqdZVdIJSCCRDGvlPjzuatPuoeSzkUB8nA6xqpn78LhsgbV32n/hMZbNRgISSMTkaCH34XHbbjC34/HKtHtorbeRQCLYtZD78LqtTbuXlASSRmpH7VZyH94B2aunb/Aay+5SBPQLEjghWst9eNxvZdNurwzbpyCOA/Z7HG/ARgIJDEKLuQ/PEGpv2u0lr9cB9pXbdwNP8jjdgI0EEhiEVnMfnmHU2LTvAz4M3G/FwXsCX/U4XdlGAgkIQMu5D+8wSm7abUlln1tbd9+VXalqPFtfakkg3pkFtJ778A7lecDrvcaRdpbNN162pNpU7G5e+/xcy0UCcUanl9yHZzh2mZp9r3yO4/GbllSb/LrrTH54OHhsJBAPpenJy+edtj2YzbFptw/jfCrwClH7ZqAd0291qSWBOGezXUj2cKdtL2a2abcPjP49g8OWa3nNls9db+si5fb1DK5vbUICcRDuMffhGNYBk08DD/Qar7GzJZV9LCj1a1GtLrUkEMfksI3kOxx2vZrYZduWowgtMUuqTX20utSSQByz4uzp67MO0y5NYjbtdkH0q4HLZRyxXbxnn3poqUggu0RjCbkPz4Tzbtrt83K2H0tdUm3yqbWllgSyy+yxjeeLPDNsATa7bdrvCJyR8GkCDyJbah2Z6cGBp7/dbCSQLYSWlPvYbSIc/P9Nm3b7I3Fy5iXVJp/sQOPTvQ7PbCeBbAFsp06XlPvwziW7JfK1k/HcS6rWl1oSyJZZs8Tch0cktmm3PcZfCyyptj3VamGp1aRAWvjClOU+5vooi2eS1raxD1/ureyEXadq16rWLPqAzgb6S8991Jx0IX3XfqrV5C9ICx/QWXruI2SS1rSt/VRLAlkT/VFyHzUnfkjfNZdaEsiaSI2U+wiZqLVsLwGOrXQsXgJZifqIuY9aEz+k31pLLQlkJUqj5j5CJmst2zcDzyrcuQSyAnzU3EfheRfVXY2llgSyI1RLfu8jakY2WKn0UksC2TEJlPtoUBFrXLJPO9ilECWKBLKD8rcAO7Gq0jYBW2pZnM4p4KYEMkG+MfCzAsDVRR4CPwVuUeBYvAQyxcvejntxntiplUIE3gg8Z+a+JBBgD/BL4IiZYav5vARKLLUkEODewBfyxk6tFSIw91JLAgE+ApxYKKDqJj8Bu0bVrlOdowwvkKsA5wNXmoOu2ixCYM6l1vACse9U2M1+Kn0TsKXWUcC/Mg9jeIEo95F5RlVs7jTA7uvKWYYWiHIfOadS/bbmWGoNLRDlPupP6twe5F5qDSsQ5T5yT8122rN7hu2+4RxlWIEo95Fj+rTZRs6l1rACUe6jzcmdy6tcS60hBaLcR65p2HY7djuk3RKZUoYUiHIfKVOmn7oXA8ckHosfUiDKffQzyVM9TV1qDScQ5T5Sp1x/9U9N+ITFcAJR7qO/CZ7qccpSayiBKPeROtX6rR+71BpKIMp99DvBc3h+SsRbo0MJ5HTgpByk1UaXBGypdTRwboD3wwhEuY+AWbFg0/OAWwccix9GIAuOuYY2IwEJZEa4arp/AhJI/zHUCGYkIIHMCFdN909AAuk/hhrBjAQkkBnhqun+CUgg/cdQI5iRgAQyI1w13T8BCaT/GGoEMxKQQGaEq6b7J9CkQC4A9jnYXgSc4LCTiQjEEjgTONxR+ULAPuEXVOx4eUyxzvbGVFQdEahEQAKpBF7d9kFAAukjTvKyEgEJpBJ4ddsHAQmkjzjJy0oEJJBK4NVtHwQkkD7iJC8rEZBAKoFXt30QkED6iJO8rERAAqkEXt32QaCoQM4CDuuDi7wUgQME9gPHh7KIPWoS2o/sRaBLAhJIl2GT06UISCClSKufLglIIF2GTU6XIiCBlCKtfrokIIF0GTY5XYqABFKKtPrpkoAE0mXY5HQpAhJIKdLqp0sCEkiXYZPTpQhIIKVIq58uCUggXYZNTpciIIGUIq1+uiQggXQZNjldioAEUoq0+umSgATSZdjkdCkCEkgp0uqnSwISSJdhk9OlCEggpUirny4JSCBdhk1OlyIggZQirX66JCCBdBk2OV2KgARSirT66ZKABNJl2OR0KQISSCnS6qdLAhJIl2GT06UISCClSKufLglIIF2GTU6XIiCBlCKtfrok8D9k9G72PfQcHAAAAABJRU5ErkJggg==');

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
                $('.layui-tab-title li:eq(3)').html(response.userInfo.userName);
                layer.msg("登陆成功[" + response.userInfo.userName + "]");

                // 更新修改导航页面
                rowid = undefined;
                form.val("index-edit", {
                    "index": rowid,
                    "menuname": "",
                    "menuurl": "",
                    "sort": ""
                });
                $('#menuimgurl-edit').attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAANZklEQVR4Xu2dacyuxxjHf8cu2nPsoWKLL5ra1VaUhFCUxt5aEmLf9+0DEhq01L5HbKG2KKnaSUiEKqJB6gORiJ2irWNXleu4T/L2Oc/zvNcs9yz3/OfL+XCumbnmd83/fWbua+6596AiAiKwkcAesREBEdhMQALR7BCBLQQkEE0PEZBANAdEII6AfkHiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRkEDiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRkEDiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRkEDiuKnWIAQkkEECrWHGEZBA4rip1iAEJJBBAq1hxhGQQOK4qdYgBCSQQQKtYcYRiBXIWcBhcV2qlghUIbAfOD6051iBXAjsDe1M9iJQkYDN2auG9i+BhBKTfa8EJJBeIye/ixCQQIpgVie9EpBAeo2c/C5CQAIpglmd9EpAAuk1cvK7CAEJpAhmddIrAQmk18jJ7yIEJJAimNVJrwSKCuQCYJ+D1EXACQ47mYhALIEzgcMdlYsKxHvU5E/ANRzOy0QEYgnYHLuao7IE4oAkk+URkECWF1ONKCMBCSQjTDW1PAISyPJiqhFlJCCBZISpppZHQAJZXkw1oowEJJCMMNXU8ghIIMuLqUaUkYAEkhGmmloegSYF4j1q8kfgmsuLiUY0Ebg68BDg/sANp1MTRwB/A84HLP7nAWcAnwP+MQM568P82K0UzaRLILuFY9n/fyvglYHX6JhoPgS8DPhdRjwSSEaYaiqNwPWAU4FHJDRjvyKnASdn+kVpUiA6rJgwQzqtegxgJ2dzHT79/vQL9OtEHtqDJAJU9XQCjwY+mN7MIS38BjgO+EFC2/oFSYCnqukE7gF8CbhMelNrW/g9cHPA/o0pTf6CaIkVE8r+6lwf+KHz5biU0Z0NHAv8O6KRJgWip1gRkeywyjnA7Qr5bZv2l0b0pSVWBDRVSSdwEnB6ejPuFuzp1o0iHgE3+QuiJZY77l0aXh74yZT8KzmA9wKPC+xQAgkEJvN0Ag8FPp7eTHALF09Zcbvsw1skEC+pDHZvA54duVnM0H0zTdjSypZYNcojA5d2EkihKN0U+DHwLuDJhfpssZsrTOeoPFfpzOH/J4CHBTQsgQTASjG1IxQvmBp4DPCBlMY6rnsU8KOK/v982qx7XZBAvKQS7CwJ9lvgWlMb9jz+LoA95hyt3A34WsVBG/srApc4fZBAnKBSzO4LfHalgT8A9tfU/h2p2PF1W+bULNcJeNzbpECWlii0Jzb25Ga1WIb3TjVnSoW+bXn5vgr97uzSjp54l3lNCmRJeRD78qmdA7Jn/+uK7UVs0oxS7FPJn6k82OtOS16PGxKIh1KCzVMBe7y7rdhTLXu6NUK5DfC9igO1vcdle9+DLGmJ9W3g9o4JcWfgmw673k3sQUXsydocYw99iqWzWDmob2jjYO7D04Vt1m8J2DsMSy/2HvmRlQb5fuCxAX1riRUAK9R0Z+7DU9fegrvDAJn2VwEv8QCZweYBgXugJgWylCWWXR5w7cAgvwd4QmCd3sxvC3y3gtN/AfYG9qslViAwr/m63Ie37lOAd3qNO7X7InCvwr6/HHhFYJ9N/oIs4THvptyHJz4jZNotF3HujK/arnK2PZ69wfhPTwB22DQpkN6XWPbJLgObUuxiNLsf6lcpjTRe1x5tP7GQj3Z6+KMRfTUpkN5/QTy5D0+slr5ptzNR35kuVfDwiLWx5aotW2OKBBJDbZc6Od+1Xnqm/QaA/SHwXO8ZEyqLhR0MjbmwwfqTQGKob6kTkvvwdv004O1e4w7tjJld/WN7hJzlK8CDgZA3CFf7l0ByRmS6OvPgex+5mrZXRe3mwSUfj7cbFe1mRRtnjvIm4LnAfxMbk0ASAe6svvreR8amDxyLX3qm3c5IPR6wx7F2oDCmWH7l+cDXYyqvqdOkQHp9ipWS+/DE0w75He0x7NzmysAzgUcBN3OO5cuA3VoS86RqWxcSiDMAHrOPBb7v7Glz1Wbpm/bV8d4EeNC0P7FvwdhS7D/Te+32KNze8/8k8OcYmI46yqQ7IHlMdnvvw9OG1+YZwFu9xrJLItDkL0iPeRB7zl7qSdMIm/akWZ2xsgSSCab3vY9M3Q2xac/FKqUdCSSF3lR3jtyHxy1LsNk77aHnizxty+b/BCSQDDPhFOCFGdqJacIeDJwYU1F1XAQkEBemzUZz5j68rtkj0bd4jWUXREACCcJ1qPF9pk8QJzaTVN027XcHvpHUiiqvIyCBJM6LErkPj4sWSEuqjfBOu4dHLhsJJIFkydyHx01t2j2UwmwkkDBel7IumfvwuqlNu5eUz04C8XFaa1U69+F11b5BYqdZVdIJSCCRDGvlPjzuatPuoeSzkUB8nA6xqpn78LhsgbV32n/hMZbNRgISSMTkaCH34XHbbjC34/HKtHtorbeRQCLYtZD78LqtTbuXlASSRmpH7VZyH94B2aunb/Aay+5SBPQLEjghWst9eNxvZdNurwzbpyCOA/Z7HG/ARgIJDEKLuQ/PEGpv2u0lr9cB9pXbdwNP8jjdgI0EEhiEVnMfnmHU2LTvAz4M3G/FwXsCX/U4XdlGAgkIQMu5D+8wSm7abUlln1tbd9+VXalqPFtfakkg3pkFtJ778A7lecDrvcaRdpbNN162pNpU7G5e+/xcy0UCcUanl9yHZzh2mZp9r3yO4/GbllSb/LrrTH54OHhsJBAPpenJy+edtj2YzbFptw/jfCrwClH7ZqAd0291qSWBOGezXUj2cKdtL2a2abcPjP49g8OWa3nNls9db+si5fb1DK5vbUICcRDuMffhGNYBk08DD/Qar7GzJZV9LCj1a1GtLrUkEMfksI3kOxx2vZrYZduWowgtMUuqTX20utSSQByz4uzp67MO0y5NYjbtdkH0q4HLZRyxXbxnn3poqUggu0RjCbkPz4Tzbtrt83K2H0tdUm3yqbWllgSyy+yxjeeLPDNsATa7bdrvCJyR8GkCDyJbah2Z6cGBp7/dbCSQLYSWlPvYbSIc/P9Nm3b7I3Fy5iXVJp/sQOPTvQ7PbCeBbAFsp06XlPvwziW7JfK1k/HcS6rWl1oSyJZZs8Tch0cktmm3PcZfCyyptj3VamGp1aRAWvjClOU+5vooi2eS1raxD1/ureyEXadq16rWLPqAzgb6S8991Jx0IX3XfqrV5C9ICx/QWXruI2SS1rSt/VRLAlkT/VFyHzUnfkjfNZdaEsiaSI2U+wiZqLVsLwGOrXQsXgJZifqIuY9aEz+k31pLLQlkJUqj5j5CJmst2zcDzyrcuQSyAnzU3EfheRfVXY2llgSyI1RLfu8jakY2WKn0UksC2TEJlPtoUBFrXLJPO9ilECWKBLKD8rcAO7Gq0jYBW2pZnM4p4KYEMkG+MfCzAsDVRR4CPwVuUeBYvAQyxcvejntxntiplUIE3gg8Z+a+JBBgD/BL4IiZYav5vARKLLUkEODewBfyxk6tFSIw91JLAgE+ApxYKKDqJj8Bu0bVrlOdowwvkKsA5wNXmoOu2ixCYM6l1vACse9U2M1+Kn0TsKXWUcC/Mg9jeIEo95F5RlVs7jTA7uvKWYYWiHIfOadS/bbmWGoNLRDlPupP6twe5F5qDSsQ5T5yT8122rN7hu2+4RxlWIEo95Fj+rTZRs6l1rACUe6jzcmdy6tcS60hBaLcR65p2HY7djuk3RKZUoYUiHIfKVOmn7oXA8ckHosfUiDKffQzyVM9TV1qDScQ5T5Sp1x/9U9N+ITFcAJR7qO/CZ7qccpSayiBKPeROtX6rR+71BpKIMp99DvBc3h+SsRbo0MJ5HTgpByk1UaXBGypdTRwboD3wwhEuY+AWbFg0/OAWwccix9GIAuOuYY2IwEJZEa4arp/AhJI/zHUCGYkIIHMCFdN909AAuk/hhrBjAQkkBnhqun+CUgg/cdQI5iRgAQyI1w13T8BCaT/GGoEMxKQQGaEq6b7J9CkQC4A9jnYXgSc4LCTiQjEEjgTONxR+ULAPuEXVOx4eUyxzvbGVFQdEahEQAKpBF7d9kFAAukjTvKyEgEJpBJ4ddsHAQmkjzjJy0oEJJBK4NVtHwQkkD7iJC8rEZBAKoFXt30QkED6iJO8rERAAqkEXt32QaCoQM4CDuuDi7wUgQME9gPHh7KIPWoS2o/sRaBLAhJIl2GT06UISCClSKufLglIIF2GTU6XIiCBlCKtfrokIIF0GTY5XYqABFKKtPrpkoAE0mXY5HQpAhJIKdLqp0sCEkiXYZPTpQhIIKVIq58uCUggXYZNTpciIIGUIq1+uiQggXQZNjldioAEUoq0+umSgATSZdjkdCkCEkgp0uqnSwISSJdhk9OlCEggpUirny4JSCBdhk1OlyIggZQirX66JCCBdBk2OV2KgARSirT66ZKABNJl2OR0KQISSCnS6qdLAhJIl2GT06UISCClSKufLglIIF2GTU6XIiCBlCKtfrok8D9k9G72PfQcHAAAAABJRU5ErkJggg==');
                $('[name^=btn-]').attr('disabled', true).addClass('layui-btn-disabled');
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
            if (field.backgroundimgshow == 'on' && ($('#backgroundimgurl').attr('realpath') == undefined || $('#backgroundimgurl').attr('realpath') == '')) {
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
                searchEngines: field.searchengines,
                logoShow: field.logoshow == 'on' ? true : false,
                suggestSwitch: field.suggestswitch == 'on' ? true : false,
                historySwitch: field.historyswitch == 'on' ? true : false,
                logoImgUrl: $('#logoimgurl').attr('realpath') == undefined ? "" : $('#logoimgurl').attr('realpath'),
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
                        var logoImgUrl = imgurl + 'imgproxy/' + config.logoImgUrl.split("/")[5];
                        $img = $('<img id="logoimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                        $img.attr('src', logoImgUrl).attr('realpath', config.logoImgUrl);
                        $('#logoimgupload').after($img);
                        $('#logoimgurldiv').show();
                    }

                    $('#backgroundimgurl').remove();
                    if (field.backgroundimgshow == 'on') {
                        var backgroundImgUrl = imgurl + 'imgproxy/' + config.backgroundImgUrl.split("/")[5];
                        $img = $('<img id="backgroundimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                        $img.attr('src', backgroundImgUrl).attr('realpath', config.backgroundImgUrl);
                        $('#backgroundimgupload').after($img);
                        $('#backgroundimgurldiv').show();
                    }

                    $('#backgroundimgurlpc').remove();
                    if (field.backgroundimgpcshow == 'on') {
                        var backgroundImgUrlPc = imgurl + 'imgproxy/' + config.backgroundImgUrlPc.split("/")[5];
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
            if (field.backgroundimgshow == 'on' && ($('#backgroundimgurl').attr('realpath') == undefined || $('#backgroundimgurl').attr('realpath') == '')) {
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
                searchEngines: field.searchengines,
                logoShow: field.logoshow == 'on' ? true : false,
                suggestSwitch: field.suggestswitch == 'on' ? true : false,
                historySwitch: field.historyswitch == 'on' ? true : false,
                logoImgUrl: $('#logoimgurl').attr('realpath') == undefined ? "" : $('#logoimgurl').attr('realpath'),
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
                        var logoImgUrl = imgurl + 'imgproxy/' + config.logoImgUrl.split("/")[5];
                        $img = $('<img id="logoimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                        $img.attr('src', logoImgUrl).attr('realpath', config.logoImgUrl);
                        $('#logoimgupload').after($img);
                        $('#logoimgurldiv').show();
                    }

                    $('#backgroundimgurl').remove();
                    if (field.backgroundimgshow == 'on') {
                        var backgroundImgUrl = imgurl + 'imgproxy/' + config.backgroundImgUrl.split("/")[5];
                        $img = $('<img id="backgroundimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                        $img.attr('src', backgroundImgUrl).attr('realpath', config.backgroundImgUrl);
                        $('#backgroundimgupload').after($img);
                        $('#backgroundimgurldiv').show();
                    }

                    $('#backgroundimgurlpc').remove();
                    if (field.backgroundimgpcshow == 'on') {
                        var backgroundImgUrlPc = imgurl + 'imgproxy/' + config.backgroundImgUrlPc.split("/")[5];
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
                var logoImgUrl = imgurl + 'imgtempproxy/' + res.path.split("/")[5];
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
                var backgroundImgUrl = imgurl + 'imgtempproxy/' + res.path.split("/")[5];
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
                var backgroundImgUrlPc = imgurl + 'imgtempproxy/' + res.path.split("/")[5];
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
    alert(1);
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
                $('#menuimgurl-edit').attr('src', 'data:image/png;base64,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');
                $('[name^=btn-]').attr('disabled', true).addClass('layui-btn-disabled');
            })
        });
    });
});

$('#logout').on('click', function () {
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
                '        接毕设哈哈 <br>\n' +
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
                "backgroundimgshow": config.backgroundImgShow,
                "backgroundimgpcshow": config.backgroundImgPcShow
            }
            form.val("config", res);

            if (config.logoShow) {
                $('#logoimgurl').remove();
                var logoImgUrl = imgurl + 'imgproxy/' + config.logoImgUrl.split("/")[5];
                $img = $('<img id="logoimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', logoImgUrl).attr('realpath', config.logoImgUrl);
                $('#logoimgupload').after($img);
                $('#logoimgurldiv').show();
            }

            if (config.backgroundImgShow) {
                // 手机端背景
                $('#backgroundimgurl').remove();
                var backgroundImgUrl = imgurl + 'imgproxy/' + config.backgroundImgUrl.split("/")[5];
                $img = $('<img id="backgroundimgurl" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', backgroundImgUrl).attr('realpath', config.backgroundImgUrl);
                $('#backgroundimgupload').after($img);
                $('#backgroundimgurldiv').show();
            }

            if (config.backgroundImgPcShow) {
                // PC端背景
                $('#backgroundimgurlpc').remove();
                var backgroundImgUrlPc = imgurl + 'imgproxy/' + config.backgroundImgUrlPc.split("/")[5];
                $img = $('<img id="backgroundimgurlpc" style="width: 50px;height: 50px;margin-left: 5px;">');
                $img.attr('src', backgroundImgUrlPc).attr('realpath', config.backgroundImgUrlPc);
                $('#backgroundimguploadpc').after($img);
                $('#backgroundimgurlpcdiv').show();
            }

            if (config.weatherSwitch) {
                $('#weathercitydiv').show();
            }
            // form.render('checkbox', 'config');
        }
    });

}


