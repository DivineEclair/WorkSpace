let table_si
let ru_pribors = {
  "ru": {
    "data": {
      "loading": "Загрузка", //data loader text
      "error": "Ошибка", //data error text
    },
    "pagination": {
      "first": "Первая",
      "last": "Последняя",
      "prev": "Пред.",
      "next": "След.",
      "counter": {
        "showing": "Показаны",
        "of": "из",
        "rows": "приборов",
        "pages": "pages",
      }
    }
  }
}

function createSiTable() {
  table_si = new Tabulator("#pribor_table", {
    ajaxURL: 'http://shmelevvl.ru:3000/table-api/labs/pribors/k.korostelev',
    ajaxParams: { work_st_arr: ["В работе"] },
    ajaxResponse: function (url, params, response) {
      let lfile = window.localStorage.getItem('TakenOrders')
      if (lfile) {
        let file = JSON.parse(lfile)
        let filtered_data = response.filter(x => file.some(el => x.order_id == el.order_id && x.target_lab == el.lab)) // фильтруем по приборам из локального файла
        console.log(filtered_data)
        return filtered_data;
      }
      else {
        showAlert('Выберите заказы на странице списка заказов', 'ne ok')
        return
      }
    },
    rowFormatterPrint: function (row) {
      table_si.getRows().forEach(el => {
        el.getElement().style.
        height = '20px'
      })
    },
    height: "calc(100vh - 100px)",
    layout: "fitDataStretch",
    persistence: { // сохраняет  настроеные фильтры, ширину столбцов и сортировку.
      sort: true,
      // filter: true,
      columns: ["width"]
    },
    columnDefaults: {
      headerHozAlign: "center",
      headerWordWrap: true
    },
    printRowRange: "selected",
    printAsHtml: true,
    printConfig: {
      columnHeaders: false
    },
    persistenceID: "SiPerststance",
    persistenceMode: true,
    pagination: true,
    paginationCounter: "rows",
    paginationButtonCount: 3,
    selectable: true,
    locale: true,
    langs: ru_pribors,
    columns: [
      { title: "Номер заказа", field: "order_id", width: 150, headerFilter: "input", hozAlign: "center" },
      // { title: "Номер счета", field: "schetId", width: 150, headerFilter: "input", hozAlign: "center" },
      { title: "Приоритет (СОУ)", field: "sou", hozAlign: "center", width: 200, print: false },
      { title: "Лаба", field: "target_lab", headerFilter: "input", hozAlign: "center", print: false },
      { title: "Тип СИ", field: "mi_type", headerFilter: "input", hozAlign: "center" },
      { title: "Зав. номер", field: "factory_num", headerFilter: "input", hozAlign: "center" },
      { title: "Вид работ МС", field: "work_typeMS", hozAlign: "center", print: false },
      { title: "Комментарий", width: 200, field: "comment", editor: true },
      {
        formatter: "rowSelection", titleFormatter: "rowSelection", width: 80, titleFormatterParams: { rowRange: "active" }, hozAlign: "center", headerSort: false,
      }
    ],
    footerElement: '<div class="take_button"><button onclick="takePribors()" type="button" class="btn btn-outline-primary">Взять приборы в работу</button><button type="button" onclick="printTable()" id="print-table" class="btn btn-outline-primary">Напечатать</button></div>',
  });
  table_si.on("dataProcessed", function () {
    checkStyle(1)
  });
  table_si.on("pageLoaded", function (pageno) {
    checkStyle(1)
    //pageno - the number of the loaded page
  });


}

$('#pribor_list-tab').on('show.bs.tab', () => createSiTable()) // создание таблицы после события открытия вкладки

function printTable() {
  table_si.print();
  console.log("Отправлено в печать");
}

function printFormatter(cell, formatterParams, onRendered) {
  return cell.getValue() ? '' : ''
}

function takePribors() {
  let selected = table_si.getSelectedData()
  sendtoBase("В лаборатории", selected) // новый статус и массив приборов
  showAlert('Приборы взяты в работу', "ok")
}


