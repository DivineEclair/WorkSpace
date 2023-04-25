let journal_table

function createJournal() {
  journal_table = new Tabulator ("#journal_table", {
    ajaxURL: 'http://shmelevvl.ru:3000/table-api/labs/pribors/k.korostelev',
    ajaxParams:{ work_st_arr: ["Выдан", "Готов к выдаче"] },
    height: "calc(100vh - 100px)",
    // layout:"fitDataStretch",
    // width:"",
    columnDefaults: {
      headerHozAlign: "center",
      headerWordWrap: true,
      hozAlign: "center",
      width: 150
    },
    pagination: true,
    paginationCounter: "rows",
    paginationButtonCount: 3,
    locale: true,
    langs: ru_pribors,
    columns: [
      { title: "Номер заказа", field: "order_id", headerFilter: "input"},
      { title: "Лаба", field: "target_lab", headerFilter: "input"},
      { title: "Тип СИ", field: "mi_type", width: 200, headerFilter: "input"},
      { title: "Зав. номер", field: "factory_num", headerFilter: "input", width: 200},
      { title: "Блоки (для составных СИ)", field: "blocks"},
      { title: "Вид работ МС", field: "work_typeMS"},
      { title: "Год выпуска прибора", field: "god_vipuska"},
      { title: "Комментарий", field: "comment", editor: "textarea"},
      { title: "Поверитель", width: 200, field: "verificator"},
      { title: "Заключение", field: "conclusion", headerFilter:"input"},
      { title: "Причина непригодности", width: 200, field: "brakReason", editor: "textarea"},
      { title: "Дата поверки", field: "verif_date", headerFilter: "input"},
      { title: "Дата действия поверки", field: "valid_date"},
      { title: "Объем поверки", field: "range", width: 220},

    ],
  })
  
}

$('#journal-tab').on('show.bs.tab', () => createJournal())