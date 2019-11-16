var selectedTasks = [];// checkbox selected
var counterTaskUpdated = 0;
var portalAddress = _spPageContextInfo.webAbsoluteUrl;
var userid = _spPageContextInfo.userId;
var taskResult = ""; // variable for global resualt
var isAdmin = false;

SP.SOD.executeFunc('sp.js', 'SP.ClientContext');


$(document).ready(function () {
    CheckAdmin();
    kendoTab();
    ExportToExcel();
});

function ExportToExcel(){

    $("#excel").click(function(){
        
        $("#taskGrid").data("kendoGrid").saveAsExcel()

    })     
}

function alertError(errorMessage) {
    $.confirm({//Popup ekhtar baraye entekhabe hadeaghal yek task
        animationSpeed: 800,
        type: 'red',
        title: 'اخطار!',
        content: errorMessage,
        buttons: {
            تایید: function () {
                location.reload();
            }
        }
    });
}
// ***************************************Get Admin Users ************************************
function CheckAdmin() {
    $.ajax({
        url: portalAddress + "/_api/web/sitegroups/getbyId(481)/CanCurrentUserViewMembership", // تایید کنندگان درخواست مجوز حضور
        method: "GET",
        asyn: true,
        crossDomain: true,
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            isAdmin = data.d.CanCurrentUserViewMembership
            allTasksGrid();
            completeGrid();
        },
        error: function (data) {

        }
    });
}
// ***************************************Create Not Started Task Grid ************************************
function allTasksGrid() {

    var gridUrl = portalAddress + "/_api/lists/getbyid('0E9AC47C-30DA-4985-897B-B9C23C245174')/items"+
    "?$select=Id,Title,WorkflowItemId,AssignedTo/Id,AssignedTo/Title,Status,MasterId/DepName,MasterId/Description"+
    "&$expand=AssignedTo,MasterId"+
    "&$filter=((AssignedTo/Id eq " + userid + " ) and ((Status eq 'شروع نشده') or (Status eq 'در حال انجام')))"+
    "&$orderby=Id desc"
    if (isAdmin)
        gridUrl = portalAddress + "/_api/lists/getbyid('0E9AC47C-30DA-4985-897B-B9C23C245174')/items"+
        "?$select=Id,Title,WorkflowItemId,AssignedTo/Id,AssignedTo/Title,Status,MasterId/DepName,MasterId/Description"+
        "&$expand=AssignedTo,MasterId"+
        "&$filter=((AssignedTo/Id eq " + userid + " or AssignedTo/Id eq 481) and ((Status eq 'شروع نشده') or (Status eq 'در حال انجام')))"+
        "&$orderby=Id desc"

    $("#taskGrid").kendoGrid({
        excel: {
            proxyURL: "/save",
            allPages:true,
            fileName:" درخواست های حضور" + new Date().toISOString().split("T")[0] 
        },
        dataSource: {
            pageSize: 10,
            type: "odata",
            transport: {
                read: {
                    url: encodeURI(gridUrl),
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    headers: {
                        "accept": "application/json;odata=verbose"
                    }
                }
            },
            schema: {
                data: function (d) {

                    return d.d.results;
                },
                total: function (e) {
                    return e.d.results.length;

                },

            },
        },

        pageSize: 2,
        sort: [
            // sort by "category" in descending order and then by "name" in ascending order
            { field: "Id", dir: "desc" },

        ],
        noRecords: true,
        messages: {
            noRecords: "اطلاعاتی برای نمایش وجود ندارد."
        },
        filterable: true,
        selectable: "multiple",
        pageable: {
            buttonCount: 5,
            messages: {
                display: "نمایش {0}-{1} از {2} مورد",
                itemsPerPage: "تعداد آیتم ها در صفحه",
                NoItemsToDisplay: "آیتمی وجود ندارد",
                Empty: "آیتمی وجود ندارد",
            },

            pageSizes: [10, 20, 30]
        },
        persistSelection: true,
       // filterable:true,
        scrollable: true,
        columns: [

            {
                template: "<input type='checkbox' value='#= Id#' class='checkbox' />",//Create checkboxes in Grid
                headerTemplate: "<input type='checkbox' id='checkall' class='hcheckbox' />",//Create header checkbox
                width: "4%",
            },
            // { field: "ID", title: "ID" },
            { field: "Title", title: "عنوان" },
            { field: "MasterId.DepName", title: "واحد",filterable:true },

            { field: "MasterId.Description", title: "توضیحات",filterable:false },
            //{ template: "#=getMasterData(WorkflowLink)#", title: "WorkflowLink" },
            {
                title: "جزییات",
                template: '<button type="button" onclick="openTaskWindow(#=Id#)" style="width:45px;margin-left:3px;font-size: 9px !important;">مشاهده</button>',//Create button for show Details

                width: 100
            }
        ],

    }).data("KendoGrid");

    $("#checkall").bind("change", function (e) {
        selectedTasks = [];
        var checked = e.target.checked;//check if checkbox for all is checked or not and return boolian value
        $(".checkbox").each(function (idx, item) {//ID Task haye check shode tavasote checkbox All ro barmigardune
            if (checked) {
                if (!item.checked) {
                    $(item).click();
                }
            } else {
                if (item.checked) {
                    $(item).click();
                }
            }
        });
    });
}



