let workspace_table

function load_table(reestr_data) {
    workspace_table = new Tabulator("#workspace_table", {
        ajaxURL: 'http://shmelevvl.ru:3000/table-api/labs/pribors/k.korostelev',
        ajaxParams: { work_st_arr: ["В лаборатории"] },
        ajaxResponse: function (url, params, response) {

            console.log(response);
            return response;
        },
        validationMode: 'manual',
        height: "calc(100vh - 60px)",
        layout: "fitDataStretch",
        // rowContextMenu: rowMenu,
        persistence: { // сохраняет  настроеные фильтры, ширину столбцов и сортировку.
            sort: true,
            filter: true,
            columns: ["width", "visible"]
        },
        persistenceID: "workspacePerststance",
        persistenceMode: true,
        columnDefaults: { // Общие параметры для всех столбцов
            headerHozAlign: "center",
            headerWordWrap: true,
        },
        columns: [
            { title: "Номер заказа", field: "order_id", width: 150, headerFilter: "input", /*headerMenu: headerMenu */ },
            // { title: "Номер счета", field: "schetId", width: 150, headerFilter: "input", hozAlign: "center" },
            { title: "Лаба", field: "target_lab", headerFilter: "input", hozAlign: "center" },
            { title: "Тип СИ", field: "mi_type", headerFilter: "input", editor: true },
            { title: "Зав. номер", field: "factory_num", headerFilter: "input", editor: true },
            { title: "Блоки (для составных СИ)", field: "blocks", width: 150, editor: "input" },
            { title: "Комментарий", width: 200, editor: true, field: "comment" }, // как выводить массив комментариев и зачем???!! "discussions"
            { title: "Вид работ МС", field: "work_typeMS" },
            { title: "Год выпуска прибора", field: "god_vipuska", editor: "input" },
            // {
            //     title: "Номер реестра", field: "reestr", width: 150, cssClass: "selector", editor: "list", validator: "required",
            //     cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            //     editorParams: { autocomplete: true, listOnEmpty: true, allowEmpty: true, clearable: true, maxWidth: 600, values: Object.keys(reestr_mpi) }
            // },
            { title: "Объем поверки", field: "range", width: 150, editor: "input" },
            {
                title: "Вид поверки", field: "pov_type", width: 150, editor: "list", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { values: ["периодическая", "первичная"], clearable: true, selectable: true }
            },
            {
                title: "Поверитель", field: "verificator", width: 150, editor: "list", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { values: ["Д.О. Крупко", "А.С. Фролов", "К.А. Шакалов", "А.Н. Матвеев", "А.А. Петруха", "А.В. Владимиров", "К.В. Дочупайло", "К.С. Коростелев", "П.П. Солощенко ", "В.Л. Шмелев", "Я.А. Фесенко"], clearable: true, listOnEmpty: true, autocomplete: true, selectable: true }
            },
            {
                title: "Напряжение питания/темп. пов. среды", field: "temp_v", width: 150, editor: "input",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            },
            {
                title: "Заключение", field: "conclusion", editor: "list", cssClass: "selector", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { values: ["Пригодно", "Непригодно", "Калиброван"], clearable: true, selectable: true }
            },
            { title: "Причина непригодности", field: "brakReason", width: 150, editor: "input" },
            {
                title: 'Дата поверки', field: 'dataPov', editor: "date", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { format: "dd.MM.yyyy" }
            },
            {
                title: "Дата дейcтвия поверки", field: "dataDeist", width: 150, editor: "textarea", formatter: "textarea", validator: [{ type: check_data }]
                , editorParams: {
                    // selectContents:true,
                    // verticalNavigation:"editor",
                    shiftEnterSubmit: true,
                },
                cellDblClick: function (e, cell) { calcValidDate(e, cell) },
            },
            {
                title: "Полка на складе", field: "shelf", width: 150, editor: "input",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            },
            { title: "Чекбокс", formatter: "rowSelection", titleFormatter: "rowSelection", titleFormatterParams: { rowRange: "active" }, hozAlign: "center", headerSort: false }
        ],
        footerElement: '<div class="d-grid d-md-flex" style="padding-top: 10px;"><button id="send_data" onclick="sendToRev()" type="submit" class="btn btn-outline-primary" style="margin-left: 10px;">Отправить на внесение</button></div>'
    });
    workspace_table.on("cellEdited", function (cell) {
        var field = cell.getField()
        if (field == "dataPov" || field == "reestr" || field == "conclusion") {
            format_date.tek_row = cell.getRow()
            if ((format_date.tek_row.getCell("dataDeist").getValue() == null || format_date.tek_row.getCell("dataDeist").getValue() == "") && format_date.tek_row.getCell("conclusion").getValue() == "Пригодно") {  // если дата действия не заполнена и стоит отметка пригодно, рассчитать ее
                format_date.data_pov = format_date.tek_row.getCell("dataPov").getValue()
                format_date.tek_reestr = format_date.tek_row.getCell("reestr").getValue()
                if (format_date.data_pov != null && format_date.tek_reestr != null) {
                    console.log(format_date.tek_reestr)
                    console.log(format_date.data_pov)
                    countData()
                }
            }
        }
    })
    workspace_table.on("validationFailed", function (cell, value, validators) {
        let invalidrow = cell.getRow().getData()
        console.log(invalidrow + " заполните все поля на этой строке")

        //cell - cell component for the edited cell
        //value - the value that failed validation 
        //validators - an array of validator objects that failed
    })
}

