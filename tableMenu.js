let card_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-postcard" viewBox="0 0 16 16">  <path fill-rule="evenodd" d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2ZM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm7.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7ZM2 5.5a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1H2.5a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1H2.5a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1H2.5a.5.5 0 0 1-.5-.5ZM10.5 5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3ZM13 8h-2V6h2v2Z"/></svg>'
let trash_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/></svg>'

var rowMenu = [
    {
        label: trash_icon + ' Удалить строку',
        // disabled:true,
        action: function (e, row) {
            localStorage.removeItem("work_in_progress")
            row.delete()// удаляет выбранные строки       
            let updated_data = JSON.stringify(table.getData()) // перезаписывает локальный файл данных
            localStorage.setItem("work_in_progress", updated_data)
        }
    },
    {
        label: card_icon + " Карточка прибора (disabled)",
        disabled: true,
        action: function (e, row) {
            // открыть карточку прибора 
        }
    },
]

var headerMenu = function () {
    var menu = [];
    var columns = this.getColumns();
    columns.shift()    
    for (let column of columns) {
        //create checkbox element using font awesome icons
        let icon = document.createElement("i");
        icon.classList.add("bi");
        icon.classList.add(column.isVisible() ? "bi-check-square" : "bi-square");
        //build label
        let label = document.createElement("span");
        let title = document.createElement("span");
        title.textContent = " " + column.getDefinition().title;
        label.appendChild(icon);
        label.appendChild(title);
        //create menu item
        menu.push({
            label: label,
            action: function (e) {
                //prevent menu closing
                e.stopPropagation();
                //toggle current column visibility
                column.toggle();
                //change menu item icon
                if (column.isVisible()) {
                    icon.classList.remove("bi-square");
                    icon.classList.add("bi-check-square");
                }
                else {
                    icon.classList.remove("bi-check-square");
                    icon.classList.add("bi-square");
                }
            }
        });
    }
    return menu;
};