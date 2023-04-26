// ---------------LocalStorage----------------
function checkLocalStorage(response) { // Фильтрация входящий данных из сервера по данным из локального хранилища
    let data = window.localStorage.getItem('TakenOrders')
    data ? compareObj(response, JSON.parse(data)) : response    
    // if (data) {
    //     data = JSON.parse(data)
    //     // console.log(data)
    //     let result = compareObj(response, data)
    //     console.log(result)
    //     return result
    // }
    // else {
    //     return response
    // }
}

function compareObj(main_mass, massforfilter) { // возвращает массив с вычетом приборов из локального хранилища   
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

function updateLocal(file, data) { // пополнение локального храницища данными
    let local = window.localStorage.getItem(file)
    if (local) {
        local = JSON.parse(local)
        data = local.concat(data)
    }
    data = JSON.stringify(data)
    window.localStorage.setItem(file, data)
    return 'ok'
}
// ------------------------------------------
async function sendtoBase(status, pribors) { // Изменение статуса прибора, отправка на сервер
    let prib_status = {
        status: status,
        pribors: pribors
    }
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
// ------------------База реестров----------------
async function getReestrs() {
    let url = 'http://www.shmelevvl.ru:3000/table-api/reestrs'
    let response = await fetch(url)
    response = await response.json()
    // console.log(response);
    return reestrVocabulary(response)
} 

// async function getReestrs() {
//     let url = 'http://www.shmelevvl.ru:3000/table-api/reestrs'
//     let response = await fetch(url)
//     response = await response.json()
//     console.log(response);
//     return response
// }

function reestrVocabulary(data) {
    let reestr_mpi = {}
    let manufacturer = []
    let temp = []
    data.forEach(element => {
        let search_name = element.reg_num + " " + element.name_type_si + " " + element.type_si
        reestr_mpi[search_name] = element.mpi
        temp.push(element.manufacturer)
        // element.reg_num = element
    });
    temp = new Set(temp) // получаем уникальные значения
    for (let value of temp){   
        manufacturer.push(value)     
    }    
    return [data, reestr_mpi, manufacturer]
}
// -----------------Расчет даты поверки------------------

function calcdate(verif_date, mpi) {
    let verif_date_arr = verif_date.split(".");
    verif_date = new Date(verif_date_arr[2], verif_date_arr[1] - 1, verif_date_arr[0])
    let valid_date = new Date()
    valid_date.setFullYear(Number(verif_date.getFullYear()) + Number(mpi), verif_date.getMonth(), verif_date.getDate() - 1);
    return valid_date.toLocaleDateString('ru-RU')
}

function validDate(reg_num_name, verif_date) {
    let mpi = reestr_mpi[reg_num_name]
    return (mpi.length < 4) ? (calcdate(verif_date, mpi)) : (mpi)

    // if (mpi.length < 4) {
    //     // let verif_date = "20.04.2023"
    //     let verif_date_arr = verif_date.split(".");
    //     verif_date = new Date(verif_date_arr[2], verif_date_arr[1] - 1, verif_date_arr[0])
    //     let valid_date = new Date()
    //     valid_date.setFullYear(Number(verif_date.getFullYear()) + Number(mpi), verif_date.getMonth(), verif_date.getDate() - 1);
    //     return valid_date.toLocaleDateString('ru-RU')
    // }
    // else {
    //     return mpi
    // }
}

function updateValidDate(row, reg_num_name, verif_date) {
    let valid_date = validDate(reg_num_name, verif_date)
    row.update({ "valid_date": valid_date });
}

function isEmpty(value) {
    return (value == null || value == "") ? true
        : false
}

function calcValidDate(e, cell) { // event, получаем необходимые значения 
    workspace_table.getSelectedRows().forEach(row => {
        let verif_date = row.getCell("verif_date").getValue()
        let reg_num_name = row.getCell("reg_num_name").getValue()
        updateValidDate(row, reg_num_name, verif_date)
    })
}

// --------------------Валидация данных------------------------------
var check_data = function (cell, value, parameters) { // валидация столбца дата действия поверки
    let current_row = cell.getRow()
    let concl = current_row.getCell('conclusion').getValue()
    return (concl == "Непригодно" && value) ? false
        : (concl == "Пригодно" && isEmpty(value)) ? false
            : true
}

function validation(selectedRows) { // валидация всех выделенных строк
    let flag = true
    selectedRows.forEach(row => {
        let valid = row.validate();
        if (valid != true) {
            valid.forEach(cell => {
                cell.getElement().classList.add("is-invalid") //tabulator-validation-fail             
            })
            flag = false
        }
    })
    return flag
}
