# 🔌 BringID browser extension

A browser extension that connects with a notary and proxy server for blockchain-related interactions.

---

## 🚀 Requirements

- **Node.js** version **20** or higher
- **Yarn** package manager
- A valid `.env` file (see below)

---

## 📁 Environment Variables

Before running the extension, create a `.env` file in the root directory with the following content:

```
export NOTARY_URL="https://notary-production-ae4d.up.railway.app"
export PROXY_URL="wss://proxy-production-2e63.up.railway.app/websockify"
export CHAIN_ID="84532"
```

**Note:**  
Make sure to load these environment variables in your terminal session before running any commands, or use a tool like `dotenv`.

---

## 📦 Install Dependencies

Use `yarn` to install all necessary packages:

```
yarn
```

---

## 👨‍💻 Development Mode

To start the extension in development mode (with hot reload, source maps, etc.):

```
yarn dev
```

This will build the extension into a temporary development directory.

---

## 🛠 Production Build

To generate a production-ready build of the extension:

```
yarn build
```

This will create a `build/` folder containing the compiled extension.

### ➕ Load into Browser

1. Open your browser (e.g., Chrome or Edge)
2. Go to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **"Load unpacked"**
5. Select the generated `build/` folder

---

## 🧹 Linting

To automatically fix lint issues:

```
yarn lint:fix
```

---

## ✨ Credits

Built with ❤️ by BringID
