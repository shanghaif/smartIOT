//别的地图JS中方法,必须要包含的有
//initmap,clearMap,addMarker,ShowOrHideDeviceInfo,clearAllMap,HideDeviceName
//其余地图JS方法名和功能,和这里面一致.

var myGeo = null;
var myDis = null;

function initmap() {
    initBaiduMap2(0, 0, 0);

    map.addEventListener("click", function (e) {
        var latLng = new BMap.Point(e.point.lng, e.point.lat);
        addMarkerGeofence(latLng);
    });
}

var MrkArr = new Array(); //设备弹出框信息数组

//清除地图
function clearMap() {
    if (map) {
        map.clearOverlays();
    }
    MrkArr.length = 0;
}

function zoomIn() {
    if (map) {
        map.zoomIn();
    }
}

function zoomOut() {
    if (map) {
        map.zoomOut();
    }
}

function mapDistance() {

    if (myDis) {
        myDis.open();
    }
}

function mapFull() {
    if (map) {
        var point = new BMap.Point(110.12323, 31.123232);
        map.centerAndZoom(point, 6);  
    }
}

function mapClear() {

}

function clearGeoMap() {
    if (map) {
        for (var i = 0; i < markersGeo.length; i++) {
            map.removeOverlay(markersGeo[i]);
        }
        map.removeOverlay(polygon);

    }
}

var markersGeo = [];
var pointsGeo = [];
function addMarkerGeofence(point) {

    if (isShowPoly && !isClkMarker) {
        pointsGeo.push(point);
        pointsStr.push(point.lat + "," + point.lng); 
        var squIcon = "/img/map/square.png";
        var sIcon = new BMap.Icon(squIcon, new BMap.Size(11, 11));
        var squMarker = new BMap.Marker(point, { icon: sIcon });
        squMarker.setOffset(new BMap.Size(0, 0))
        map.addOverlay(squMarker);
        markersGeo.push(squMarker);
        addBaiduClkListenerGeo(squMarker);
        drawPoly();
    }
    isClkMarker = false;
}

function addBaiduClkListenerGeo(marker, d) {
    try {
        marker.addEventListener("click", function () {
            isClkMarker = true;
            var n = 0;
            for (n = 0; n < markersGeo.length; n++) {
                if (markersGeo[n] == marker) {
                    map.removeOverlay(marker);
                    break;
                }
            }
            markersGeo.splice(n, 1);
            pointsGeo.splice(n, 1);
            pointsStr.splice(n, 1);
            drawPoly();
        });
    } catch (ex) { }

}
var polygon = null;
function drawPoly() {
    if (polygon) {
        map.removeOverlay(polygon);
    }
    polygon = new BMap.Polygon(pointsGeo, { strokeColor: "#0000ff", strokeWeight: 2, strokeOpacity: 0.8, fillColor: "#00CCFF", fillOpacity: 0.35 });
    map.addOverlay(polygon);

}


//显示POI
function showPOIInMap() {
    for (var i = 0; i < poiJson.poiArr.length; i++) {

        var point = new BMap.Point(poiJson.poiArr[i].longitude, poiJson.poiArr[i].latitude);
        var icon = "icons/startstr.png";
        var sIcon = new BMap.Icon(icon, new BMap.Size(20, 34));
        marker = new BMap.Marker(point, { icon: sIcon });
        map.addOverlay(marker);
        var label = new BMap.Label(poiJson.poiArr[i].name, { offset: new BMap.Size(-3, 22) });
        marker.setLabel(label);
    }
}

