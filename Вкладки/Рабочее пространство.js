let workspace_table
let reestr_mpi

async function load_table() {
    reestr_mpi = await getReestrs()    
    workspace_table = new Tabulator("#workspace_table", {
        ajaxURL: 'http://shmelevvl.ru:3000/table-api/labs/pribors/k.korostelev',
        ajaxParams: { work_st_arr: ["В лаборатории"] },
        ajaxResponse: function (url, params, response) {
            console.log("Приборы в поверку:\n");
            console.log(response);
            return response;
        },
        validationMode: 'manual',
        height: "calc(100vh - 100px)",
        layout: "fitDataStretch",
        rowContextMenu: rowMenu,
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
            { title: "Номер заказа", field: "order_id", width: 150, headerFilter: "input", headerMenu: headerMenu },
            // { title: "Номер счета", field: "schetId", width: 150, headerFilter: "input", hozAlign: "center" },
            { title: "Лаба", field: "target_lab", headerFilter: "input", hozAlign: "center" },
            { title: "Тип СИ", field: "mi_type", headerFilter: "input", editor: true },
            { title: "Зав. номер", field: "factory_num", headerFilter: "input", editor: true },
            { title: "Блоки (для составных СИ)", field: "blocks", width: 150, editor: "input" },
            { title: "Комментарий", width: 200, editor: true, field: "comment" }, // как выводить массив комментариев и зачем???!! "discussions"
            { title: "Вид работ МС", field: "work_typeMS" },
            { title: "Год выпуска прибора", field: "out_date", editor: "input" },
            {
                title: "Номер реестра", field: "reg_num_name", width: 150, cssClass: "selector", editor: "list", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { autocomplete: true, listOnEmpty: true, allowEmpty: true, clearable: true, maxWidth: 600, values: Object.keys(reestr_mpi) }
            },
            { title: "Объем поверки", field: "range", width: 150, editor: "input" },
            {
                title: "Вид поверки", field: "verif_type", width: 150, editor: "list", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { values: ["периодическая", "первичная"], clearable: true, selectable: true }
            },
            {
                title: "Поверитель", field: "verificator", width: 150, editor: "list", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { values: ["Д.О. Крупко", "А.С. Фролов", "К.А. Шакалов", "А.Н. Матвеев", "А.А. Петруха", "А.В. Владимиров", "К.В. Дочупайло", "К.С. Коростелев", "П.П. Солощенко ", "В.Л. Шмелев", "Я.А. Фесенко","В.Ю. Кобаченко"], clearable: true, listOnEmpty: true, autocomplete: true, selectable: true }
            },
            {
                title: "Напряжение питания/темп. пов. среды", field: "temp_v", width: 150, editor: "input",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            },
            {
                title: "t, ° C", field: "env_temper", width: 150, editor: "input",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            },
            {
                title: "φ, %", field: "env_press", width: 150, editor: "input",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            },
            {
                title: "P, кПа", field: "env_humid", width: 150, editor: "input",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            },
            {
                title: "Заключение", field: "conclusion", editor: "list", cssClass: "selector", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { values: ["Пригодно", "Непригодно", "Калиброван"], clearable: true, selectable: true }
            },
            { title: "Причина непригодности", field: "unuse_cause", width: 150, editor: "input" },
            {
                title: 'Дата поверки', field: 'verif_date', editor: "date", validator: "required",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
                editorParams: { format: "dd.MM.yyyy" }
            },
            {
                title: "Дата дейcтвия поверки", field: "valid_date", width: 150, editor: "textarea", formatter: "textarea", validator: [{ type: check_data }]
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
        footerElement: '<div class="d-grid d-md-flex" style="padding-top: 10px;"><button id="send_data" onclick="send_data()" type="submit" class="btn btn-outline-primary" style="margin-left: 10px;">Отправить на внесение</button></div>'
    });
    workspace_table.on("cellEdited", function (cell) {
        let col = cell.getField()
        let row = cell.getRow()
        if (col == "verif_date" || col == "reg_num_name" || col == "conclusion") {
            let valid_date = row.getCell("valid_date").getValue()
            let reg_num_name = row.getCell("reg_num_name").getValue()
            let concl = row.getCell("conclusion").getValue()
            let verif_date = row.getCell("verif_date").getValue()
            if (isEmpty(valid_date) && !isEmpty(reg_num_name) && !isEmpty(concl) && !isEmpty(verif_date)) {  // если дата действия не заполнена и стоит отметка пригодно, рассчитать ее
                if (concl == "Пригодно") {
                    updateValidDate(row, reg_num_name, verif_date)
                }
            }
        }
    })
    workspace_table.on("validationFailed", function (cell, value, validators) {
        let invalidrow = cell.getRow().getData()
        console.log(invalidrow + " заполните все поля на этой строке")
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

async function sendToRev(output_data) {
    // let output_data = workspace_table.getSelectedData();
    let data = postData(output_data) //  формирование данных на отправку
    showAlert('Данные переданы для внесения в Аршин')
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
    sendtoBase('На оформлении', output_data) // меняем статус приборов    
}

function postData(output_data) {
    let data = []
    output_data.forEach(row => {
        row.reg_num = row.reg_num_name.split(" ")        
        if (row.work_typeMS.includes("оф")){
            row.paperwork = "Нет"
          }
          else if (row.work_typeMS.includes('ОМХ')){
            row.paperwork = "Н/О"
          }
          else {
            row.paperwork = "Н/О А"
          }
        let changes = []
        for (key in row) {
            if (column_num[key] && row[key] != "") {
                changes.push({
                    'col': column_num[key],
                    'value': row[key]
                })
            }
        }
        data.push({
            'order_id': row.order_id,
            'numPP': row.numPP,
            'changes': changes
        })
    })
    console.log(data);
    return data
}

function send_data() { // функции по кнопке "отправить на внесение"        
    let output_data = workspace_table.getSelectedData(); // массив данных выбранных строк
    let selectedRows = workspace_table.getSelectedRows()
    if (validation(selectedRows) == false) { // Валидация
        showAlert("Данные не были отправлены!\n Заполните все необходимые ячейки в таблице")
        return // прерывание операции 
    }
    else { // валидация пройдена
        sendToRev(output_data)
        
        // output_data.forEach(row =>{
        //     row.update({'status_rabot': "На оформлении"})// обновление статуса работ для каждого выбранного прибора
        // })      
    }
}


const column_num = {
    mi_type: 6,
    factory_num: 7,
    conclusion: 16,
    reg_num_name: 20,
    shelf: 19,
    verificator: 23,
    verif_type: 22,
    verif_date: 25,
    valid_date: 26,
    unuse_cause: 24,
    env_temper: 28,
    env_press: 30,
    env_humid: 29,
    verif_area: 31, // доп. условия поверки
    range: 32,
    blocks: 35,
    alignment: 27,
    comment: 9,
    reg_num: 21,
    paperwork: 17
}

function selected() {
    output_data = workspace_table.getSelectedData()
    console.log(output_data);
}
