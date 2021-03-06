/**
 * Created by lirun on 2019/1/17.
 */
// "use strict";
import "../../../../css/style/index.css";

var returnResult;
var userType;
var userId;
var menuConfigListResult; //加载首页返回的菜单数据
var addChildListArray = [];

var menuSettingConfigId; //菜单存入数据库的id
var orgList; //医院列表
var form_pm_obj = {};
// var form_db = {};
var sys_db = {};
// var form_db;
// var form_pm;
var menuSettingConfigId; //菜单存入数据库的id
var orgList; //医院列表
var distance; //添加菜单距离浏览器 左边距
var editMenuPosition; // top/在头部  bottom/在底部
var screenWidth; //获取屏幕宽度

var srcUrl; //界面跳转的url
var utils = require('../../common/public');
var ctx = "/crmweb";

$(function () {
    //如果没登录进入首页 即将返回登录页面
    $.ajaxSetup({
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        complete: function (xhr, status) {
            var sessionStatus = xhr.getResponseHeader('sessionstatus'); // 通过XMLHttpRequest取得响应头，sessionstatus，
            if (sessionStatus == "timeout") {
                window.location.href = 'login.html';
            }
        }
    });

    queryInformation(); //查询首页 返回的信息

    function queryInformation() {
        utils.showLoadingContent("正在加载...", true);
        $.ajax({
            type: "GET",
            url: ctx + "/cloud/index_v1", //加载首页接口
            //url: "/src/scripts/js/cloud/index/index.json",   //加载首页接口
            async: true,
            dataType: "json",
            success: function (data) {
                utils.hideLoadingContent();
                if (data.result == "SUCCESS") {
                    returnResult = data;
                    console.log("加载首页接口的返回值：" + JSON.stringify(returnResult));
                    menuConfigListResult = data.map.menuConfigList; //保存菜单信息栏部分的内容
                    userType = data.map.userType; //获取用户类型  普通用户 or 管理员
                    menuSettingConfigId = data.map.menuSettingConfigId; //菜单存入数据库的id
                    orgList = data.map.orgList; //医院列表
                    $.cookie('cur_orgId', data.cur_orgId); //医院id
                    $.cookie('cur_orgName', data.cur_orgName); //医院名称
                    $.cookie('fullName', data.fullName); //用户名称
                    $.cookie('cur_userId', data.cur_userId); //用户ID
                    $.cookie('cur_sessionId', data.cur_sessionId); //当前sessionId
                    userId = data.cur_userId;

                    $(".account-name").text(data.map.userCode + "(" + data.map.userName + ")"); //用户名
                    $(".account-name").attr("title", data.map.userCode + "(" + data.map.userName + ")")
                    $(".select2-chosen").text(data.map.cur_orgName); //医院名称


                    screenWidth = window.screen.width; //获取屏幕宽度
                    console.log("当前浏览器尺寸宽度为：" + screenWidth);
                    //界面布局为横向还是纵向，即 是显示左侧菜单还是显示头部菜单

                    showMenu(); //显示菜单
                    showPage(); //显示界面内容
                }
                if (data.result == "Failure") {
                    window.location.href = 'login.html';
                }
            },
            error: function (data) {
                utils.hideLoadingContent();
                console.log("加载首页接口的 失败：" + data);
            }
        })
    }

    function showMenu() {
        var menuDirection = $.cookie("menuDirection"); //菜单方向
        console.log(menuDirection);
        if (menuDirection == "vertical") { //如果 是vertiacl则页面布局为竖向，显示左侧菜单，   如=是across，则页面布局为横向，显示i头部彩打
            getMenu(menuConfigListResult); //查询并显示左侧菜单栏
        } else {
            getHeadMenu(menuConfigListResult); //查询并显示头部菜单栏
            $.cookie("menuDirection", "across");
        }
    }

    function showPage() {
        //设置路径和标题
        var select_menu_id = localStorage.getItem("select_menu_id");
        if (localStorage.getItem("srcUrl") == "") { //如果是登录跳转，则展示名称为“首页”的菜单【该标志在login.js页面进行设置】
            $(".index-content").html("");
            srcUrl = './cloud/menu/homePage.html';
            $(".index-content").append('<iframe id="f_homePage" name="content_iframe" class="content_iframe_s" src="' + srcUrl + '" width="100%" height="100%" frameborder="0"></iframe>');
            localStorage.setItem("srcUrl", "");
        } else if (localStorage.getItem("srcUrl") == "messageList") { //如果是登录跳转，则展示名称为“首页”的菜单【该标志在login.js页面进行设置】
            $(".index-content").html("");
            srcUrl = './cloud/menu/messageList.html';
            $(".index-content").append('<iframe id="f_homePage" name="content_iframe" class="content_iframe_s" src="' + srcUrl + '" width="100%" height="100%" frameborder="0"></iframe>');
            localStorage.setItem("srcUrl", "messageList");
        } else {
            var querySUrl = localStorage.getItem("srcUrl");
            var select_menu_id = localStorage.getItem("select_menu_id");
            console.log(querySUrl);
            $(".index-content").html("");
            $(".index-content").append('<iframe id="" name="content_iframe" class="content_iframe_s" src="' + querySUrl + '" width="100%" height="100%" frameborder="0"></iframe>');

            //获取当前界面选择的二级菜单  key_menu_id   添加颜色标志，并展开一级菜单
            $('*[key_menu_id=' + select_menu_id + ']').addClass("sider-active");
            $('*[key_menu_id=' + select_menu_id + ']').parent().parent().css("display", "block");
        }
    }
    $(".hospital-name").click(function () {
        $(".hospital-list").empty(); //清空原始列表
        $(".select-hospital-content").toggle();

        if (orgList.length > 0) {
            var list = "";
            for (var i = 0; i < orgList.length; i++) {
                var org_name = orgList[i].org_name;
                var org_id = orgList[i].org_id;
                list += "<li style='text-align: left;height: 30px;line-height: 30px;padding-left: 15px;' value='" + org_id + "'>" + org_name + "</li>";
            }
            $(".hospital-list").append(list);
        }
    });

    $(".appointment").click(function(){
        $(".index-content").html("");
        srcUrl = './cloud/menu/messageList.html';
        $(".index-content").append('<iframe id="f_homePage" name="content_iframe" class="content_iframe_s" src="'+srcUrl+'" width="100%" height="100%" frameborder="0"></iframe>');
        localStorage.setItem("srcUrl","messageList");
    });

    $(document).on("click",".hospital-list li",function(){
        var selectedHospital = $(this).text();
        $(".select2-chosen").text(selectedHospital); //医院名称 改变，并查询此医院的信息
        $(".select-hospital-content").hide();

        var orgName = $(this).html();
        var orgId = $(this).val();
        initUserOrgCookies(orgName, orgId);
        $.post(ctx + "/cloud/index/change/hospital/" + orgId, function (json) {
            window.location.reload();
        });
    });

    function initUserOrgCookies(orgName, orgId) {
        $.cookie('orgName', orgName);
        $.cookie('orgId', orgId);
    }

    //头部菜单栏
    //获取头部菜单栏
    function getHeadMenu(menuConfigList) {

        $(".headMenu").show();
        //当左侧菜单隐藏的时候，同时隐藏 添加菜单 编辑菜单等部分
        $("#sidebar").hide();
        $("#addMenuContent").hide();
        $("#editMenuContent").hide();
        $(".index-menu").show(); //进行界面初始化，显示头部菜单，隐藏新增编辑菜单

        var headMenuMaxWidth = screenWidth - 860; // 头部菜单栏最大宽度 = 浏览器宽度 - 720
        $(".index-menu").empty();
        var menuListHtml = "<div class='menu-item menu-item-index homePage' key='parent'><em class='txt'>首页</em></div>";
        var menuList = menuConfigList;

        /*头部菜单栏*/
        //查询一级菜单
        if (menuConfigList) {
            for (var i = 0; i < menuConfigList.length; i++) {
                var alias = menuList[i].alias;
                var name = menuList[i].name;
                var sid = menuList[i].sid;
                var isShow = menuList[i].isShow; //此级此单是否显示在左侧菜单栏

                var displayStatus;
                if (isShow) {
                    if (isShow == 0) {
                        displayStatus = "none";
                    } else {
                        displayStatus = "block";
                    }
                }
                var displayName;
                if (alias) {
                    displayName = alias;
                } else {
                    displayName = name;
                }
                menuListHtml += "<div class='menu-item' key='parent' menu_name='" + name + "' menu_id='" + sid + ">" +
                    "<em class='txt'>" + displayName + "</em>" +
                    "<em class='slide-child'></em>" +
                    "<ul class='child-menu-panel' style='z-index: 10000;visibility: hidden;' id='" + "headChildList_" + i + "'>" +
                    "</ul>" +
                    "</div>";
            }
            $(".index-menu").append(menuListHtml); //生成头部一级菜单列表

            //生成头部二级菜单
            for (var l = 0; l < menuConfigList.length; l++) {
                var name = menuList[l].name;
                var childListHtml = "";
                if (menuList[l].childList && menuList[l].childList.length > 0) {
                    for (var j = 0; j < menuList[l].childList.length; j++) {
                        var childName = menuList[l].childList[j].name;
                        var childId = menuList[l].childList[j].id;
                        var sid = menuList[l].childList[j].sid;
                        var dbId = menuList[l].childList[j].dbId;
                        var classify = menuList[l].childList[j].classify;
                        var type = menuList[l].childList[j].type;
                        var url = menuList[l].childList[j].linkAddress;
                        var triggerObjContent = menuList[l].childList[j].triggerObjContent;
                        // console.log(JSON.stringify(triggerObjContent))
                        var towLevelIsShow = menuList[l].childList[j].isShow; //二级菜单是否显示
                        var twoLevelDisplayStatus;
                        if (towLevelIsShow) {
                            if (towLevelIsShow == 0) {
                                twoLevelDisplayStatus = "none";
                            } else {
                                twoLevelDisplayStatus = "block";
                            }
                        }
                        var twoLevelAlias = menuList[l].childList[j].alias;
                        var twoLevelDisplayName; //显示修改后名称 没修改这位以前 名称
                        if (twoLevelAlias) {
                            twoLevelDisplayName = twoLevelAlias;
                        } else {
                            twoLevelDisplayName = childName;
                        }
                         if(type=="1" && triggerObjContent){
                            childListHtml += " <li class='head-item-a' key='child' key_menu_id='" + sid + "' menu_name='" + childName + "' classify='" + classify + "' id='" + childId + "' menu_id='" + sid + "' menu_type='" + type + "' url='" + url + "' link_address='" + url + "' tableId='" + triggerObjContent.tableId + "' tableName='" + triggerObjContent.tableName + "' onclick='queryInformationInfo(this)'>" + twoLevelDisplayName + "</li>";
                         }else{
                             childListHtml += " <li class='head-item-a' key='child' key_menu_id='" + sid + "' menu_name='" + childName + "' classify='" + classify + "' id='" + childId + "' menu_id='" + sid + "' menu_type='" + type + "' url='" + url + "' link_address='" + url + "' onclick='queryInformationInfo(this)'>" + twoLevelDisplayName + "</li>";
                         }
                    }
                    var childListId = "headChildList_" + l;
                    $("#" + childListId).append(childListHtml);
                }
            }
        }
        //计算可以显示的菜单个数并显示
        //生成头部菜单后，如果长度 超出 最大长度，显示部分菜单  //必须先显示.index-menu ，不然子元素获取offsetWidth 可能为0
        var headMenuWidth = $('.index-menu').width();
        console.log("当前头部菜单栏的实际宽度：" + headMenuWidth);
        var menuData = $('.index-menu').find(".menu-item");
        var showLiAccount = menuData.length; //显示li的个数
        var calculateWidth = 0;
        for (var k = 0; k < menuData.length; k++) {
            calculateWidth += menuData[k].offsetWidth;
            console.log(menuData[k].offsetWidth);
            if (calculateWidth > headMenuMaxWidth) {
                showLiAccount = k - 1; //获取可以显示的li的个数
                break;
            }
        }
        var arr = $(".index-menu .menu-item");
        if (arr.length > showLiAccount) {
            $(".index-menu .menu-item:gt(" + showLiAccount + ")").hide(); //超过可以显示的菜单的个数  的多余菜单隐藏
        }

        $.cookie("menuDirection", 'across'); //加载完毕后 设置 localStorage。menuDirection = across；横向
    }

    $(document).on("click", ".head-item-a", function () {
        $(".head-item-a").css({
            "color": "#a1cfee",
            "background": "#2258a6"
        });
        $(this).css({
            "color": "#fff",
            "background": "#295799"
        });

        $(this).parent().parent().siblings().removeClass("head-menu-item-selected");
        $(this).parent().parent().addClass("head-menu-item-selected"); //选择的头部的二级菜单 一级菜单加上 底边颜色
    });

    $(document).on("mouseenter", ".index-menu .menu-item", function () {
        $(this).removeClass("bg-3b8cff").addClass("bg-206ddb");
        $(this).children("ul").css("visibility", "visible");
        console.log("此菜单项的宽度为" + $(this).outerWidth())
    });
    $(document).on("mouseleave", ".index-menu .menu-item", function () {
        $(this).removeClass("bg-206ddb").addClass("bg-3b8cff");
        $(this).children("ul").css("visibility", "hidden");
    });

    // 左侧菜单栏
   
        function getMenu(menuConfigList) {
        $(".headMenu").hide();
        $(".index-menu").hide();  //进行界面初始化，隐藏头部菜单

        $("#sidebar").empty();  //清空数据

        var menuListHtml = "<div class='nav-list homePage'>" +
                                "<span class='nav-title'>" +
                                    "<i class='icons icon-sp'></i>" +
                                    "<span class='txt'>首页</span>" +
                                    "<span class='icon iconfont icon-ios-arrow-forward' style='display:inline-block;width: 20px;float: right;margin-right: 20px;'></span>"+
                                "</span>" +
                            "</div>"+
                            "<div class='customize-menus'>" +
                                "<span class='icon iconfont icon-jiahao2' style='color: #1d4b68;'></span>" +
                                "<span class='menu'>添加菜单</span>" +
                            "</div>";
        var menuList = menuConfigList;

        /*左侧菜单栏*/
        //查询一级菜单
        if (menuConfigList) {
            for (var i = 0; i < menuConfigList.length; i++) {
                var alias = menuList[i].alias;
                var name = menuList[i].name;
                var sid = menuList[i].sid;
                var isShow = menuList[i].isShow; //此级此单是否显示在左侧菜单栏

                var displayStatus;
                if (isShow) {
                    if (isShow == 0) {
                        displayStatus = "none";
                    } else {
                        displayStatus = "block";
                    }
                }
                var displayName;
                if (alias) {
                    displayName = alias;
                } else {
                    displayName = name;
                }
                menuListHtml += "<div class='nav-list' key_menu_id='" + sid + "' name='0' a='0' style='" + "display:" + displayStatus + "'>" +
                    "<span class='nav-title' name='0' a='0'>" +
                    "<i class='icons icon-sp'></i>" +
                    "<span class='txt'>" + displayName + "</span>" +
                    "<span class='icon iconfont icon-ios-arrow-forward' style='display:inline-block;width: 20px;float: right;margin-right: 20px;'></span>" +
                    " </span>" +
                    "<ul class='nav-child-list' id='" + "childList_" + i + "'>" + "</ul>" +
                    " </div>";
            }
            $("#sidebar").append(menuListHtml); //生成一级菜单列表

            //查询二级菜单   生成二级菜单列表 //
            for (var l = 0; l < menuConfigList.length; l++) {
                var name = menuList[l].name;
                var childListHtml = "";
                if (menuList[l].childList && menuList[l].childList.length > 0) {
                    for (var j = 0; j < menuList[l].childList.length; j++) {
                        var childName = menuList[l].childList[j].name;
                        var childId = menuList[l].childList[j].id;
                        var sid = menuList[l].childList[j].sid;
                        var classify = menuList[l].childList[j].classify;
                        var type = menuList[l].childList[j].type;
                        var url = menuList[l].childList[j].linkAddress;
                        var triggerObjContent = menuList[l].childList[j].triggerObjContent;
                        var towLevelIsShow = menuList[l].childList[j].isShow; //二级菜单是否显示
                        var twoLevelDisplayStatus;
                        if (towLevelIsShow) {
                            if (towLevelIsShow == 0) {
                                twoLevelDisplayStatus = "none";
                            } else {
                                twoLevelDisplayStatus = "block";
                            }
                        }
                        var twoLevelAlias = menuList[l].childList[j].alias;
                        var twoLevelDisplayName; //显示修改后名称 没修改这位以前 名称
                        if (twoLevelAlias) {
                            twoLevelDisplayName = twoLevelAlias;
                        } else {
                            twoLevelDisplayName = childName;
                        }

                        /*childListHtml += "<li class='nav-item-a'style='" + "display:" + twoLevelDisplayStatus + "'><span key_menu_id='" + sid + "' menu_name='" + childName + "' classify='" + classify + "' id='" + childId + "' menu_id='" + sid + "' menu_type='" + type + "' url='" + url + "' link_address='" + url + "' tableId='" + triggerObjContent.tableId + "' tableName='" + triggerObjContent.tableName + "' onclick='queryInformationInfo(this)'>" + twoLevelDisplayName +
                            "</span></li>";*/
                        if(type=="1" && triggerObjContent){
                            childListHtml += "<li class='nav-item-a'style='" + "display:" + twoLevelDisplayStatus + "'><span key_menu_id='" + sid + "' menu_name='" + childName + "' classify='" + classify + "' id='" + childId + "' menu_id='" + sid + "' menu_type='" + type + "' url='" + url + "' link_address='" + url + "' tableId='" + triggerObjContent.tableId + "' tableName='" + triggerObjContent.tableName + "' onclick='queryInformationInfo(this)'>" + twoLevelDisplayName +
                            "</span></li>";
                         }else{
                             childListHtml += "<li class='nav-item-a'style='" + "display:" + twoLevelDisplayStatus + "'><span key_menu_id='" + sid + "' menu_name='" + childName + "' classify='" + classify + "' id='" + childId + "' menu_id='" + sid + "' menu_type='" + type + "' url='" + url + "' link_address='" + url + "'  onclick='queryInformationInfo(this)'>" + twoLevelDisplayName +
                            "</span></li>";
                         }
                    }
                    var childListId = "childList_" + l;
                    $("#" + childListId).append(childListHtml);
                }
            }
        }
        $.cookie("menuDirection", 'vertical'); //加载完毕后 设置 localStorage。menuDirection = across；竖向
    }

    //点击菜单栏，显示子菜单栏 左侧菜单  
    // 点击左侧菜单栏 添加菜单按钮，显示添加菜单
    $(document).on("click", ".customize-menus", function () {
        getAddContent(menuConfigListResult); //查询 添加菜单部分
        //菜单显示位置   显示在底部
        if ($("#addMenuContent").hasClass("head-add-menu-content")) {
            $("#addMenuContent").removeClass("head-add-menu-content").addClass("add-menu-content");
            $("#addMenuContent").css("margin-left", "276px");
        }
        if (userType == 'orgAdmin') {
            $("#addContentEditBtn").show();
        } else {
            $("#addContentEditBtn").hide();
        }
        $("#addMenuContent").show();
        editMenuPosition = "bottom"; //赋值，点击编辑按钮时，编辑菜单显示在底部
    });


    //点击头部的 添加菜单
    $(".headMenu").click(function () {
        getAddContent(menuConfigListResult); //查询 添加菜单部分
        //菜单显示位置   显示在顶部
        if ($("#addMenuContent").hasClass("add-menu-content")) {
            $("#addMenuContent").removeClass("add-menu-content").addClass("head-add-menu-content");
        }
        if (userType == 'orgAdmin') {
            $("#addContentEditBtn").show();
        } else {
            $("#addContentEditBtn").hide();
        }
        //获取头部菜单 + 距离屏幕左的距离，将添加菜单定位到此处
        //获取头部菜单 + 距离屏幕左的距离，将添加菜单定位到此处
        var left = $(".headMenu").offset().left;
        var right = $(document).width() - left; //元素左边界距离浏览器右边的 距离
        if (right >= 729) {
            $("#addMenuContent").css("margin-left", left);
        } else {
            $("#addMenuContent").css("margin-left", left - 300);
        }
        $("#addMenuContent").show();
        distance = $("#addMenuContent").css("margin-left");
        console.log("添加菜单左边距:" + distance);
        editMenuPosition = "top"; //赋值，点击编辑按钮时，编辑菜单显示在头部

    });

    $(".account-content").click(function () {
        $(".dropdown-content").toggle();
    });




    //添加菜单  点击一级菜单，显示二级菜单
    $(document).on("click", ".addMenuListItem", function () {
        $(this).addClass("bg-1c628a").siblings().removeClass("bg-1c628a");
        var index = $(this).attr("index");
        $(".addContentChildList").hide();
        var addContentChildListId = "addContentChildList_" + index;
        $("#" + addContentChildListId).show();
    });

    //添加菜单
    function getAddContent(menuConfigList) {
        var menuList = menuConfigList;
        //添加菜单  部分
        var addMenuListHtml = "";
        var objArray = [];
        if (menuList) {
            for (var i = 0; i < menuList.length; i++) {
                var name = menuList[i].name;
                var menu_sid = menuList[i].sid;
                var isShow = menuList[i].isShow;
                var mark = menuList[i].mark;
                var obj = new Object();
                obj.index = i;
                obj.childList = menuList[i].childList;
                objArray.push(obj);
                addMenuListHtml +=
                    "<li class='addMenuListItem' key_menu_id='" + menu_sid + "' index='" + i + "' id='" + menu_sid + "'>" +
                    "<span class=''>" + name + "</span>" +
                    "<em class='checkbox-mine' value='" + isShow + "' mark='" + mark + "'>" + "</em>" +
                    "<ul class='addContentChildList' index='" + i + "' class='addContentChildUl' id='" + "addContentChildList_" + i + "' style='position:absolute;top:46px;right:0;width:329px;'>" +
                    "</ul>" +
                    "</li>";
                //获取子菜单内容
                $("#addMainMenuList").html(addMenuListHtml);
            }

            if (objArray) {
                for (var k = 0; k < objArray.length; k++) {
                    var index = objArray[k].index;
                    var objList = objArray[k].childList;
                    var addChildListHtml = "";
                    if (objList) {
                        console.log("数据：" + JSON.stringify(objList));
                        for (var l = 0; l < objList.length; l++) {
                            if (objList[l]) {
                                var childName = objList[l].name;
                                var childId = objList[l].id;
                                var childIsShow = objList[l].isShow;
                                var child_sid = objList[l].sid;
                                addChildListHtml +=
                                    "<li class='addContentChildItem' key_menu_id='" + child_sid + "'>" +
                                    //"<div style='display: inline-block;width: 4px;height: 4px;padding:0 10px;border-radius: 50%;background: #7fc6ef'></div>" +
                                    "<span>" + childName + "</span>" +
                                    "<em class='checkbox-mine' value='" + childIsShow + "'>" + "</em>" +
                                    "</li>";
                            }
                        }
                        var addContentChildListId = "addContentChildList_" + index;
                        $("#" + addContentChildListId).append(addChildListHtml);
                    }

                }
            }

            //遍历复选框 ，如果 isShow value= 0,则复选框为不勾选状态
            $("#addMenuContent").find("em").each(function (i, em) {
                var em = $(em);
                var value = em.attr("value");
                if (value == 0) {
                    $(this).css("background", "#48a0dc");
                } else {
                    $(this).css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
                }
            })
        }
        //默认显示一级菜单第一行的二级子菜单
        $(".addContentChildList").hide();
        $("#addContentChildList_0").show();
        menuMove();
    }


    //点击添加菜单 一级菜单  复选框
    $(document).on("click", ".addMenuListItem>em", function (event) {
        var value = $(this).attr("value");
        if (value == 0) {
            //一级菜单 勾选中
            //$(this).addClass("checkbox-mine-ed");
            $(this).css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
            $(this).attr("value", "1");
        } else {
        //$(this).removeClass("checkbox-mine-ed");
            //一级菜单 去掉勾选
            $(this).css("background", "#48a0dc");
            $(this).attr("value", "0");
            //此一级菜单下的 二级菜单全部去掉勾选
            $(this).parent().children(".addContentChildList").children("li").children("em").attr("value", "0");
            $(this).parent().children(".addContentChildList").children("li").children("em").css("background", "#48a0dc");
        }
        event.stopPropagation();
    });

    //点击添加菜单 二级菜单  复选框
    $(document).on("click", ".addContentChildList>li>em", function (event) {
        var value = $(this).attr("value");
        if (value == 0) {
            //二级菜单 勾选中
            //$(this).addClass("checkbox-mine-ed");
            $(this).css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
            $(this).attr("value", "1");

            //则一级菜单必须勾选中
            $(this).parent().parent().prev().attr("value", "1");
            $(this).parent().parent().prev().css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
        } else {
            //$(this).removeClass("checkbox-mine-ed");
            //二级菜单 去掉勾选
            $(this).css("background", "#48a0dc");
            $(this).attr("value", "0");
        }
        event.stopPropagation();
    });

    /******************************************************************************************************/
    //点击编辑菜单 一级菜单  复选框
    $(document).on("click", ".oneLevelMenuItem>td>em", function (event) {
        var value = $(this).attr("value");
        if (value == 0) {
            //一级菜单 勾选中
            //$(this).addClass("checkbox-mine-ed");
            $(this).css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
            $(this).attr("value", "1");
        } else {
            //$(this).removeClass("checkbox-mine-ed");
            //一级菜单 去掉勾选
            $(this).css("background", "#48a0dc");
            $(this).attr("value", "0");
            //此一级菜单下的 二级菜单全部去掉勾选
            $(this).parent().parent().next().find("em").attr("value", "0");
            $(this).parent().parent().next().find("em").css("background", "#48a0dc");
        }
        event.stopPropagation();
    });

    //点击编辑菜单 二级菜单  复选框
    $(document).on("click", ".sub-table em", function (event) {
        var value = $(this).attr("value");
        if (value == 0) {
            //二级菜单 勾选中
            //$(this).addClass("checkbox-mine-ed");
            $(this).css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
            $(this).attr("value", "1");

            //则一级菜单必须勾选中
            $(this).parent().parent().parent().parent().parent().parent().prev().find("em").attr("value", "1");
            $(this).parent().parent().parent().parent().parent().parent().prev().find("em").css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
        } else {
            //$(this).removeClass("checkbox-mine-ed");
            //二级菜单 去掉勾选
            $(this).css("background", "#48a0dc");
            $(this).attr("value", "0");
        }
        event.stopPropagation();
    });


    // 点击添加菜单 编辑按钮，显示编辑菜单部分的内容
    $("#addContentEditBtn").click(function () {
        getEditContent(menuConfigListResult); //查询 编辑菜单部分
        getCustomMenuTable();
        $("#addMenuContent").hide();

        if (editMenuPosition == "bottom") {
            $("#editMenuContent").prop("style").removeProperty("top"); //移除 top样式
            $("#editMenuContent").css({
                "margin-left": "276px",
                "bottom": "0px"
            });
        }
        if (editMenuPosition == "top") {
            $("#editMenuContent").prop("style").removeProperty("bottom");
            $("#editMenuContent").css({
                "margin-left": distance,
                "top": "54px"
            });
        }
        $("#editMenuContent").show();
    });

    //layui构建编辑菜单table
    function getCustomMenuTable() {}


    // 点击添加菜单 保存按钮，保存当前菜单栏
    $("#addContentSaveBtn").click(function () {
        //调用接口，保存当前的菜单信息
        saveMenuSetting();

    });

    // 点击添加菜单取消按钮，取消操作，关闭显示区域
    $("#addContentCancelBtn").click(function () {
        $("#addMenuContent").hide();
    });

    //编辑菜单
    function getEditContent(menuConfigList) {
        var menuList = menuConfigList;
        // console.log("一级菜单数据:" + menuConfigList);
        $("#editMenuTbody").html("");
        var trHtml = "";
        if (menuConfigList) {
            for (var i = 0; i < menuConfigList.length; i++) {
                var name = menuList[i].name;
                var sid = menuList[i].sid;
                var isShow = menuList[i].isShow;
                var alias = menuList[i].alias; //別名
                if (!alias) {
                    alias = "";
                }
                trHtml += "<tr style='cursor: pointer;' class='oneLevelMenuItem' edit_key_menu_id='" + sid + "'>" +
                    "<td class='oneLevelItem per35' a='0'  style='text-align: left;padding-left: 24px;'>" +
                    "<span class='oneLevelSpan' style='display: inline-block;height: 10px;padding-right: 12px;'>" +
                    "<span class='icon iconfont icon-xiala' style='font-size: 12px;padding-right: 10px;color: #a2cdf2;'></span>" + name + "</span>" +
                    "</td>" +
                    "<td class='per35 editMenuName'>" + "<input class='editMenuNameInput' type='text' style='height: 100%;width: 100%;margin: 0;padding: 0;border: 0;background: #347499;color: #fff;text-align: center;cursor: pointer;' value='" + alias + "'/>" + "</td>" +
                    "<td class='per30'>" + "<em class='checkbox-mine' value='" + isShow + "'>" + "</em>" + "</td>" +
                    "</tr>" +
                    "<tr class='sub-table-content' style='display: none;'>" +
                    "<td colspan='3'>" +
                    "<table class='sub-table'>" +
                    "<tbody id='" + "editChildList_" + i + "'>" +
                    "</tbody>" +
                    "</table>" +
                    "</td>" +
                    "</tr>";
            }
        }
        $("#editMenuTbody").append(trHtml); //生成一级菜单列表

        //查询二级菜单           生成二级菜单列表
        for (var l = 0; l < menuConfigList.length; l++) {
            var childListHtml = "";
            if (menuList[l].childList && menuList[l].childList.length > 0) {
                for (var j = 0; j < menuList[l].childList.length; j++) {
                    var childName = menuList[l].childList[j].name;
                    var childId = menuList[l].childList[j].id;
                    var childSid = menuList[l].childList[j].sid;
                    var childAlias = menuList[l].childList[j].alias; //別名
                    if (!childAlias) {
                        childAlias = "";
                    }
                    var classify = menuList[l].childList[j].classify;
                    var towLevelIsShow = menuList[l].childList[j].isShow;
                    childListHtml += "<tr class='editTwoLevelMenu' edit_key_menu_id='" + childSid + "'>" +
                        "<td class='per35 pl48' style='text-align: left;padding-left: 48px;color: #c6e5ff;font-size: 14px;'>" + childName + "</td>" +
                        "<td class='per35 editMenuName'>" + "<input type='text' style='height: 42px;width: 100%;margin: 0;padding: 0;border: 0;background: #347499;color: #fff;text-align: center;cursor: pointer;' value='" + childAlias + "'/>" + "</td>" +
                        "<td class='per30'>" + "<em class='checkbox-mine' value='" + towLevelIsShow + "'>" + "</em>" + "</td>" +
                        "</tr>";
                }
                var childListId = "editChildList_" + l;
                $("#" + childListId).append(childListHtml); //将二级菜单添加到一级菜单下
            }
        }


        //遍历复选框 ，如果 isShow value= 0,则复选框为不勾选状态
        $("#editMenuTbody").find("em").each(function (i, em) {
            var em = $(em);
            var value = em.attr("value");
            if (value == 0) {
                $(this).css("background", "#48a0dc");
            } else {
                $(this).css("background", "#48a0dc url(/src/images/common/query-check.png) no-repeat right center");
            }
        })
    }

    $(document).on("click", ".editMenuName", function () {
        $(".editMenuName").find("input").css("background", " #347499"); //先清除所有 背景颜色，再为点击的元素添加 背景颜色
        $(this).find("input").css("background", " #1c628a");
    });

    //编辑菜单   点击一级菜单，下拉显示二级菜单
    $(document).on("click", '.oneLevelMenuItem .oneLevelItem', function () {
        if ($(this).parent().next().find("tr").length > 0) { //判断一级菜单下 是否有 二级菜单
            $(this).parent().next().toggle(); //点击此列， 收缩二级菜单
        }
        var aTest = $(this).attr("a");
        if (parseInt(aTest) == 0) {
            //$(this).find(".oneLevelSpan").css({
            //    "background": "url(../src/images/common/navbar/nav-arrow-d.png) no-repeat",
            //    "width": "10px"
            //});
            $(this).attr("a", 1);
        } else {
            //$(this).find(".oneLevelSpan").css({
            //    "background": "url(../src/images/common/navbar/nav-arrow-l.png) no-repeat",
            //    "width": "11px"
            //});
            $(this).attr("a", 0);
        }
    });

    // 点击编辑菜单保存按钮，保存当前菜单栏
    $("#editContentSaveBtn").click(function () {
        saveEditMenuSetting(); //保存编辑菜单
    });

    // 点击编辑菜单取消按钮，取消操作，关闭显示区域
    $("#editContentCancelBtn").click(function () {
        $("#editMenuContent").hide();
    });

    //点击注销
    $("#batchFollowUpDiv").on("click", function () {
        exitCancellation();
    });


    //点击 slide-nav 按钮，切换界面布局 横向/纵向
    $(".slide-nav").click(function () {
        $("#sidebar").toggle();
        var display = $('#sidebar').css('display'); //获取左侧菜单是否 显示
        if (display == 'none') {
            getHeadMenu(menuConfigListResult); //显示头部菜单
        }
        if (display !== 'none') {
            getMenu(menuConfigListResult); //显示左侧菜单
        }
    });


    //点击菜单栏，显示子菜单栏 左侧菜单
    $(document).on("click", '.nav-list .nav-title', function () {
        $(this).parent().siblings().find("ul").css("background", "#dee8ee");
        $(this).parent().find("ul").css("background", "#cad9e2");
        var a = $(this).attr("a");
        if (parseInt(a) == 0) {
            $(this).parent().find(".nav-child-list").show();
            $(this).find(".icon-ios-arrow-forward").removeClass("icon-ios-arrow-forward").addClass("icon-ios-arrow-down"); //修改箭头方向
            $(this).attr("a", 1);
        } else {
            $(this).parent().find(".nav-child-list").hide();
            $(this).find(".icon-ios-arrow-down").removeClass("icon-ios-arrow-down").addClass("icon-ios-arrow-forward");
            $(this).attr("a", 0);
        }
    });

    $(document).on("click", ".nav-item-a span", function () {
        //记录当前页签二级菜单 key_menu_id   方便刷新的时候展开此菜单
        var select_menu_id = $(this).attr("key_menu_id");
        localStorage.setItem("select_menu_id", select_menu_id);

        $(".nav-item-a span").removeClass("sider-active");
        $(".homePage").removeClass("sider-active"); //如果是在首页则清除首页页签的颜色
        $(this).addClass("sider-active");
    });

    /***首页显示***/
    $(document).on("click", ".homePage", function () {
        $(".index-content").html("");
        srcUrl = './cloud/menu/homePage.html';
        $(".index-content").append('<iframe id="f_homePage" name="content_iframe" class="content_iframe_s" src="' + srcUrl + '" width="100%" height="100%" frameborder="0"></iframe>');
        localStorage.setItem("srcUrl", ""); //初始化srcUrl  在login。js中设置，如果 srcUrl=""，则默认跳转到首页界面，如果点击首页，则重置srcUrl=""，刷新时也停留在首页界面


        //清除前面 页签二级菜单 的颜色
        $(".nav-item-a").find("span").removeClass("sider-active");
    });


    //保存添加菜单信息
    function saveMenuSetting() {
        var setting = {};
        $("#addMainMenuList .addMenuListItem").each(function (i, obj) {
            obj = $(obj);
            var showMenu = false;
            var menuId = obj.attr("key_menu_id");
            var oneLevelIsShow = obj.children("em").attr("value"); //获取是否显示的值   0/1
            if (menuId) {
                setting[menuId] = {
                    mark: i,
                    isShow: oneLevelIsShow
                };
                obj.find("li").each(function (j, child) {
                    child = $(child);
                    //var isShow =0;
                    //if(child.find(".checkbox-mine-ed").length>0){
                    //    isShow=1;
                    //}
                    var childMenuId = child.attr("key_menu_id");
                    var twoLevelIsShow = child.children("em").attr("value");
                    if (childMenuId) {
                        setting[childMenuId] = {
                            mark: (((i + "100") * 1) + j),
                            isShow: twoLevelIsShow
                        }
                    }
                });
            }
        });
        $.post(ctx + "/cloud/userUiConfig/saveConfig", {
            setting: JSON.stringify(setting),
            tableId: "1100",
            id: menuSettingConfigId,
            type: "MENU_SETTING"
        }, function (data) {
            if (data.result = "Success") {
                //tipsMsg("保存成功","SUCCESS");
                $("#addMenuContent").hide(); //关闭模态框，刷新界面
                window.location.href = 'index.html';
                //queryInformation();   //查询首页 返回的信息
            } else {
                //configSubmit.removeAttr("disabled"); //移除disabled属性
            }
        });
    }


    //保存编辑菜单信息
    function saveEditMenuSetting() {
        var setting = {};
        $("#editMenuTbody tr.oneLevelMenuItem").each(function (i, obj) { //tbody下的tr
            obj = $(obj);
            var showMenu = false;
            var menuId = obj.attr("edit_key_menu_id");
            var onLevelAlias = obj.find("input").val(); //获取一级菜单  别名
            var oneLevelIsShow = obj.children("td").children("em").attr("value"); //获取是否显示的值   0/1
            //if(obj.next().find(".checkbox-mine-ed").length>=0){
            //    showMenu=true;
            //}  //如果一级菜单下 二级菜单 勾选中的长度大于0 ，则显示一级菜单
            if (menuId) {
                setting[menuId] = {
                    mark: i,
                    isShow: oneLevelIsShow,
                    alias: onLevelAlias
                };
                obj.next().find("tbody tr").each(function (j, child) {
                    child = $(child);
                    //var isShow =0;
                    //if(child.find(".checkbox-mine-ed").length>0){
                    //    isShow=1;
                    //}
                    var towLevelAlias = child.find("input").val(); //获取二级菜单  别名
                    var twoLevelIsShow = child.children("td").children("em").attr("value");
                    var childMenuId = child.attr("edit_key_menu_id");
                    if (childMenuId) {
                        setting[childMenuId] = {
                            mark: (((i + "100") * 1) + j),
                            isShow: twoLevelIsShow,
                            alias: towLevelAlias
                        }
                    }
                });
            }
        });

        $.post(ctx + "/cloud/userUiConfig/saveConfig", {
            setting: JSON.stringify(setting),
            tableId: "1100",
            id: menuSettingConfigId,
            type: "MENU_SETTING"
        }, function (data) {
            if (data.result = "Success") {
                //tipsMsg("保存成功","SUCCESS");
                $("#editMenuContent").hide(); //关闭模态框，刷新界面
                window.location.href = 'index.html';
                //queryInformation();   //查询首页 返回的信息
            } else {
                //configSubmit.removeAttr("disabled"); //移除disabled属性
            }
        });
    }

});


