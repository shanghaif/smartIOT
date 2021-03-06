

function AjaxGetExceptionMessage() {
    var UserId = $("#hidUserID").val();
    var TimeZone = $("#hidTimeZone").val();
    $.ajax({
        type: "post",
        url: "Ajax/ExceptionMessageAjax.asmx/GetExceptionMessageByUserID",
        contentType: "application/json",
        data: "{UserID:" + UserId + ",TimeZones:'" + TimeZone + "'}",
        dataType: "json",
        error: function (res) {
            //alert(res.responseText);
        },
        success: function (result) {

            if (result.d != "") {
                var json = eval("(" + result.d + ")");
                var size = json.ems.length;
                $("#spanMessageSize").html(size);
                writeExceptionMessageTable(json);
            }
        }
    });
}

function AjaxGetExceptionMessageByDeviceID() {

    var DeviceID = $("#hidDeviceID").val();
    var TimeZone = $("#hidTimeZone").val();
    $.ajax({
        type: "post",
        url: "Ajax/ExceptionMessageAjax.asmx/GetExceptionMessageByDeviceID",
        contentType: "application/json",
        data: "{DeviceID:" + DeviceID + ",TimeZones:'" + TimeZone + "'}",
        dataType: "json",
        error: function (res) {
            //alert(res.responseText);
        },
        success: function (result) {

            if (result.d != "") {
                var json = eval("(" + result.d + ")");
                var size = json.ems.length;
                $("#spanMessageSize").html(size);
                writeExceptionMessageTable(json);
            }
        }
    });
}

function showExceptionMessageDiv(t) {
    if (t == 0) {
        $("#divExceptionMessageDivInfo").css("display", "none");
        $("#divExceptionMessageDiv").css("height", "25px");
        var h = $(this).height() - 30;
        var w = $(this).width() - 410;
        $("#divExceptionMessageDiv").animate({ left: w + "px", top: h + "px", width: 400 + "px" }, 300);
    } else {
        $("#divExceptionMessageDivInfo").css("display", "block");
        $("#divExceptionMessageDiv").css("height", "150px");
        var h = $(this).height() - 160;
        var w = $(this).width() - 570;
        $("#divExceptionMessageDiv").animate({ left: w + "px", top: h + "px", width: 560 + "px" }, 300);

    }
}

function writeExceptionMessageTable(json) {
    var isPlayAlarmSound = false;
    var divExceptionMessageDivInfoScrollTop = document.getElementById("divExceptionMessageDivInfo").scrollTop;
    var UserId = $("#hidUserID").val();
    var html = [];
    html.push('<table width="100%" border="0">');
    html.push('<tr><td>' + allPage.deviceName + '</td><td>' + allPage.imeiNo + '</td><td>' + warnMessagePage.alarmType + '</td>');
    html.push('<td>' + warnMessagePage.alarmTime + '</td><td>' + allPage.positionTime + '</td><td>' + allPage.modelName + '</td><td>' + allPage.operation + '</td></tr>');
    for (var i = 0; i < json.ems.length; i++) {
        isPlayAlarmSound = true;
        html.push('<tr>');
        html.push('<td>' + json.ems[i].name + '</td>');
        html.push('<td>' + json.ems[i].sn + '</td>');
        var emType = getExceptionMessageType(json.ems[i].notificationType, json.ems[i].note);
        html.push('<td>' + emType + '</td>');
        html.push('<td>' + json.ems[i].createDate + '</td>');
        html.push('<td>' + json.ems[i].deviceDate + '</td>');
        html.push('<td>' + json.ems[i].model + '</td>');
        html.push('<td><a href="javascript:void(0);" onclick="ajaxClearException(' + json.ems[i].id + ',' + UserId + ')">' + allPage.clear + '</a></td>');
        html.push('</tr>');
    }
    html.push('</table>');

    $("#divExceptionMessageDivInfo").html(html.join(''));
    document.getElementById("divExceptionMessageDivInfo").scrollTop = divExceptionMessageDivInfoScrollTop;

    var chkVal = document.getElementById('chkAlarm').checked; 
    if (chkVal) {
        if (isPlayAlarmSound) {
            changeBrowse(0);
        } else {
            changeBrowse(1);
        }
    }
}

function ajaxClearException(id, userID) {

    $.ajax({
        type: "post",
        url: "Ajax/ExceptionMessageAjax.asmx/ClearExceptionMessageByIDs",
        contentType: "application/json",
        data: "{IDs:'" + id + "',UserID:" + userID + "}",
        dataType: "json",
        success: function (result) {
            AjaxGetExceptionMessage();
        }
    });
}

//播放报警声音
//val=0,播放报警声音.val=1,停止播放报警声音.
function changeBrowse(val) {
/*
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (val == 0) {
            document.getElementById("bgss").src = "ALARM8.WAV";
        } else {
            document.getElementById("bgss").src = "";
        }
    } else {
        if (val == 0) {
            playOtherBrowse();
        } else {
            document.getElementById("divBjsy").innerHTML = "";
        }
    }*/

    if (val == 0) {
        playOtherBrowse();
    } else {
        document.getElementById("divBjsy").innerHTML = "";
    }

}
function playOtherBrowse() {
    var otherBro = "<embed src=\"ALARM8.swf\" quality=\"high\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" "
	 				+ "type=\"application/x-shockwave-flash\" 		width=\"0\" height=\"0\"></embed>";
    document.getElementById("divBjsy").innerHTML = otherBro;
}


function clkChangeAlarmSound(v) {

    if (v) {
        var size = parseInt($("#spanMessageSize").html());
        if (size > 0) {
            changeBrowse(0);
        }
    } else {
        changeBrowse(1);
    }
    document.getElementById('chkAlarm').checked = v;
}