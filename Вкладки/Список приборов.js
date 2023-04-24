let table_si

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
        showAlert('Выберите заказы на странице списка заказов')
        return
      }
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
    persistenceID: "SiPerststance",
    persistenceMode: true,
    pagination: true,
    paginationCounter: "rows",
    paginationButtonCount: 3,
    selectable: true,
    locale: true,
    langs: ru,
    columns: [
      { title: "Номер заказа", field: "order_id", width: 150, headerFilter: "input", hozAlign: "center" },
      // { title: "Номер счета", field: "schetId", width: 150, headerFilter: "input", hozAlign: "center" },
      { title: "Приоритет (СОУ)", field: "sou", hozAlign: "center", width: 200 },
      { title: "Лаба", field: "target_lab", headerFilter: "input", hozAlign: "center" },
      { title: "Тип СИ", field: "mi_type", headerFilter: "input", hozAlign: "center" },
      { title: "Зав. номер", field: "factory_num", headerFilter: "input", hozAlign: "center" },
      { title: "Вид работ МС", field: "work_typeMS", hozAlign: "center" },
      { title: "Комментарий", width: 200, field: "comment", editor: true },
      { formatter: "rowSelection", titleFormatter: "rowSelection", titleFormatterParams: { rowRange: "active" }, hozAlign: "center", headerSort: false }
    ],
    footerElement: '<div class="take_button"><button onclick="takePribors()" type="button" class="btn btn-outline-primary">Взять приборы в работу</button></div>',
  });

}

$('#pribor_list-tab').on('show.bs.tab', () => createSiTable()) // создание таблицы после события открытия вкладки

function takePribors() {
  let selected = table_si.getSelectedData()
  sendtoBase("В лаборатории", selected) // новый статус и массив приборов
  showAlert('Приборы взяты в работу')
}