//点击左侧菜单  查询主界面右侧列表
function queryInformationInfo(_this) {
    var menu_type = "";
    var type = $(_this).attr("menu_type");
    var id = $(_this).attr("id");
    var menu_id = $(_this).attr("key_menu_id");
    var menu_left_id = $(_this).attr("menu_id");
    var menu_name = $(_this).attr("menu_name");
    var classify = $(_this).attr("classify");

    // currentMenuObjs = "aaa";
    utils.showLoadingContent("正在加载...", true);

    if (parseInt(type) == 0) {
        menu_type = "DEFINED"; //自定义菜单
        menuInfo(menu_id);
    }
    if (parseInt(type) == 1) {
        menu_type = "SYSTEM"; //系统菜单
    }

    //系统菜单
    if (menu_type == "SYSTEM") {
        var url = $(_this).attr("url");
        var tableId = $(_this).attr("tableId");
        if (menu_id && url) {
            if (url.indexOf("?") != -1) {
                menu_name = "&title_page=" + menu_name;
            } else {
                menu_name = "?title_page=" + menu_name;
            }
            var ifaSrc = ctx + "" + url.substring(1) + menu_name;
            openUrl(ifaSrc, "1", menu_name, menu_id);
        }
    }

    //自定义菜单
    /*   if(menu_type=="DEFINED"){
           var link_address = $(_this).attr("link_address");
           if(!link_address){
               link_address="1=1";
           }
           var ifaSrc = ctx+"/cloud/menu/"+menu_id+"?title_page="+menu_name;
           if(ifaSrc){
               openUrl(ifaSrc,"1",menu_name,menu_id);
               localStorage.setItem("select_menu_id",menu_id);
           }
       }else{
           //判断菜单类型 即是否是页面布局 列表 表单
           menuInfo(menu_id);
       }*/

    if (menu_type == "DEFINED") {
        menuInfo(menu_id);
    }
    // tableListData(menu_id);

    //var url =window.location.href;
    //alert(url)
}