$('#workspace-tab').on('show.bs.tab', () => load_table())

function copyDataForSelected(e, cell) { // копирование по столбцам в выделенные строки
    let val_copy = cell.getValue()
    let col_field = cell.getField()
    let sel_rows = workspace_table.getSelectedRows()
    sel_rows.forEach(el => {
        const obj = {}
        obj[col_field] = val_copy
        el.update(obj)
    })
}

var check_data = function (cell, value, parameters) { // валидация столбца дата действия поверки
    let flag = true

    let current_row = cell.getRow()
    let concl = current_row.getCell('conclusion').getValue()
    if (concl == "Непригодно" && value) {
        flag = false
    }
    else if (concl == "Пригодно") {
        if (value == "" || value == null) {
            flag = false
        }
    }
    return flag
}

function calcValidDate(e, cell) {
    workspace_table.getSelectedRows()
        .forEach(row => {
            var povCell = row.getCell("dataPov").getValue()
            var reestrCell = row.getCell("reestr").getValue()
            var zaklCell = row.getCell("conclusion").getValue()
            if (zaklCell !== "Непригодно" && reestrCell != null && povCell != null) {
                row.update(countData_v2(povCell, reestrCell))
            }
        })
}

async function sendToRev(){
    let data = [
        {
          order_id: 'N23-0686',
          numPP: 5,
          changes: [
            {col: 5,value: 'qwert'},
            {col: 3,value: 'test'},
          ]
        },
        {
          order_id: 'N23-0686',
          numPP: 7,
          changes: [
            {col: 5,value: 'qwert123'},
            {col: 3,value: 'test2'},
            {col: 9,value: 'kirill'},
          ]
        },
        {
          order_id: 'N23-0686123132',
          numPP: 7,
          changes: [
            {col: 5,value: 'qwert123'},
            {col: 3,value: 'test2'},
            {col: 9,value: 'kirill'},
          ]
        },
      ]    
    url = "https://script.google.com/macros/s/AKfycbyHseg9bXsy_YBxUcD7vlBEKk0h_4r2PcJv2msYlIYZSEoGaxCGJLnCpMl2Ay66fPX0/exec"
    let res = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8',            
            // 'Access-Control-Allow-Origin': '*'
          },
        body: JSON.stringify(data),
        mode: "no-cors",
        redirect: "follow"
    })
    // res = await res.text()
    console.log(res);    
    
}

function testPost() {
    
    // const url = 'https://script.google.com/macros/s/AKfycbyHseg9bXsy_YBxUcD7vlBEKk0h_4r2PcJv2msYlIYZSEoGaxCGJLnCpMl2Ay66fPX0/exec'
    const data = [
      {
        order_id: 'N23-0686',
        numPP: 5,
        changes: [
          {col: 5,value: 'qwert'},
          {col: 3,value: 'test'},
        ]
      },
      {
        order_id: 'N23-0686',
        numPP: 7,
        changes: [
          {col: 5,value: 'qwert123'},
          {col: 3,value: 'test2'},
          {col: 9,value: 'kirill'},
        ]
      },
      {
        order_id: 'N23-0686123132',
        numPP: 7,
        changes: [
          {col: 5,value: 'qwert123'},
          {col: 3,value: 'test2'},
          {col: 9,value: 'kirill'},
        ]
      },
    ]
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(data),
      muteHttpExceptions: true
    };
    
    sendToRev(data)
  }



function postdata() {
    output_data = workspace_table.getSelectedData();
    let data = output_data.map(row =>{
        order_id = row.order_id
        numPP = row.numPP
        changes = row.map(el =>{

        })

    })
//     let data = [
//         {
// order_id,
// num_pp,
// changes: [{},{}]
console.log(data);
// sendToRev(data)
        
    
}

function send_data() { // функции по кнопке "отправить на внесение"        
    output_data = workspace_table.getSelectedData(); // массив данных выбранных строк
    let selectedRows = workspace_table.getSelectedRows()
    if (validation(selectedRows) == false) { // Валидация
        alert("Данные не были отправлены! Заполните все необходимые ячейки в таблице")
        return // прерывание операции 
    }
    else { // валидация пройдена
        google.script.run.withSuccessHandler( // пополнение массива погодой для каждого прибора из таблицы революция
            (mass) => {
                if (isEmpty(mass) == true) {
                    alert("Данные не были отправлены! Введите условия окружающей среды")
                    return
                }
                output_data.forEach(row => {
                    mass.forEach(r => {
                        if (row.dataPov == r[0]) {
                            row.temp = r[10];
                            row.wet = r[11];
                            row.press = r[19];
                        }
                    })
                })
                updateLocalfile("paperwork", output_data) // обновление файла с отправленными на оформление приборами
                google.script.run.withSuccessHandler(transferPribors("work_in_progress", selectedRows)).updateRev(output_data)
            }
        ).getPogMass()
        // output_data.forEach(row =>{
        //     row.update({'status_rabot': "На оформлении"})// обновление статуса работ для каждого выбранного прибора
        // })      
    }
}
