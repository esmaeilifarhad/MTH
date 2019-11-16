var _Id = 0
var CurrentCID = 0;
var CurrentPID = 0;
var CurrentName = ""
var CurrentDep = ""
var CurrentPLoginName = ""

var _DetailsObjects = []
/*
List Name :
GIG_MTH_Request
GIG_MTH_Details
*/
$(document).ready(function () {
    //-----npm initial header Request
    $pnp.setup({
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
    //-------------
    CurrentCID = sessionStorage.getItem("CID");
    CurrentPID = sessionStorage.getItem("PID");
    CurrentName = sessionStorage.getItem("PFName");
    CurrentDep = sessionStorage.getItem("DName");
    CurrentPLoginName = sessionStorage.getItem("CurrentPLoginName");
    ShowIndividualprofile();
});
//----------------------
$("#pdpStartToday").persianDatepicker({
    startDate: "today",
    endDate: "1395/5/5"
});
$("jQuerySelectQuery").persianDatepicker({
    months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
    dowTitle: ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه"],
    shortDowTitle: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
    showGregorianDate: !1,
    persianNumbers: !0,
    formatDate: "YYYY/MM/DD",
    selectedBefore: !1,
    selectedDate: null,
    startDate: null,
    endDate: null,
    prevArrow: '\u25c4',
    nextArrow: '\u25ba',
    theme: 'default',
    alwaysShow: !1,
    selectableYears: null,
    selectableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    cellWidth: 25, // by px
    cellHeight: 20, // by px
    fontSize: 13, // by px
    isRTL: !1,
    calendarPosition: {
        x: 0,
        y: 0,
    },
    onShow: function () { },
    onHide: function () { },
    onSelect: function () { },
    onRender: function () { }
});
//-----------------
function removeRow(ss, Id) {
    //remove Item in Array
    for (var i = 0; i < _DetailsObjects.length; i++) {
        if (_DetailsObjects[i].ID === Id) {
            _DetailsObjects.splice(i, 1);
            i--;
        }
    }
    //remove tr element
    $($(ss).closest("tr")).remove();
}
function calDayOfWeek(date) {
    var mounth = ""
    var rooz = ""
    var arrayDate = date.split("/")
    mounth = (arrayDate[1] <= 9) ? "0" + arrayDate[1] : arrayDate[1]
    rooz = (arrayDate[2] <= 9) ? "0" + arrayDate[2] : arrayDate[2]

    date = arrayDate[0] + mounth + rooz;

    //date = date.replace(/\//g, '');
    date = date.substr(date.length - 6); // 13980203=> 980203

    const m = moment();
    const numberWeek = moment(date, 'jYYjMMjDD').weekday();
    let day;
    switch (numberWeek) {
        case 0:
            day = "یکشنبه";
            break;
        case 1:
            day = "دوشنبه";
            break;
        case 2:
            day = "سه شنبه";
            break;
        case 3:
            day = "چهارشنبه";
            break;
        case 4:
            day = "پنج شنبه";
            break;
        case 5:
            day = "جمعه";
            break;
        case 6:
            day = "شنبه";
    }
    return day;
}
async function save() {

    if (_DetailsObjects.length == 0) {
        showMessage("هیچ رکوردی برای ذخیره پیدا نشد.")
        return;
    }
    for (let index = 0; index < _DetailsObjects.length; index++) {
        var IsDuplicate = await GetGIG_MTH_Details(_DetailsObjects[index].pdpDark)
        if (IsDuplicate.length > 0) {
            showMessage("برای این روز " + _DetailsObjects[index].pdpDark + "  درخواست ثبت شده است")
            return;
        }
    }
    var GIG_MTH_Request = await CreateGIG_MTH_Request();
    for (let index = 0; index < _DetailsObjects.length; index++) {
        var GIG_MTH_Detail = await CreateGIG_MTH_Details(GIG_MTH_Request, _DetailsObjects[index]);
    }
    showMessage("درخواست شما با موفقیت ذخیره شد")
    $("#message").append("<a target='_blank' href='https://portal.golrang.com/_layouts/15/foodorder/foodorderpage.aspx'>لطفا برای اتخاب غذا کلیک نمایید</a>");
//
}
async function addDetail() {
    _Id += 1;
    var pdpDark = $("#pdpDark").val()
    var description = $("#description").val()
    var isFood = $("#isFood").prop("checked")


    var IsDuplicate = await GetGIG_MTH_Details(pdpDark)
    if (IsDuplicate.length > 0) {
        showMessage("برای این روز  "+pdpDark+" درخواست ثبت شده است")
        return;
    }
    var res = _DetailsObjects.find(x => x.pdpDark === pdpDark);
    if (res != undefined) {
        showMessage("درخواست تکراری نمیتوان ثبت کرد")
        return;
    }
    if (pdpDark == "" || pdpDark == null) {
        showMessage("لطفا تاریخ را مشخص نمایید")
        return;
    }
    if(($("#description").val().trim().length)<10){
                showMessage("توضیحات باید بیشتر از 10 کاراکتر باشد")
                return;
            }

        
    $("#message p").remove();
    _DetailsObjects.push({ ID: _Id, pdpDark: pdpDark, isFood: isFood, description: description })

    var table = ""
    table += "<tr Data_Id=" + _Id + ">"
    table += "<td col='pdpDark'>"
    table += pdpDark
    table += "</td>"
    table += "<td col='DayOfWeek'>"
    table += calDayOfWeek(pdpDark)
    table += "</td>"
    table += "<td col='description'>"
    table += description
    table += "</td>"
    table += "<td col='isFood'>"
    table += (isFood == true) ? "<span style='color:green' class='fa fa-check  pointer'></span>" : "<span style='color:red' class='fa fa-remove  pointer'></span>"
    table += "</td>"
    table += "<td col='remove'><span style='color:mediumvioletred' class='fa fa-remove RemoveWord pointer' onclick='removeRow(this," + _Id + ")'></span></td>"
    table += "</tr>"
    $("#tableres2 table").append(table);

}
//-------------------------------------------------------
async function ShowIndividualprofile() {
    $("#NameUser").next().remove();
    $("#PID").next().remove();
    $("#Department").next().remove();
    $("#Semat").next().remove();

    // var AzmayeshMaster = await GetAzmayeshMaster();
    //  showAzmayeshDetail(AzmayeshMaster);
    // showImage(AzmayeshMaster)

    $("#NameUser").after("<span>" + CurrentName + "</span>");
    $("#PID").after("<span>" + CurrentPID + "</span>");
    $("#Semat").after("<span>" + CurrentDep + "</span>");
    $("#Department").after("<span>" + CurrentDep + "</span>");

}
function showMessage(message) {
    $("#message p").remove()
    // setTimeout(function () { $("#message p").remove() }, 5000);
    $("#message").append("<p class='message'>" + message + "</p>");
}
//-------------------------------------------------------
function CreateGIG_MTH_Request() {
    var description = $("#description").val()
    var isFood = $("#isFood").prop("checked")
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_MTH_Request").items.add({
            Title: CurrentName,
            Personelid: CurrentPID,
            Description: description,
            DepName: CurrentDep,
            CID: CurrentCID,
            IsFinish: "درگردش",
            confirmUserId:641/*MTH_Confirm => group*/
        }).then(function (item) {
            console.log(item);
            resolve(item);
        });
    });
}
function CreateGIG_MTH_Details(GIG_MTH_Request, GIG_MTH_Details) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_MTH_Details").items.add({
            Title: CurrentName,
            StatusWF:"درگردش",
            Date: GIG_MTH_Details.pdpDark,
            IsFood: GIG_MTH_Details.isFood,
            Dsc: GIG_MTH_Details.description,
            MasterIdId: GIG_MTH_Request.data.Id
        }).then(function (item) {
            //console.log(item);
            resolve(item);
        });
    });
}
function GetGIG_MTH_Details(_Date) {

    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_MTH_Details").
            items.select().
            // expand("Azmayesh,MasterID").
            filter("(Date eq '" + _Date + "')").
            // orderBy("Modified", true).
            get().
            then(function (items) {

                resolve(items);
            });
    });
}
//-------------------------------------------------------
function foramtDate(str) {
    return str.slice(0, 2) + "/" + str.slice(2, 4) + "/" + str.slice(4, 6)
}
function splitString(str) {
    return str.split(";#")
}
//-----------------------