function openUrl(url, type, menu_name, menu_id) {
    $(".index-content").html("");
    $(".index-content").append('<iframe id="f_' + menu_id + '" name="content_iframe" class="content_iframe_s" src="' + url + '" width="100%" height="100%" frameborder="0"></iframe>');
    utils.hideLoadingContent();
}


// 弹出框
// function utils.showLoadingContent(title,isIcon){
//     $(".loading-content").remove();
//     var currentIcon = "";
//     var titleIconStr = "";
//     if(isIcon){
//         currentIcon = "block";
//         titleIconStr = "";
//     }else{
//         currentIcon = "none;";
//         titleIconStr = "bottom:0px;top:0px;height:20px;";
//     }
//     var loadingContent = "<div class='loading-content'>"+
//          "<div class='loading-pop'>"+
//                 "<div class='loading-spinner' style='display:"+currentIcon+"'>"+
//                     "<div class='rect1'></div>"+
//                     "<div class='rect2'></div>"+
//                     "<div class='rect3'></div>"+
//                     "<div class='rect4'></div>"+
//                     "<div class='rect5'></div>"+
//                "</div>"+
//                "<div class='loading-title' style='"+titleIconStr+"'>"+title+"</div>"+
//          "</div>"+

//     "</div>";
//     $("body").append(loadingContent);
// }

