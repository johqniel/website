const message: string = "Hallo TypeScript!";
console.log(message);

const h1 = document.createElement("h1");
h1.textContent = message;
document.body.appendChild(h1);

console.log("✅ TypeScript läuft!");
document.body.innerHTML = "<h1>Hallo TypeScript!</h1>";