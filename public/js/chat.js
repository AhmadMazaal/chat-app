const socket = io();
const form = document.querySelector("#form");
const input = form.querySelector("input");
const submitBtn = document.querySelector("#btn-submit");
const shareBtn = document.querySelector("#btn-share");
const messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const sidebar = document.querySelector("#sidebar");
const modal = document.querySelector("#myModal");
const closed = document.getElementsByClassName("close")[0];

const autoscroll = () => {
  const $newMessage = messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  const visibleHeight = messages.offsetHeight;
  const containerHeight = messages.scrollHeight;
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};
const { displayName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    displayName: message.displayName,
    message: message.message,
    timestamp: moment(message.createdAt).format("h:mm A"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    displayName: message.displayName,
    location: message.location,
    timestamp: moment(message.createdAt).format("h:mm A"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});
const submit = (e) => {
  e.preventDefault();
  submitBtn.setAttribute("disabled", "true");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (err) => {
    submitBtn.removeAttribute("disabled");
    if (err) return (modal.style.display = "block");
    input.value = "";
    input.focus();
    // console.log("Message delivered!");
  });
};

const getLocation = () => {
  if (!navigator.geolocation)
    return alert("Your browser does not support Geolocation! ");

  shareBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        shareBtn.removeAttribute("disabled");
        // console.log("Location shared!");
      }
    );
  });
};
form.addEventListener("submit", submit);
shareBtn.addEventListener("click", getLocation);

socket.emit("join", { displayName, room }, (err) => {
  if (err) {
    alert(err);
    location.href = "/";
  }
});
closed.onclick = () => (modal.style.display = "none");