// function utils.hideLoadingContent(){
//     $(".loading-content").remove();
// }


//菜单信息接口
function menuInfo(menu_id) {

    $.ajax({
        type: "GET",
        url: ctx + "/cloud/menu_v1/" + menu_id,
        async: true,
        dataType: "json",
        success: function (data) {
            utils.hideLoadingContent();
            console.log("菜单信息接口：" + JSON.stringify(data));
            if (data.result == "SUCCESS") {
                utils.hideLoadingContent();
                var triggerType = data.map.triggerType; //菜单类型 是否是页面布局 列表 表单  用Iframe跳到自己去布局的页面
                var triggerId = data.map.triggerId; //菜单对象ID
                var form_db = data.map.form_db; //获取form_db 
                var form_pm = data.map.form_pm; //获取form_pm
                localStorage.setItem("form_db", form_db);
                localStorage.setItem("form_pm", form_pm);
                // alert(form_pm)
                // alert(form_pm);
                console.log("triggerType", triggerType)
                var triggerName = "";
                if (data.map.menuObj) {
                    triggerName = data.map.menuObj.name;
                }
                console.log("triggerType", triggerType) //菜单类型 是否是页面布局 列表 表单  用Iframe跳到自己去布局的页面
                var triggerId = data.map.triggerId; //菜单对象ID  列表的id
                var menuId = data.map.menuObj.sid;
                // var triggerId = data.map.menuObj.sid; //菜单对象ID
                // var triggerId = data.map.menuObj.id; //菜单对象ID
                console.log("triggerId", triggerId)

                //根据不同的 菜单类型 调用不同的接口，主界面显示不同的 布局
                if (triggerType == "TABLE_LIST" || "REPORT") { //列表
                    // alert(222);
                    tableListData(menuId, triggerId, triggerName); //查询列表
                    // tableListData(menu_id,triggerName); //查询列表
                }
                if (triggerType == "PAGE_LAYOUT") {
                    pageLayoutData(triggerId, triggerName); //查询 页面布局
                }
                if (triggerType == "TABLE_TEAM") {
                    tableTeamData(menuId, triggerId, triggerName); //查询 表格组
                    // tableListData(menuId,triggerId,triggerName); //查询列表
                }
                if (triggerType == "CALENDAR") {
                    calendarData(triggerId, triggerName); //查询 日历组件
                }
                if (triggerType == "FORM") {
                    formData(triggerId, triggerName); //查询表单
                }

                if (srcUrl) {
                    //openUrl(srcUrl,"1",menu_name,menu_id);
                    localStorage.setItem("select_menu_id", menu_id);
                    localStorage.setItem("srcUrl", srcUrl);
                }
            }
        },
        error: function (data) {
            console.log("加载首页接口的 失败：" + data);
        }
    });
}

