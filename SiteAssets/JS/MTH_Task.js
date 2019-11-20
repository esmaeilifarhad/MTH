var _Id = 0
var CurrentCID = 0;
var CurrentPID = 0;
var CurrentName = ""
var CurrentDep = ""
var CurrentPLoginName = ""

var _UserInGroupos = []
var _checkedItem = []
/*
List Name :
GIG_MTH_Request
GIG_MTH_Details
GIG_MTH_Confirm
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

    /*
    for (let index = 1300; index < 1370; index++) {
        deleteRecord(index);
       
    }
    */
    
    showCartabl();

});

//-------------------------------------------------------

function showMessage(message) {
    $("#message p").remove()
    // setTimeout(function () { $("#message p").remove() }, 5000);
    $("#message").append("<p class='message'>" + message + "</p>");
}
async function showCartabl() {
    $("#tableres2 table  .rowData").remove()
    //---------------------
    var GIG_MTH_Details;
    var GIG_MTH_Confirm = await GetGIG_MTH_Confirm();
    var CurrentUserinGroups = await getCurrentUserinGroups();
    //---------------------
    //create filter
    var filterGIG_MTH_Details = ""
    var filterstep = ""
    //آیا کاربر در گروه مشاهده همه میباشد
    //اگر باشد باید همهی رکورد ها را مشاهده نماید
    var isExist = CurrentUserinGroups.find(x => x.ID === 649)
    if (isExist != undefined) {
        GIG_MTH_Details = await GetGIG_MTH_Details("admin", "admin")
    }
    else {
        for (let index = 0; index < GIG_MTH_Confirm.length; index++) {

            var res = CurrentUserinGroups.find(x => x.ID === GIG_MTH_Confirm[index].ConfirmationId);
            if (res != undefined /*&&  GIG_MTH_Confirm[index].DepId!=null*/) {
                if (GIG_MTH_Confirm[index].DepId != null) {
                    filterGIG_MTH_Details += "  (MasterId/DepId eq '" + GIG_MTH_Confirm[index].DepId + "') or";
                }

                filterstep += "(step eq " + GIG_MTH_Confirm[index].Step + ") or "
            }
        }

        //---------------------delete last 4 char for remove or
        if (filterGIG_MTH_Details != "") {
            filterGIG_MTH_Details = "(" + filterGIG_MTH_Details.substring(0, filterGIG_MTH_Details.length - 3) + ")";
        }
        if (filterstep != "") {
            filterstep = "(" + filterstep.substring(0, filterstep.length - 3) + ")";
        }
        GIG_MTH_Details = await GetGIG_MTH_Details(filterGIG_MTH_Details, filterstep)
    }

    if (GIG_MTH_Details == "null") {
        $("#tableres2 table").append("<tr class='rowData'><td colspan=9>موردی برای مشاهده وجود ندارد</td></tr>");
    }
    else {
        var table = ""
        for (let index = 0; index < GIG_MTH_Details.length; index++) {
            table += "<tr class='rowData' Data_Id=" + GIG_MTH_Details[index].ID + ">"
            table += "<td >"
            table += GIG_MTH_Details[index].step
            table += "</td>"
            table += "<td col='pdpDark'>"
            table += (index + 1)
            table += "</td>"
            table += "<td col='pdpDark'>"
            table += GIG_MTH_Details[index].MasterId.Title
            table += "</td>"
            table += "<td col='pdpDark'>"
            table += GIG_MTH_Details[index].MasterId.DepName
            table += "</td>"
            table += "<td col='DayOfWeek'>"
            table += GIG_MTH_Details[index].Date
            table += "</td>"
            table += "<td col='DayOfWeek'>"
            table += calDayOfWeek(GIG_MTH_Details[index].Date)
            table += "</td>"
            table += "<td col='description'>"
            table += GIG_MTH_Details[index].Dsc
            table += "</td>"
            table += "<td col='isFood'>"
            table += (GIG_MTH_Details[index].IsFood == true) ? "<span style='color:green' class='fa fa-check  pointer'></span>" : "<span style='color:red' class='fa fa-remove  pointer'></span>"
            table += "</td>"
            table += "<td>"
            table += "<input type=checkbox Data_Id=" + GIG_MTH_Details[index].ID + " />"
            table += "</td>"
            // table += "<td col='remove'><span style='color:mediumvioletred' class='fa fa-remove RemoveWord pointer' onclick='removeRow(this," + _Id + ")'></span></td>"
            table += "</tr>"
        }
        $("#tableres2 table").append(table);
    }

}
//-------------------------------------------------------

