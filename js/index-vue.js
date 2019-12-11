var url = document.location.toString();
var splitUrl = url.split('/');
var imgurl = splitUrl[0] + "//" + splitUrl[2].split(':')[0] + '/';

var searchEngineList, suggestSwitch, historySwitch, menuNameShow;
var clientWidth = document.body.clientWidth; // 网页可见区域宽


// Util.statistics('index');
var userInfo = Util.getUserInfo();
if (userInfo == undefined) {
    if (localStorage) {
        var date = localStorage.getItem("tipstime");
        if (date && date != '') {
            var now = new Date();
            if (now.getTime() - date > 24 * 60 * 60 * 1000) { // 1天
                $('.tips').parent('div').fadeIn(500);
            }
        } else {
            $('.tips').parent('div').fadeIn(500);
        }
    }
    userInfo = {
        id: -1
    }
}

new Vue({
    el: '.sets',
    data() {
        return {
            'setList': DataUtils.setList()
        };
    },
    computed: {
        // time: function () {
        //     return this.getDateStr();
        // },
        // todoSize: function () {
        //     var size = 0;
        //     this.list.forEach(element => {
        //         if (!element.complete && !element.isDel) {
        //             size += 1;
        //         }
        //     });
        //     return size;
        // }
    },
    beforeCreate() {
    },
    created() {
    },
    mounted() {
    },
    updated() {
    },
    methods: {
        displaySet: function (operation) {
            // 判断 当前的设置项是否显示，如果显示则隐藏，反之亦然
            // 去除最后一个
            if (operation == 'click') {
                var iClass = this.setList[this.setList.length - 1].iClass;
                if (iClass == 'fa fa-angle-up') {
                    operation = 'show';
                } else {
                    operation = 'hide';
                }
            }

            var display = operation;
            for (var i = 0; i < this.setList.length - 1; i++) {
                this.setList[i].class = display;
            }
            if (display == 'show') {
                this.setList[this.setList.length - 1].iClass = 'fa fa-angle-down';
            } else {
                this.setList[this.setList.length - 1].iClass = 'fa fa-angle-up';
            }
        }

    }
});