//列表信息接口
function tableListData(menuId, tableId, triggerName) {
    $(".index-content").html("");
    srcUrl = './cloud/menu/tableList.html?id=' + tableId + '&title=' + triggerName + '&menuId=' + menuId + '&name=tableList';
    // console.log("srcUrl",srcUrl);  
    $(".index-content").append('<iframe id="f_' + tableId + '" name="content_iframe" class="content_iframe_s" src="' + srcUrl + '" width="100%" height="100%" frameborder="0"></iframe>');
    utils.hideLoadingContent();
}
//自定义接口
function pageLayoutData(menuId, tableId, triggerName) {
    $(".index-content").html("");
    srcUrl = './cloud/menu/pageLayout.html?id=' + tableId + '&title=' + triggerName + '&pageLayoutId=' + menuId + '&name=pageLayout';
    $(".index-content").html('<iframe id="f_' + tableId + '" name="content_iframe" class="content_iframe_s" src="' + srcUrl + '" width="100%" height="100%" frameborder="0"></iframe>');
    utils.hideLoadingContent();
}

//表格组信息接口
function tableTeamData(tableId, menuId, triggerName) {
    $(".index-content").html("");
    srcUrl = './cloud/menu/tableList.html?id=' + tableId + '&title=' + triggerName + '&menuId=' + menuId + '&name=tableTeam';
    $(".index-content").append('<iframe id="f_' + tableId + '" name="content_iframe" class="content_iframe_s" src="' + srcUrl + '" width="100%" height="100%" frameborder="0"></iframe>');
    utils.hideLoadingContent();
}

