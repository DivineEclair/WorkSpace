
function load_table(reestr_data) {
    let workspace_table = new Tabulator("#workspace_table", {
        ajaxURL: 'http://shmelevvl.ru:3000/table-api/labs/pribors/k.korostelev', // work_st
        ajaxParams: { work_st: "В работе" },
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
            { title: "Лаба", field: "lab", headerFilter: "input", hozAlign: "center" },
            { title: "Тип СИ", field: "tipSI", headerFilter: "input", editor: true },
            { title: "Зав. номер", field: "zavNum", headerFilter: "input", editor: true },
            { title: "Блоки (для составных СИ)", field: "bloki", width: 150, editor: "input" },
            { title: "Комментарий", width: 200, editor: true, field: "pribKoment" },
            { title: "Вид работ МС", field: "vid_rabotMS" },
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
                title: "Заключение", field: "zakluchenie", editor: "list", cssClass: "selector", validator: "required",
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
                title: "Полка на складе", field: "polka", width: 150, editor: "input",
                cellDblClick: function (e, cell) { copyDataForSelected(e, cell) },
            },
            { title: "Чекбокс", formatter: "rowSelection", titleFormatter: "rowSelection", titleFormatterParams: { rowRange: "active" }, hozAlign: "center", headerSort: false }
        ],
        footerElement: '<div class="d-grid d-md-flex" style="padding-top: 10px;"><button id="send_data" onclick="send_data()" type="submit" class="btn btn-outline-primary" style="margin-left: 10px;">Отправить на внесение</button></div>'
    });
    workspace_table.on("cellEdited", function (cell) {
        var field = cell.getField()
        if (field == "dataPov" || field == "reestr" || field == "zakluchenie") {
            format_date.tek_row = cell.getRow()
            if ((format_date.tek_row.getCell("dataDeist").getValue() == null || format_date.tek_row.getCell("dataDeist").getValue() == "") && format_date.tek_row.getCell("zakluchenie").getValue() == "Пригодно") {  // если дата действия не заполнена и стоит отметка пригодно, рассчитать ее
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

load_table()

var check_data = function (cell, value, parameters) { // валидация столбца дата действия поверки
    let flag = true

    let current_row = cell.getRow()
    let concl = current_row.getCell('zakluchenie').getValue()
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
            var zaklCell = row.getCell("zakluchenie").getValue()
            if (zaklCell !== "Непригодно" && reestrCell != null && povCell != null) {
                row.update(countData_v2(povCell, reestrCell))
            }
        })
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
