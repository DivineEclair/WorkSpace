// var prib_pov = '14qY7Wy9j-1G-m8aVoA0wJZ2KVGptBH_6JQFjoHbWW0o';
// var url_lab = "17zKrUCchUjf1XopYmloI0A-cEsbDCu3KEsRO6U1GgUI"
// var labs = "Т   Температура, ТВ   Тепловычислители, ТС   Теплосчетчики, КГ   Корректоры газа, РТ   Регуляторы, регистраторы, ТМ   Термоманометры"

// async function getOrderInfo() { // данные из базы (заказы и приборы внутри)
//   const url = 'http://shmelevvl.ru:3000/table-api/labs/orders/k.korostelev'
//   let result = await fetch(url)
//   result = await result.json()
//   result.forEach((row, i) => {
//     row.id = i + 1
//   })
//   //   result = Object.values(result).flat() // получить ключи объекта => массив массивов объектов разобрать в общий массив объектов
//   console.log(result)
//   return result
// }

let table_order
let ru = {
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
      //url - the URL of the request
      //params - the parameters passed with the request
      //response - the JSON object returned in the body of the response.
      console.log(response)
      response = checkLocalStorage(response)
      return response; //return the tableData property of a response json object
    },
    layout: "fitDataStretch",
    height: "calc(100vh - 100px)",
    locale: true,
    langs: ru,
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
    initialFilter: [
      { field: "work_st", type: "=", value: "В работе" }
    ],
    columns: [
      // { title: '№', field: 'id' },
      { title: "Номер заказа", field: "order_id", width: 150, headerFilter: "input", hozAlign: "center" },
      { title: "Лабы", field: "order_labs", width: 200, headerFilter: "input", hozAlign: "center" },
      { title: "Количество приборов", field: "pribor_count", hozAlign: "center", width: 200 },
      { title: "Вид работ МС", width: 200, field: "work_typeMS", hozAlign: "center" },
      { title: "Комментарий", width: 200, field: "comment" },
      { title: "ОВР", field: "ovr", hozAlign: "center" },
      { formatter: "rowSelection", titleFormatter: "rowSelection", titleFormatterParams: { rowRange: "active" }, hozAlign: "center", headerSort: false },

    ],
    footerElement: '<div class="take_button"><button onclick="takeOrders()"  type="button" class="btn btn-outline-primary">Взять заказы в работу</button></div>',
  })

  // table_order.on("tableBuilt", () =>
  //   setTimeout(() => table_order.setFilter("work_st", "=", "В работе"), 1000)
  // );

}

createOrderTable()

async function takeOrders() {
  let selected_data = await getSelected()
  updateLocal('TakenOrdersObj', selected_data, 'arr')
  updateLocal('TakenOrders', selected_data, 'obj')
  showAlert("Заказы взяты в работу")
}

function checkLocalStorage(response) {
  let data = window.localStorage.getItem('TakenOrdersObj')
  if (data){
    data = JSON.parse(data)
    console.log(data)
    let result = compareObj(response, data)
    console.log(result)
    return result
  }
  else {
    return response
  }  
}

function compareObj(main_mass, massforfilter) { // возвращает массив с вычетом приборов из локального файла   
  if (massforfilter) {
    let result = main_mass.filter(x => !massforfilter.some(el => x.order_id === el.order_id && x.order_labs === el.order_labs))
    return result
  }
  else {
    console.log("Массив пуст")
    result = main_mass
    return result
  }
}

function updateLocal(file, data, type) {
  let localfile = window.localStorage.getItem(file)
  let result, newarr 
  let temparr = []
  if (localfile) {
    temparr = JSON.parse(localfile)
    console.log(temparr)
    if (type == 'arr'){      // массив объектов      
      result = temparr.concat(data)
      newarr = JSON.stringify(result)
    }
    else{
      let temp = setLocalFile(data)
      let obj = {}      
      obj.num = temparr.num.concat(temp.num)
      obj.labs = temparr.labs.concat(temp.labs)
      newarr = JSON.stringify(obj)      
    }
    window.localStorage.setItem(file, newarr)
  }
  else {
    data = JSON.stringify(data)
    window.localStorage.setItem(file, data)
    
  }  
  
}

function setLocalFile(data) {
  let orders_taken = {}
  let taken_num = []
  let taken_labs = []
  data.forEach(row => {
    taken_num.push(row.order_id)
    taken_labs.push(row.order_labs)
    // row.delete()
  });
  orders_taken.num = taken_num
  orders_taken.labs = taken_labs
  return orders_taken
  // window.localStorage.setItem('TakenOrders', JSON.stringify(orders_taken));
  // showAlert("Заказы взяты в работу")
}

function getSelected() {
  let selected_data = table_order.getSelectedData()
  // window.localStorage.setItem('TakenOrdersObj', JSON.stringify(selected_data));
  return selected_data
}