//日历组件信息接口
function calendarData(id, triggerName) {
    $(".index-content").html("");
    srcUrl = './cloud/menu/calendar.html?id=' + id + '&title=' + triggerName + '';
    $(".index-content").append('<iframe id="f_' + id + '" name="content_iframe" class="content_iframe_s" src="' + srcUrl + '" width="100%" height="100%" frameborder="0"></iframe>');
    return;

    $.ajax({
        type: "GET",
        url: ctx + "/cloud/menu_v1/calendar/" + id,
        async: true,
        dataType: "json",
        success: function (data) {
            console.log("日历组件接口:" + JSON.stringify(data));
            if (data.result == "SUCCESS") {

            }
        },
        error: function (data) {
            console.log("加载首页接口的 失败：" + data);
        }
    })
}

//表单息接口
function formData(id) {
    $.ajax({
        type: "POST",
        url: ctx + "/cloud/form/handler/getForm/obj",
        data: {
            formId: id
        },
        async: true,
        dataType: "json",
        success: function (data) {
            console.log("表单信息接口:" + JSON.stringify(data));
            if (data.result == "SUCCESS") {

            }
        },
        error: function (data) {
            console.log("加载首页接口的 失败：" + data);
        }
    })
}


function menuMove() {
    //菜单拖动
    $("#addMainMenuList").sortable({
        cursor: "pointer", //鼠标样式
        items: ".addMenuListItem", //要拖动的元素
        opacity: 0.6, //透明度
        delay: 10, //时长
        sort: true, //是否排序
        disabled: false,
        revert: false, //释放时，增加动画
        stop: function (event, ui) { //鼠标停止拖动的时候
        }
    });
    $("#addMainMenuList").disableSelection();
    $("#addMainMenuList .addMenuListItem").each(function (i, obj) {
        obj = $(obj);
        if (obj.find("li").length > 1) {
            var tageObj = $(obj.find(".addContentChildList")[0]);
            tageObj.sortable({
                cursor: "pointer", //鼠标样式
                items: "li", //要拖动的元素
                opacity: 0.6, //透明度
                delay: 10, //时长
                sort: true, //是否排序
                disabled: false,
                revert: false, //释放时，增加动画
                stop: function (event, ui) { //鼠标停止拖动的时候
                }
            });
            tageObj.disableSelection();
        }
    });
}

