
let table_order
let lfile
let ru_orders = {
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
        "rows": "заказов",
        "pages": "pages",
      }
    }
  }
}

function createOrderTable() {
  table_order = new Tabulator("#order_table", {
    ajaxURL: 'http://shmelevvl.ru:3000/table-api/labs/orders/k.korostelev',
    ajaxResponse: function (url, params, response) {
      // let filtered_data = response.filter(x => !(Number(x.ovr) == 1) ) // фильтруем по овр 
      // return filtered_data;
      // response = checkLocalStorage(response)
      console.log("Список заказов\n");
      console.log(response);
      return response
    },
    layout: "fitDataStretch",
    height: "calc(100vh - 100px)",
    locale: true,
    langs: ru_orders,
    persistence: { // сохраняет  настроеные фильтры, ширину столбцов и сортировку.
      sort: true,
      filter: true,
      columns: ["width"]
    },
    persistenceID: "orderPerststance",
    persistenceMode: true,
    columnDefaults: {
      headerHozAlign: "center",
      headerWordWrap: true
    },
    pagination: true,
    paginationCounter: "rows",
    paginationButtonCount: 3,
    selectable: true,
    columns: [
      // { title: '№', field: 'id' },
      { title: "Номер заказа", field: "order_id", width: 150, headerFilter: "input", hozAlign: "center" },
      { title: "Лабы", field: "lab", width: 200, headerFilter: "input", hozAlign: "center" },
      { title: "Количество приборов", field: "pribor_count", hozAlign: "center", width: 200 },
      { title: "Вид работ МС", width: 200, field: "work_typeMS", hozAlign: "center" },
      { title: "Комментарий", width: 200, field: "comment" },
      { title: "ОВР", field: "ovr", hozAlign: "center" },
      { titleFormatter: "rowSelection", width: 80, titleFormatterParams: { rowRange: "active" }, hozAlign: "center", headerSort: false, formatter: "rowSelection", },

    ],
    footerElement: '<div class="take_button"><button onclick="takeOrders()"  type="button" class="btn btn-outline-primary">Взять заказы в работу</button></div>',
  })
  table_order.on("dataProcessed", function(){
    checkStyle(1)
  });  
  table_order.on("pageLoaded", function (pageno) {
    checkStyle(1)
    //pageno - the number of the loaded page
  });
}

createOrderTable()
$('#order_list-tab').on('show.bs.tab', () => createOrderTable())

async function takeOrders() {
  let selected_data = await table_order.getSelectedData()
  // let sel_rows = table_order.getSelectedRows()
  let status = updateLocal('TakenOrders', selected_data)
  if (status == 'ok') {
    showAlert("Заказы взяты в работу", 'ok')
  }
}
