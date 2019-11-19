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


    showCartabl();

});

//-------------------------------------------------------

function showMessage(message) {
    $("#message p").remove()
    // setTimeout(function () { $("#message p").remove() }, 5000);
    $("#message").append("<p class='message'>" + message + "</p>");
}
async function showCartabl() {

    var GIG_MTH_Confirm = await GetGIG_MTH_Confirm();
    var CurrentUserinGroups = await getCurrentUserinGroups();

    //console.log(CurrentUserinGroups)
    var filterGIG_MTH_Details = ""
    for (let index = 0; index < GIG_MTH_Confirm.length; index++) {
        var res = CurrentUserinGroups.find(x => x.ID === GIG_MTH_Confirm[index].ConfirmationId);
        if (res != undefined) {
            filterGIG_MTH_Details += "  (MasterId/DepId eq '" + GIG_MTH_Confirm[index].DepId + "') or"
        }
    }

    //delete last 4 char for remove or
    filterGIG_MTH_Details = filterGIG_MTH_Details.substring(0, filterGIG_MTH_Details.length - 3)


    var GIG_MTH_Details = await GetGIG_MTH_Details(filterGIG_MTH_Details)
    if (GIG_MTH_Details == "" || GIG_MTH_Details == undefined) {
        $("#tableres2 table").append("<tr><td colspan=8>موردی برای مشاهده وجود ندارد</td></tr>");
    }
    else {
        var table = ""
        for (let index = 0; index < GIG_MTH_Details.length; index++) {
            table += "<tr Data_Id=" + GIG_MTH_Details[index].ID + ">"
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

function GetGIG_MTH_Details(filterGIG_MTH_Details) {
    // console.log(filterGIG_MTH_Details)

    if (filterGIG_MTH_Details == null || filterGIG_MTH_Details == "")
        return
    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_MTH_Details").
            items.select("MasterId/Id,MasterId/Title,MasterId/Personelid,MasterId/DepName,Id,Title,Dsc,IsFood,Date").top(1000).
            expand("MasterId").
            filter("(StatusWF eq 'درگردش') and (" + filterGIG_MTH_Details + ")").
            // orderBy("Modified", true).
            get().
            then(function (items) {
                // debugger
                resolve(items);
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
function updateGIG_MTH_Details(id, type) {
    if (type = "yes") {
        return new Promise(resolve => {
            var list = $pnp.sp.web.lists.getByTitle("GIG_MTH_Details");
            list.items.getById(id).update({
                step: 1,
            }).then(function (item) {
                resolve(item)
                // console.log(item);
            });

        })
    }
    if (type = "no") {
        return new Promise(resolve => {
            var list = $pnp.sp.web.lists.getByTitle("GIG_MTH_Details");
            list.items.getById(id).update({
                step: 0,
            }).then(function (item) {
                resolve(item)
                // console.log(item);
            });

        })
    }
}

//-----------------------------
async function confirm() {
    $("#tableres2 table tr td input").each(function () {
        //  console.log($(this))
        // console.log($(this).context.checked)
        // console.log($(this).init)
        if ($(this).context.checked == true) {
            _checkedItem.push({ ID: $(this).attr("data_id") })
        }
    })
    for (let index = 0; index < _checkedItem.length; index++) {
        console.log(_checkedItem[index].ID)
        var res = await updateGIG_MTH_Details(_checkedItem[index].ID, "yes")
    }

    // alert("confirm")
}
function reject() {
    $("#tableres2 table tr td input").each(function () {
        if ($(this).context.checked == true) {
            _checkedItem.push({ ID: $(this).attr("data_id") })
        }
    })
    for (let index = 0; index < _checkedItem.length; index++) {
        console.log(_checkedItem[index].ID)
        var res = await updateGIG_MTH_Details(_checkedItem[index].ID, "no")
    }
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