//注销
function exitCancellation() {
    $.ajax({
        type: "GET",
        // url:"/crmweb/cloud/sysUser_v1/exit",
        url: ctx + "/cloud/sysUser/exit",
        dataType: "json",
        success: function (data) {
            if (data.result == "SUCCESS") {
                clearAllCookie();
                window.location.href = 'login.html';
            } else {
                alert(data.resultMsg);
            }
        }
    })
}

//查询菜单信息
function queryMenuInfo(_this) {
    var id = $(_this).attr("id");
    var sId = $(_this).attr("key_menu_id");
    $.ajax({
        type: "GET",
        url: ctx + "/cloud/menu_v1/" + sId, //加载首页接口
        dataType: "json",
        success: function (data) {
            console.log("菜单信息：" + JSON.stringify(data));
            if (data.result == "SUCCESS") {

            }

        },
        error: function (data) {
            console.log("菜单信息： 失败：" + data);
        }
    })
}

//头部
function showUpdatePwdModal() {
    //$("#form30").find("[name=reset]").trigger('click');
    //$("#form30").find("[name=id]").val(userId);
    $("#myModal30").modal();
}

function updatePwd() {
    var id = $("#form30").find("[name=id]").val();
    var pwd = $("#form30").find("[name=pwd]").val();
    var pwd1 = $("#form30").find("[name=pwd1]").val();
    var pwd2 = $("#form30").find("[name=pwd2]").val();
    //
    //if(!pwd){
    //
    //    Notify("密码不能为空!", 'top-right', '5000', 'danger', 'fa-bolt', true);
    //    return;
    //}
    //
    //if(!pwd1){
    //    Notify("新密码不能为空!", 'top-right', '5000', 'danger', 'fa-bolt', true);
    //    return;
    //}
    //
    //if(!pwd2){
    //    Notify("确认密码不能为空!", 'top-right', '5000', 'danger', 'fa-bolt', true);
    //    return;
    //}
    //
    //if(pwd1!=pwd2){
    //    Notify("密码不一致!", 'top-right', '5000', 'danger', 'fa-bolt', true);
    //    return;
    //}
    //$(".loading").show();
    $.ajax({
        type: "post",
        url: ctx + "/cloud/sysUser/updatePwd",
        data: {
            pwd: pwd,
            pwd1: pwd1,
            userId: userId
        },
        dataType: "text",
        async: false,
        success: function (data) {
            //$(".loading").hide();
            //if(data){
            //    Notify(data, 'top-right', '5000', 'danger', 'fa-bolt', true);
            //}else{
            //
            //    Notify('更新成功', 'top-right', '5000', 'success', 'fa-check', true);
            $("#myModal30").modal("hide");
            //}

        }
    });
}