//清除单个
function MapRemoveOneMrk(DeviceID) {
    var mrk = MrkArr[DeviceID];
    if (mrk == undefined) {
        return;
    }
    //清除设备标识
    if (mrk.Curmrk != undefined) {
        mrk.Curmrk.setMap(null);
    }
    //清除设备名
    if (mrk.PopupMarDeviceName != undefined) {
        mrk.PopupMarDeviceName.setMap(null);
        mrk.PopupMarDeviceName = undefined;
    }
    MrkArr[DeviceID] = undefined;

}
//添加地标
function addMarker(data) {

    if (data.baiduLat == "") {
        return;
    }
    // alert(data.id);
    //设置数据
    if (MrkArr[data.id] == undefined) {
        MrkArr[data.id] = new Object();
    }
    MrkArr[data.id].data = data; 
    var ct = new BMap.Point(data.baiduLng, data.baiduLat);
    if (parent.isSetMapCenter) {
        if (parseInt(data.baiduLat) == -1 && parseInt(data.baiduLng) == -1) {

        } else {
            map.centerAndZoom(ct, 8);
            parent.isSetMapCenter = false;

            if (parent.initIsSelDevice) {
                parent.firstDeviceID = data.id;
                parent.initIsSelDevice = false;
            }
        }
    }
    //最后一次中心位置 
    var icon = GetBaiduIcon(data.icon, data.status, data.course);
    if (MrkArr[data.id].Curmrk != undefined) {
        MrkArr[data.id].Curmrk.setPosition(ct);
        MrkArr[data.id].Curmrk.setIcon(icon);
    } else {
        MrkArr[data.id].Curmrk = new BMap.Marker(ct, { icon: icon, title: data.name });
        MrkArr[data.id].Curmrk.setOffset(new BMap.Size(0, -10))
        map.addOverlay(MrkArr[data.id].Curmrk);
        //显示信息框
        MrkArr[data.id].Curmrk.addEventListener("click", function () {
            ShowDeviceInfo(data.id);
            GetAddress(data.id);
        });
    }
    
    if (showPopupmarkerID != data.id) {
        //显示设备名
        if (isShowDeviceName) {
            if (MrkArr[data.id].PopupMarDeviceName == undefined) {
                ShowDeviceNameOnc(data.id);
            }
        } else {
        }
        if (MrkArr[data.id].PopupMarDeviceName != undefined) {
            var obj = { "position": ct };
            MrkArr[data.id].PopupMarDeviceName.update(obj);
        }
    } else {

        if (showPopupmarker) {
            var html = GetInfoWContx(MrkArr[data.id].data);
            var obj = { "position": ct, "text": html };
            showPopupmarker.update(obj);
        } else {
        }
    }
}


//显示设备信息
function ShowDeviceInfo(DeviceID, fun) {

    if (MrkArr[DeviceID] == undefined) {
        return;
    }
    if (showPopupmarker) {
        if (showPopupmarkerID != DeviceID) {
            showPopupmarker.setMap(null);
            ShowDeviceNameOnc(showPopupmarkerID);
        }
    }
    if (!showPopupmarker || showPopupmarkerID != DeviceID) {
        ShowDeviceInfoContext(DeviceID);
        //隐藏设备名
        HideDeviceNameOne(DeviceID);
        showPopupmarkerID = DeviceID;
    }
}


//隐藏设备弹出框
function HideDeviceInfo(DeviceID) {
    if (showPopupmarker) {
        showPopupmarker.setMap(null);
    }
    if (isShowDeviceName) {
        //显示设备名
        ShowDeviceNameOnc(DeviceID);
    }
    showPopupmarkerID = 0;
    showPopupmarker = null;
}

//切换用户时,使用,隐藏弹出框
function HidePopumarker() {
    if (showPopupmarker) {
        showPopupmarker.setMap(null);
    }
    showPopupmarkerID = 0;
    showPopupmarker = null;
}

//切换在线,离线时使用
function HideShowPopumarker() {
    if (showPopupmarker) {
        showPopupmarker.setMap(null);
    }
    showPopupmarker = null;
}

function ShowDeviceInfoContext(DeviceID) {
    var ct = new BMap.Point(MrkArr[DeviceID].data.baiduLng, MrkArr[DeviceID].data.baiduLat);
    showPopupmarker = new PopupMarker({ position: ct, map: map, icon: "/img/map/1px.png", text: GetInfoWContx(MrkArr[DeviceID].data), showpop: true });
    //百度地图放大到最大级别后,再点击,泡泡会在地图上混乱
    var zoom = map.getZoom();
    if (zoom > 17) {
        map.centerAndZoom(ct, 18);
    } else {
        map.panTo(ct);
    }
}

function HideDeviceInfoContext(DeviceID) {
    if (showPopupmarker) {
        showPopupmarker.setMap(null);
        showPopupmarker = null;
    }
    showPopupmarkerID = 0;
}