// *************************************** Get Solo selected checkboxes ************************************
function getSelectedTasks() {//ID Task haye taki entekhab shode ro barmigardune
    selectedTasks = [];
    $(".checkbox").each(function (idx, item) {
        if (item.checked) {
            var taskObj = $("#taskGrid").data("kendoGrid").dataSource._data.filter(function (i) {
                return i.ID == Number(item.value);
            });
            selectedTasks.push(taskObj[0]);
        }
    });
}// ************************************* Open Detail Dialog **********************************************

function openTaskWindow(taskId) {//Dialoge baz shode baraye namayeshe joziiate vazife ba click kardan dokmeye moshahede akhare har radif
    var height;
    var width;
    if (window.innerWidth < 640) {//Resize Dialoge baz shode baraye namayeshe joziat baraye size haye mokhtalef
        width = 500;
        height = 400;
    }
    else if (window.innerWidth < 1007) {
        width = 900;
        height = 700;
    }
    else {
        width = 1100;
        height = 900;
    }
    window.kendo.ui.progress($("#taskGrid"), true);
    var editURL = _spPageContextInfo.webAbsoluteUrl + "/Lists/GIG_MTH_Task/Nintex%20Workflow%20Multi%20Outcome%20Task/GIG_MTH_Task.aspx?List=0e9ac47c-30da-4985-897b-b9c23c245174&ID=" + taskId + "&Source=" + portalAddress + "/Pages/GIG_MTH_Task.aspx&IsDlg=1&IWParentItemID=1&InitialTabId=Ribbon.Hide";
    var Option = { url: editURL, dialogReturnValueCallback: OnDialogClose, width: width, height: height, title: "فرم وظیفه درخواست حضور" };
    SP.UI.ModalDialog.showModalDialog(Option);
}

function OnDialogClose(result) {//close Dialog
    if (result == SP.UI.DialogResult.OK) {

        setTimeout(onQuerySucceededTask, 2000);
    }
    else {
        window.kendo.ui.progress($("#taskGrid"), false);
    }


}
// ************************************* Approve and Reject !!!!! ****************************************
function completeAllTasks(result) {//Function onClick Buttons 
    $(".button").attr('disabled', 'disabled');
    getSelectedTasks();
    if (!selectedTasks.length) {//agar hich taski entekhab nashode bashad
        $.confirm({//Popup ekhtar baraye entekhabe hadeaghal yek task
            animationSpeed: 800,
            type: 'blue',
            title: 'اخطار!',
            content: 'لطفا حداقل یک مورد انتخاب کنید',
            buttons: {
                انصراف: function () {
                    return;
                }
            }
        });
    }
    else {
        if (result == 'approve')//approve button click
            taskResult = "تایید";
        else if (result == 'reject')//reject button click
            taskResult = "عدم تایید";
        window.kendo.ui.progress($("#taskGrid"), true);//Namayeshe Icon baraye amaliate dar hale anjam

        createLog(selectedTasks.pop());//pop kardan task az akhare araye baraye anjame amaliat
    }
}