var app = new Vue({
    el: '#app',
    data() {
        return {
            searchKey: '',
            searchEngineList: [],
            suggestList: [],
            indexList: [],
            searchEngineListDis: false,
            weather: '',
            logoImgUrl: '',
            menuNameShow: true,
            defaultSearchEngine: {
                url: 'https://www.baidu.com/s?wd=',
                name: '百度'
            },
            appStyle: {}
        }
    },
    computed: {
        // searchEngineListDis: function () {
        //     return this.getDateStr();
        // },
        // todoSize: function () {
        //     var size = 0;
        //     this.list.forEach(element => {
        //         if (!element.complete && !element.isDel) {
        //             size += 1;
        //         }
        //     });
        //     return size;
        // }
    },
    watch: {
        defaultSearchEngine: {
            handler: function (val, oldVal) {
                for (var i = 0; i < app.searchEngineList.length; i++) {
                    var item = app.searchEngineList[i];
                    if (item.codeValue == val.url) {
                        if (!item.style) {
                            item.style = {};
                        }
                        app.$set(item, 'style', {
                            backgroundColor: 'rgb(95, 184, 120)'
                        });
                        break;
                    }
                }
            },
            deep: true
        }
    },
    beforeCreate() {
    },
    created() {
    },
    beforeMount() {
    },
    mounted() {
        this.initData();
    },
    methods: {
        initData() {
            var that = this;
            // 1.初始化 静态数据，搜索引擎列表
            var param = {
                'codeType': 'SEARCH_ENGINES'
            };
            Util.postJson("./common-server/user/api/v1/getStaticData", param, function (response) {
                if (response.code != 0) {
                    alert(response.message);
                    return;
                }
                app.searchEngineList = response.result;

                // 2.初始化 自定义的配置项
                app.getConfig();

                // 3.初始化 导航列表
                app.getIndex();


            });
        },
        getIndex() {
            var param = {
                userid: userInfo.id
            };

            var key = 'index_' + userInfo.id;
            var result;
            if (localStorage && localStorage.getItem(key)) {
                this.indexList = JSON.parse(localStorage.getItem(key));
            } else {
                Util.postJson("./common-server/user/api/v1/index", param, function (response) {
                    if (response.code != 0) {
                        alert(response.message);
                        return;
                    }
                    this.indexList = response.result;
                    if (localStorage && userInfo.id != -1) {
                        localStorage.setItem(key, JSON.stringify(result));
                    }
                });
            }
        },
        displaySearchEngineList() {
            app.searchEngineListDis = !app.searchEngineListDis;
        },
        hideSearchEngineList() {
            app.searchEngineListDis = false;
        },
        setSearchEngine(index) {
            app.searchEngineListDis = false;
            var item = app.searchEngineList[index];
            app.defaultSearchEngine = {
                url: item.codeValue,
                name: item.codeName
            };
        },
        getConfig() {
            var that = this;
            var param = {
                userid: userInfo.id
            };
            Util.postJson("./common-server/user/api/v1/getConfig", param, function (response) {
                if (response.code != 0) {
                    alert(response.message);
                    return;
                }

                var result = response.result;
                if (result.length < 1) {
                    return;
                }

                var config = result[0].config;
                config = JSON.parse(config);

                var weatherSwitch = config.weatherSwitch;
                if (weatherSwitch) {
                    var weatherCity = config.weatherCity;
                    if (weatherCity && weatherCity.replace(/\s+/g, '') != '') {
                        that.setWeather(weatherCity);
                    } else {
                        that.getCity(function (weatherCity) {
                            that.setWeather(weatherCity);
                        });
                    }
                }

                var searchInputShow = config.searchInputShow;
                if (searchInputShow) {
                    that.getOneWord();
                }

                that.menuNameShow = config.menuNameShow;

                var logoShow = config.logoShow;
                if (logoShow) {
                    var logoImgUrl = config.logoImgUrl;
                    if (logoImgUrl) {
                        logoImgUrl = imgurl + 'imgproxy/' + logoImgUrl.split("/")[5];
                        that.logoImgUrl = logoImgUrl;
                    }
                }

                var searchEngineC = config.searchEngines;
                if (searchEngineC && searchEngineC != '') {
                    for (var i = 0; i < that.searchEngineList.length; i++) {
                        var re = that.searchEngineList[i];
                        if (re.codeValue == searchEngineC) {
                            that.defaultSearchEngine.url = re.codeValue;
                            that.defaultSearchEngine.name = re.codeName;
                            break;
                        }
                    }
                }

                var autoChangeBgImgShow = config.autoChangeBgImgShow;
                if (autoChangeBgImgShow) {
                    // 获取必应每日精选壁纸
                    $.ajax({
                        // https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=1572487353393&pid=hp&video=0
                        url: './bingBgImg?format=js&idx=0&n=1&nc=' + new Date().getTime() + '&pid=hp&video=0',
                        type: "GET",
                        success: function (result, status) {
                            console.log(result);
                            if (result && result.images && result.images.length > 0) {
                                var imageUrl = result.images[0].url;
                                // $('body').css("background", "url('https://cn.bing.com/" + imageUrl + "') center no-repeat fixed");
                                $('body').css("background", "url('https://cn.bing.com/" + imageUrl + "') center no-repeat fixed");
                            }
                        }
                    });
                } else {
                    var clientWidth = document.body.clientWidth; // 网页可见区域宽
                    if (clientWidth > 700) {
                        var backgroundImgPcShow = config.backgroundImgPcShow;
                        if (backgroundImgPcShow) {
                            var backgroundImgUrlPc = config.backgroundImgUrlPc;
                            if (backgroundImgUrlPc) {
                                backgroundImgUrlPc = imgurl + 'imgproxy/' + backgroundImgUrlPc.split("/")[5];
                                // $('body').css("background-image", "url('" + backgroundImgUrlPc + "')");
                                that.appStyle.backgroundImage = "url('" + backgroundImgUrlPc + "')";
                                that.appStyle.backgroundSize = "cover";
                                that.appStyle.backgroundColor = '#F2F2F2';
                                that.appStyle.backgroundRepeat = 'no-repeat';
                                that.appStyle.backgroundPosition = 'center';
                                that.appStyle.backgroundAttachment = 'fixed';
                            }
                        }
                    } else {
                        var backgroundImgShow = config.backgroundImgShow;
                        if (backgroundImgShow) {
                            var backgroundImgUrl = config.backgroundImgUrl;
                            if (backgroundImgUrl) {
                                backgroundImgUrl = imgurl + 'imgproxy/' + backgroundImgUrl.split("/")[5];
                                // $('body').css("background-image", "url('" + backgroundImgUrl + "')");
                                that.appStyle.backgroundImage = "url('" + backgroundImgUrl + "')";
                            }
                        }
                    }
                }
                suggestSwitch = config.suggestSwitch;
                historySwitch = config.historySwitch;
            });
        },
        changeBgStyle(index) {
            for (var i = 0; i < app.searchEngineList.length; i++) {
                // this.searchEngineList[i].style = {};
                var item = app.searchEngineList[i];
                app.$set(item, 'style', {});
            }
            var current = app.searchEngineList[index];
            app.$set(current, 'style', {
                backgroundColor: 'rgb(95, 184, 120)'
            });
        },
        search() {
            window.open(app.defaultSearchEngine.url + app.searchKey);
            setTimeout(function () {
                app.searchKey = '';
                // .blur();
            }, 1000);
        },
        getSuggestList() {
            var url = './suggest?wd=' + app.searchKey;
            Util.postJson(url, {}, function (response) {
                console.log(response);
            });
        },
        getOneWord() {
            // document.querySelector('title').innerHTML = '123';
            // $.ajax({
            //     url: 'https://v2.jinrishici.com/one.json',
            //     xhrFields: {
            //         withCredentials: true
            //     },
            //     success: function (result, status) {
            //         console.log(result);
            //         if (result && result.status == 'success') {
            //             var content = result.data.content.split('，')[0];
            //             $('title').html('主页-' + content + '～');
            //             document.querySelector('title').innerHTML = '123';
            //         }
            //     }
            // });
        },
        getCity(callback) {
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
                                    callback(result.city);
                                }
                            })
                        });
                    }
                });
            });
        },
        setWeather(weatherCity) {
            var that = this;
            //加载天气查询插件
            AMap.plugin('AMap.Weather', function () {
                //创建天气查询实例
                //执行实时天气信息查询
                new AMap.Weather().getForecast(weatherCity, function (err, data) {
                    // console.log(data);
                    if (data && data.info == 'OK') {
                        var city = data.city;
                        var c = data.forecasts[0].nightTemp + '℃ ~ ' + data.forecasts[0].dayTemp + '℃';
                        var dayWeather = data.forecasts[0].dayWeather;
                        var html = city + ' ' + dayWeather + ' ' + c;
                        // if (clientWidth > 700) {
                        //     var date = new Date();
                        //     var time = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 ';
                        //     html = time + html;
                        // }
                        var date = new Date();
                        var time = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 ';
                        that.weather = time + html;
                    }
                });
            });
        }


    }
});