//显示设备名
function ShowDeviceName() {
    $(MrkArr).each(function (ind) {
        if (MrkArr[ind] != undefined) {
            ShowDeviceNameOnc(ind);
        }
    });
}
//显示单个设备名
function ShowDeviceNameOnc(ind) {
    //alert(ind);
    if (MrkArr.length > 0) {
        //MrkArr[ind] == undefined
        if (MrkArr[ind].PopupMarDeviceName != undefined) {
            HideDeviceNameOne(ind);
        }
        var ct = new BMap.Point(MrkArr[ind].data.baiduLng, MrkArr[ind].data.baiduLat);
        MrkArr[ind].PopupMarDeviceName = new PopupMarker({ position: ct, map: map, icon: "/img/map/1px.png", text: MrkArr[ind].data.name, showpop: true });
    }
}

//隐藏设备名
function HideDeviceName() {
    $(MrkArr).each(function (ind) {
        HideDeviceNameOne(ind);
    });
}
//隐藏单个设备名
function HideDeviceNameOne(ind) {
    if (MrkArr[ind] != undefined && MrkArr[ind].PopupMarDeviceName != undefined) {
        MrkArr[ind].PopupMarDeviceName.setMap(null);
    }
}

function setMapCenter(DeviceID) {
    var ct = new BMap.Point(MrkArr[DeviceID].data.baiduLng, MrkArr[DeviceID].data.baiduLat);
    if (map) {
        map.centerAndZoom(ct, 16); 
    }
}

function clearAllMap() {

    clearMap();
    MrkArr.length = 0;
}

/*
//Google地址解析
var geocoder = new google.maps.Geocoder();
//获取地址信息
function GetAddressByMap(id) {
if (!geocoder) {
geocoder = new google.maps.Geocoder();
}
var lat = 0;
var lng = 0;
for (var i = 0; i < parent.allDevices.devices.length; i++) {
var d = parent.allDevices.devices[i];
if (d.id == id) {
lat = d.latitude;
lng = d.longitude
break;
}
}
if (lat != 0) {
var latlng = new google.maps.LatLng(lat, lng);
geocoder.geocode({ 'latLng': latlng }, function (results, status) {
if (status == google.maps.GeocoderStatus.OK) {
if (results[1]) {
$("#divMarkerAddress").html(results[1].formatted_address);
} else {

}
} else {

}
});
}
}
*/
/*
//51地图位置解析,IE9下有BUG
//如要使用在MapApiControl中加载51地图的2个js文件
function GetAddressByMap(id) {
var reg = new LTRegoLoader();
var lat = 0;
var lng = 0;
for (var i = 0; i < parent.allDevices.devices.length; i++) {
var d = parent.allDevices.devices[i];
if (d.id == id) {
lat = d.latitude;
lng = d.longitude
break;
}
}
if (lat != 0) {
LTEvent.bind(reg, "loaded", reg, function (obj) {
$('#divMarkerAddress').html(obj.describe);
});
lng = parseFloat(lng) * 100000;
lat = parseFloat(lat) * 100000;
alert(lng + "  " + lat);
var point = new LTPoint(lng, lat);
reg.loadDescribe(point);
}
}*/


//百度地图解析
/*
function GetAddressByMap(id) {
if (!myGeo) {
myGeo = new BMap.Geocoder();
}
var lat = 0;
var lng = 0;
for (var i = 0; i < parent.allDevices.devices.length; i++) {
var d = parent.allDevices.devices[i];
if (d.id == id) {
lat = d.baiduLat;
lng = d.baiduLng
break;
}
}
if (lat != 0) {
// 根据坐标得到地址描述
myGeo.getLocation(new BMap.Point(lng, lat), function (result) {
if (result) {
$('#divMarkerAddress').html(result.address);
}
});
}
}
*/

//
var lastAddressLat = 0, lastAddressLng = 0;
function GetAddressByMap(id) {
    var lat = 0;
    var lng = 0;
    for (var i = 0; i < parent.allDevices.devices.length; i++) {
        var d = parent.allDevices.devices[i];
        if (d.id == id) {
            lat = d.baiduLat;
            lng = d.baiduLng
            break;
        }
    }
    if (lastAddressLat != lat || lastAddressLng != lng) {
        $('#divMarkerAddress').html("");
        GetAddressByGoome(lat, lng);
    }
    lastAddressLat = lat;
    lastAddressLng = lng;
}
