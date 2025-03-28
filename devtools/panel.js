// You can add your panel-specific logic here
console.log('Panel script loaded');

// Example: Add a button to inspect the current page
const button = document.createElement('button');
button.textContent = 'Inspect Page';
button.addEventListener('click', () => {
  chrome.devtools.inspectedWindow.eval(
    "console.log('Page inspected from MyDevTools panel');",
    (result, isException) => {
      if (isException) {
        console.error('Error:', isException);
      }
    },
  );
});
document.body.appendChild(button);
