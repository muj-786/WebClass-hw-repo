const socket = io();

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

const usersList = document.getElementById('users-list');
const roomSelect = document.getElementById('room-select');
const roomSwitchSelect = document.getElementById('room-switch-select');
const switchRoomBtn = document.getElementById('switch-room-btn');
const privateSelect = document.getElementById('private-select');
const currentRoomSpan = document.getElementById('current-room');

let currentUsername = null;
let currentRoom = 'General';

function addMessage({ sender, text, to }) {
  const li = document.createElement('li');

  if (sender === 'System') {
    li.classList.add('system');
    li.textContent = text;
  } else if (to && to !== 'All') {
    // Private message styling
    li.classList.add('private');
    if (sender === currentUsername) {
      li.classList.add('self');
      li.textContent = `To ${to} (private): ${text}`;
    } else if (to === currentUsername) {
      li.textContent = `From ${sender} (private): ${text}`;
    } else {
      // Message not for me (shouldn't happen)
      return;
    }
  } else {
    // Public message
    li.textContent = `${sender}: ${text}`;
    if (sender === currentUsername) li.classList.add('self');
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function updateUsersList(users) {
  usersList.innerHTML = '';
  privateSelect.innerHTML = '<option value="All">All (Room)</option>';

  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);

    if (user !== currentUsername) {
      const option = document.createElement('option');
      option.value = user;
      option.textContent = user;
      privateSelect.appendChild(option);
    }
  });
}

joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const room = roomSelect.value;

  if (!username) {
    alert('Please enter a username');
    return;
  }

  currentUsername = username;
  currentRoom = room;
  currentRoomSpan.textContent = room;

  socket.emit('login', { username, room });

  loginContainer.style.display = 'none';
  chatContainer.style.display = 'block';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!input.value) return;

  socket.emit('chat message', { text: input.value, to: privateSelect.value });
  input.value = '';
});

switchRoomBtn.addEventListener('click', () => {
  const newRoom = roomSwitchSelect.value;
  if (newRoom !== currentRoom) {
    currentRoom = newRoom;
    currentRoomSpan.textContent = newRoom;
    socket.emit('switch room', newRoom);
    messages.innerHTML = '';
    privateSelect.innerHTML = '<option value="All">All (Room)</option>';
  }
});

socket.on('chat message', (msg) => {
  addMessage(msg);
});

socket.on('message history', (history) => {
  messages.innerHTML = '';
  history.forEach(addMessage);
});

socket.on('room users', (users) => {
  updateUsersList(users);
});
