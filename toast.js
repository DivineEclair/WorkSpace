
let button = document.querySelector("#showtoast"),
    toast = document.querySelector(".toast-alert"),
    closeIcon = document.querySelector(".close"),
    progress = document.querySelector(".progress");
//   document.querySelector("body > div > div.toast-content > div > span.text.text-2").textContent =""

let timer1, timer2;

function showAlert(text){
  document.querySelector("body > main > div.toast-alert > div.toast-content > div > span.text.text-2").textContent = text  
  toast.classList.add("active");
  progress.classList.add("active");

  timer1 = setTimeout(() => {
    toast.classList.remove("active");
    toast.classList.remove("closing");
  }, 5000); //1s = 1000 milliseconds

  timer2 = setTimeout(() => {
    progress.classList.remove("active");
  }, 5300);
}

closeIcon.addEventListener("click", () => {
  // 
  toast.classList.add("closing");

  setTimeout(() => {
    progress.classList.remove("active");
    toast.classList.remove("active");
    toast.classList.remove("closing");
  }, 1000);

  clearTimeout(timer1);
  clearTimeout(timer2);
});