function GetGIG_MTH_Details(filterGIG_MTH_Details, filterstep) {
    return new Promise(resolve => {
        debugger
        var filterStatusWF
        if (filterGIG_MTH_Details == "admin") {
            filterStatusWF = "(StatusWF eq 'درگردش')";
        }
        else if (filterGIG_MTH_Details == "" && filterstep == "") {
            resolve("null");
            return
        }
        else {
            if (filterGIG_MTH_Details == "") {
                filterStatusWF = "(StatusWF eq 'درگردش')" + " and " + filterstep
            }
            else {
                filterStatusWF = "(StatusWF eq 'درگردش')" + " and " + filterGIG_MTH_Details + " and " + filterstep
            }

        }
        console.log(filterStatusWF)


        $pnp.sp.web.lists.
            getByTitle("GIG_MTH_Details").
            items.select("MasterId/Id,MasterId/Title,MasterId/Personelid,MasterId/DepName,Id,Title,Dsc,IsFood,Date,step").top(1000).
            expand("MasterId").
            // filter("(StatusWF eq 'درگردش') and (" + filterGIG_MTH_Details + ") and (" + filterstep + ")").
            // filter("(StatusWF eq 'درگردش') and (  (MasterId/DepId eq '289') or  (MasterId/DepId eq '284') ) ").
            filter(filterStatusWF).
            // orderBy("Modified", true).
            get().
            then(function (items) {
                debugger
                if (items.length == 0) {
                    resolve("null")
                }
                else {
                    resolve(items);
                }
            });
    });
}
function GetGIG_MTH_Confirm() {
    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_MTH_Confirm").
            items.select().
            // expand("MasterId").
            //filter("(StatusWF eq 'درگردش')").
            // orderBy("Modified", true).
            get().
            then(function (items) {
                resolve(items);
            });
    });
}
function getCurrentUserinGroups() {
    return new Promise(resolve => {
        var endpointUrl = _spPageContextInfo.webServerRelativeUrl + '/_api/web/currentuser/?$expand=groups';
        return $.ajax({
            url: endpointUrl,
            method: "GET",
            contentType: "application/json;odata=verbose",
            headers: { "Accept": "application/json;odata=verbose" },
            success: function (data) {

                for (let index = 0; index < data.d.Groups.results.length; index++) {
                    _UserInGroupos.push({ ID: data.d.Groups.results[index].Id, Title: data.d.Groups.results[index].Title })
                    // resolve(userGroups)
                    // console.log(userGroups[index].Title+" - "+userGroups[index].Id);
                    //  console.log("***********************");
                }
                resolve(_UserInGroupos)
            },
            error: function (data) {
                console.log(JSON.stringify(data));
            }

        });
    })
}
function updateGIG_MTH_Details(id, type, step) {
    debugger
    var StatusWF = ""
    var varStep = 0
    debugger
    if (type == "yes" && step == 2) {
        StatusWF = "خاتمه یافته"
        varStep = 3
    }
    else if (type == "yes" && step == 1) {
        StatusWF = "درگردش"
        varStep = 2
    }
    else if (type == "no") {
        StatusWF = "تایید نشده"
        varStep = 0
    }
    else {
        StatusWF = "else"
        varStep = 0
    }

    return new Promise(resolve => {
        var list = $pnp.sp.web.lists.getByTitle("GIG_MTH_Details");
        list.items.getById(id).update({
            step: varStep,
            StatusWF: StatusWF,
        }).then(function (item) {
            resolve(item)
            // console.log(item);
        });

    })
    /*
    if (type = "no") {
        return new Promise(resolve => {
            var list = $pnp.sp.web.lists.getByTitle("GIG_MTH_Details");
            list.items.getById(id).update({
                step: 0,
                StatusWF: "تایید نشده",
            }).then(function (item) {
                resolve(item)
                // console.log(item);
            });

        })
    }
    */
}
function getGIG_MTH_DetailsById(id) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_MTH_Details").items.getById(id).get().then(function (item) {
            resolve(item);
        });
    });
}
//Delete
function deleteRecord(id) {
    return new Promise(resolve => {
    var list = $pnp.sp.web.lists.getByTitle("GIG_MTH_Request");

    list.items.
   // top(20).
    getById(id).
    delete().
    then(function (item) {
        debugger
       // Console.log("item has been deleted");
    }, function (data) {
        //Console.log("error: " + data);
    });
});
}

//-----------------------------
async function confirm() {
    $("#tableres2 table tr td input").each(function () {
        if ($(this).context.checked == true) {
            _checkedItem.push({ ID: $(this).attr("data_id") })
        }
    })
    for (let index = 0; index < _checkedItem.length; index++) {
        debugger
        var GIG_MTH_Detail = await getGIG_MTH_DetailsById(_checkedItem[index].ID);
        var res = await updateGIG_MTH_Details(_checkedItem[index].ID, "yes", GIG_MTH_Detail.step)
    }
    _checkedItem = [];
    showCartabl();
    // alert("confirm")
}
async function reject() {
    $("#tableres2 table tr td input").each(function () {
        if ($(this).context.checked == true) {
            _checkedItem.push({ ID: $(this).attr("data_id") })
        }
    })
    for (let index = 0; index < _checkedItem.length; index++) {
        var GIG_MTH_Detail = await getGIG_MTH_DetailsById(_checkedItem[index].ID);
        var res = await updateGIG_MTH_Details(_checkedItem[index].ID, "no", GIG_MTH_Detail.step)
    }
    _checkedItem = [];
    showCartabl();
}
//--------------------------
function calDayOfWeek(date) {
    if (date == "98/08/05") {
        debugger
    }
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
function foramtDate(str) {
    return str.slice(0, 2) + "/" + str.slice(2, 4) + "/" + str.slice(4, 6)
}
function splitString(str) {
    return str.split(";#")
}
//-----------------------
