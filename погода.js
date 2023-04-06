function dateFromRev() {

  google.script.run.withSuccessHandler(update_pogoda).getLastDate()
  alert("Погода внесена!")
}

function pog() { // считать погоду из модального окна 
  const mass = {}
  mass.temp = document.querySelector(".form-control#temp").value
  mass.wet = document.querySelector(".form-control#wet").value
  // mass.press = document.querySelector(".form-control#press").value
  return mass
}

function update_pogoda(data) { // отправить погоду в таблицу
  var pogoda = pog()
  var last_date = data
  var today = new Date(Date.now())
  today = today.toLocaleDateString()
  console.log("сегодня: " + today)
  if (last_date != today) {
    console.log("нужно вставить новую строку")
    google.script.run.withSuccessHandler((pogoda) => {
      google.script.run.update_pog('Погода!K4', [[pogoda.temp, pogoda.wet]])
    }).insertNewRow(pogoda) // в successhandler записывать погоду в ячейки    
  }
  else {
    console.log("нужно только записать погоду")
    google.script.run.update_pog('Погода!K4', [[pogoda.temp, pogoda.wet]])
  }
}

function getLastDate() { // последняя дата с погодой
  return API_VL.get(prib_pov, "Погода!A4").flat()
}