// ************************************** Add Log ******************************
function createLog(logItem) {//Sakhte Item dar liste log

    if (logItem.hasOwnProperty("AssignedTo") && logItem.AssignedTo.hasOwnProperty("Title")) {
        this.item = logItem;
        var addLog = new SP.ClientContext(portalAddress);
        var logList = addLog.get_web().get_lists().getByTitle('GIG_MTH_Log');
        var itemCreateInfo = new SP.ListItemCreationInformation();
        this.logListItem = logList.addItem(itemCreateInfo);
        logListItem.set_item('Result', taskResult);
        logListItem.set_item('Tozihat', taskResult);
        logListItem.set_item('Who', logItem.AssignedTo.Title);
        logListItem.set_item('MTH_ID', logItem.WorkflowItemId);
        logListItem.update();
        addLog.load(logListItem);
        addLog.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededLog(logItem)), Function.createDelegate(this, this.onQueryFailedLog));
    }
    else {
        alertError("هنگام انجام عملیات خطایی رخ داده است. لطفا مجددا تلاش کنید !");
    }
}

function onQuerySucceededLog(item) {
    var mainListUrl = portalAddress + "/_api/lists/getbyid('973B711D-620C-4FA5-817E-1EA308D3F7FF')/items(" + item.WorkflowItemId + ")";//Request list URL
    $.ajax({//Query for Request List 
        type: "GET",
        url: encodeURI(mainListUrl),
        xhrFields: {
            'withCredentials': true
        },
        processData: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (mainItem) {
            updateMainItem(item, mainItem.Step);
        }
    });
}

function onQueryFailedLog(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    alertError("هنگام انجام عملیات خطایی رخ داده است. لطفا مجددا تلاش کنید !");
    window.kendo.ui.progress($("#taskGrid"), false);
}


// ************************************** Update Request List ******************************

function updateMainItem(item, Step) {
    // update main list 
    var clientContext = new SP.ClientContext(portalAddress);
    var oList = clientContext.get_web().get_lists().getByTitle('GIG_MTH_Request');
    this.oListItem = oList.getItemById(item.WorkflowItemId);
    oListItem.set_item('LastVaziat', taskResult);
    if (Step == 1) {
        oListItem.set_item('LoginName', 'i:0#.w|' + _spPageContextInfo.userLoginName);
    }
    oListItem.update();
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededMainList), Function.createDelegate(this, this.onQueryFailedMainList));

}

function onQuerySucceededMainList() {
    updateFlexiTaskProcess(item.ID);//Update flexi task

}

function onQueryFailedMainList(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    alertError("هنگام انجام عملیات خطایی رخ داده است. لطفا مجددا تلاش کنید !");
    window.kendo.ui.progress($("#taskGrid"), false);
}

// ************************************** Update Flexi Task ******************************

function updateFlexiTaskProcess(TaskID) {
    var SiteUrl = _spPageContextInfo.webAbsoluteUrl;
    var WS_Url = "/_vti_bin/nintexworkflow/workflow.asmx";
    var FullURL = SiteUrl + WS_Url;
    var Comment = "تایید";
    var Outcome = "تایید";
    var TaskName = 'GIG_MTH_Task';

    // ************************create soap envelope *************************************

    var soapMessage = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:m="http://nintex.com">\
                          <soap:Header>\
                          </soap:Header>\
                          <soap:Body>\
                             <ProcessFlexiTaskResponse2  xmlns="http://nintex.com">\
                             <comments>' + Comment + '</comments>\
                             <outcome>' + Outcome + '</outcome> \
                               <spTaskId>'+ TaskID + '</spTaskId> \
                               <taskListName>' + TaskName + '</taskListName>\
                            </ProcessFlexiTaskResponse2> \
                          </soap:Body> \
                        </soap:Envelope>'

    // text2XML(soapMessage)


    $.ajax({
        url: encodeURI(FullURL),
        type: "Post",
        dataType: "xml",
        // dataType: "text",
        // dataType: ($.browser != undefined) ? "xml" : "text",
        // data: xmlDoc,
        data: soapMessage,
        cache: false,
        contentType: "text/xml;charset=utf-8",
        success: function () {
            if (selectedTasks.length) {
                createLog(selectedTasks.pop());//Pop next task
            }
            else
                // onQuerySucceededTask();
                setTimeout(onQuerySucceededTask, 3000);
        },
        error: function (requestObject, error, errorThrown) {
            console.log(requestObject.status + " " + error + " " + errorThrown);
        }
    });
}

