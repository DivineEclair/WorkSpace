// const prib_pov = '14qY7Wy9j-1G-m8aVoA0wJZ2KVGptBH_6JQFjoHbWW0o';
// const url_lab = "17zKrUCchUjf1XopYmloI0A-cEsbDCu3KEsRO6U1GgUI"
// let labs = "Т   Температура, ТВ   Тепловычислители, ТС   Теплосчетчики, КГ   Корректоры газа, РТ   Регуляторы, регистраторы, ТМ   Термоманометры"
// let my_labs = "М   Манометры, Д   Датчики давления, Г   Геометрические СИ, В   Весы"

// async function getSiInfo(labs) { // данные из базы (заказы и приборы внутри)
//   const url = 'https://script.google.com/macros/s/AKfycbzDaZM2aPg7faTdya6wV1Nj_BQYxqIUITWp9SFNOYT3B34YIVsbWX_JtqY_UciGDqPvMg/exec?command=getDataForLaba&labs=' + my_labs
//   let result = await fetch(url)
//   result = await result.json()
//   result = Object.values(result).flat() // получить ключи объекта => массив массивов объектов разобрать в общий массив объектов
//   console.log(result)
//   return result
// }

// async function getPriborInfo(orders) { // данные из базы (заказы и приборы внутри)
//   const url = 'http://shmelevvl.ru:3000/table-api/labs/pribors/k.korostelev'
//   let result = await fetch(url, {
//     body: {
//       orders: JSON.stringify(orders)
//     }

//   })
//   result = await result.json()
//   result.forEach((row, i) => {
//     row.id = i + 1
//   })
//   //   result = Object.values(result).flat() // получить ключи объекта => массив массивов объектов разобрать в общий массив объектов
//   console.log(result)
//   return result
// }
let labs_for_filter = "Манометры Датчики Геометрические Весы"
let orders = ["N-0504-23", "N-0501-23"]
let labs = ['М   Манометры']
let table_si

function createSiTable(orders, labs) {
  table_si = new Tabulator("#pribor_table", {
    ajaxURL: 'http://shmelevvl.ru:3000/table-api/labs/pribors/k.korostelev',
    // ajaxParams:{order: orders, lab: labs},
    ajaxResponse: function (url, params, response) {
      let lfile = window.localStorage.getItem('TakenOrders')
      lfile = JSON.parse(lfile)
      response = response.filter(x => lfile.some(el => x.order_id == el.order_id && x.target_lab === el.lab))

      return response;
    },
    height: "calc(100vh - 100px)",
    layout: "fitDataStretch",
    persistence: { // сохраняет  настроеные фильтры, ширину столбцов и сортировку.
      sort: true,
      filter: true,
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
    initialFilter: [
      // {field: "work_st", type: "=", value: "В работе"},
      // {field: "target_lab", type: "keywords", value: labs_for_filter}// переменное значение в зависимости от пользователя

    ],
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
    footerElement: '<div class="take_button"><button onclick="takePribors()" type="button" class="btn btn-outline-primary">Взять заказы в работу</button></div>',
  });
  // table_si.on("tableBuilt", () => 
  //   setTimeout( () => table_si.setFilter([
  //     {field:"target_lab", type:"keywords", value:labs_for_filter},
  //     {field: "work_st", type: "=", value: "В работе"},
  //   ]), 1500)      
  // );

}

$('#pribor_list-tab').on('show.bs.tab', () => createSiTable(orders, labs)) // создание таблицы после события открытия вкладки

function takePribors2() {
  let work_in_progress = []
  let selected_data = table_si.getSelectedData()
  console.log(selected_data)
  selected_data.forEach(row => {
    row.update({ 'status_rabot': 'В работе' })
    work_in_progress.push(row)
    row.delete()
  });
  // post запрос в базу, обновляем статус работ
  // изменить статус на: в работе
  alert("Приборы отправлены в рабочее пространство")
}

function takePribors() {
  let selected = table_si.getSelectedData()
  let prib_status = {
    status: "valya lox",
    pribors: selected
  }  
  console.log(prib_status)
  sendtoBase(prib_status)
}

async function sendtoBase(prib_status) {
  const url = 'http://shmelevvl.ru:3000/table-api/labs/pribors/change-status'
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(prib_status)
  })
  // console.log(response)
  response = await response.json()
  console.log(response)
}
