const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', () => {
  console.log('open connection');
});

ws.addEventListener('close', () => {
  console.log('close connection');
});

ws.addEventListener('message', (e) => {
  console.log(e);
});

//

const uploadBtn = document.querySelector('.uploadBtn');
const files = document.querySelector('.files');

uploadBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  [...files.files].forEach((file) => {
    formData.append('sounds', file);
  });

  try {
    const data = await fetch('http://localhost:3000/api/sounds', {
      method: 'POST',
      body: formData,
    }).then((res) => res.json());
    console.log(data);
  } catch (error) {
    console.log(error);
  }
});