function onQuerySucceededTask() {//Refresh Grid with new Data
    var gridUrl = portalAddress + "/_api/lists/getbyid('0E9AC47C-30DA-4985-897B-B9C23C245174')/items?$select=Id,Title,WorkflowItemId,AssignedTo/Id,AssignedTo/Title,Status,MasterId/DepName,MasterId/Description&$expand=AssignedTo,MasterId&$filter=((AssignedTo/Id eq " + userid + " ) and ((Status eq 'شروع نشده') or (Status eq 'در حال انجام')))&$orderby=Id desc"
    if (isAdmin)
        gridUrl = portalAddress + "/_api/lists/getbyid('0E9AC47C-30DA-4985-897B-B9C23C245174')/items?$select=Id,Title,WorkflowItemId,AssignedTo/Id,AssignedTo/Title,Status,MasterId/DepName,MasterId/Description&$expand=AssignedTo,MasterId&$filter=((AssignedTo/Id eq " + userid + " or AssignedTo/Id eq 481) and ((Status eq 'شروع نشده') or (Status eq 'در حال انجام')))&$orderby=Id desc"

    $.ajax({
        type: "GET",
        url: encodeURI(gridUrl),
        xhrFields: {
            'withCredentials': true
        },
        beforeSend: function () {
            // window.kendo.ui.progress($("#HistoryGrid"), true);
        },
        processData: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var AllData = data.value;
            $("#taskGrid").data("kendoGrid").dataSource.data(AllData);
            $("#taskGrid").data("kendoGrid").refresh();
            window.kendo.ui.progress($("#taskGrid"), false);
            $(".button").removeAttr('disabled');


        }
    });
}


// ************************Create Tabs *************************************

function kendoTab() {//Create Tabs

    $("#tabstrip").kendoTabStrip({
        animation: {
            open: {
                effects: "fadeIn"
            }
        }
    });
};

// ************************Create completed grid in View Completed Task Tab *************************************

function completeGrid() {
    var completeGridUrl = portalAddress + "/_api/lists/getbyid('0E9AC47C-30DA-4985-897B-B9C23C245174')/items?$select=Id,Title,WorkflowItemId,AssignedTo/Id,AssignedTo/Title,Status,MasterId/DepName,MasterId/Description&$expand=AssignedTo,MasterId&$filter=((AssignedTo/Id eq " + userid + " ) and (Status eq 'خاتمه یافته'))";
    if (isAdmin)
        completeGridUrl = portalAddress + "/_api/lists/getbyid('0E9AC47C-30DA-4985-897B-B9C23C245174')/items?$select=Id,Title,WorkflowItemId,AssignedTo/Id,AssignedTo/Title,Status,MasterId/DepName,MasterId/Description&$expand=AssignedTo,MasterId&$filter=((AssignedTo/Id eq " + userid + " or AssignedTo/Id eq 481) and (Status eq 'خاتمه یافته'))"

    $("#completeTaskGrid").kendoGrid({

        dataSource: {
            pageSize: 10,
            type: "odata",
            transport: {
                read: {
                    url: completeGridUrl,
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    headers: {
                        "accept": "application/json;odata=verbose"
                    }
                }
            },
            schema: {
                data: function (d) {

                    return d.d.results;
                },
                total: function (e) {
                    return e.d.results.length;

                },

            },
        },

        pageSize: 2,
        sort: [
            // sort by "category" in descending order and then by "name" in ascending order
            { field: "Id", dir: "desc" },

        ],
        noRecords: true,
        messages: {
            noRecords: "اطلاعاتی برای نمایش وجود ندارد."
        },
        filterable: false,
        selectable: "multiple",
        pageable: {
            buttonCount: 5,
            messages: {
                display: "نمایش {0}-{1} از {2} مورد",
                itemsPerPage: "تعداد آیتم ها در صفحه",
                NoItemsToDisplay: "آیتمی وجود ندارد",
                Empty: "آیتمی وجود ندارد",
            },

            pageSizes: [10, 25, 50, 100]
        },
        persistSelection: true,

        scrollable: true,
        columns: [

            { field: "Title", title: "عنوان" },
            { field: "Status", title: "وضعیت" }
        ],

    }).data("KendoGrid");
}

// var xmlDoc;
//     function text2XML(txt) {

//         if (window.DOMParser) {
//             xmlDoc = (new DOMParser()).parseFromString(txt, "text/xml");
//         }
//         else {
//             xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
//             xmlDoc.async = "false";
//             xmlDoc.loadXML(txt);
//         }
//         debugger
//         return xmlDoc;

//     }

