# Fog of War VTT - Setup Instructions

## Prerequisites
- Node.js installed on your laptop ([download here](https://nodejs.org/))
- All devices on the same local network (WiFi/Ethernet)

## Installation Steps

### 1. Create Project Folder
```bash
mkdir fog-of-war-vtt
cd fog-of-war-vtt
```

### 2. Create Files
Create these three files in your project folder:

**`package.json`** - Copy from the package.json artifact

**`server.js`** - Copy from the VTT WebSocket Server artifact

**`public/index.html`** - Create a `public` folder, then copy the HTML artifact into it

Your folder structure should look like:
```
fog-of-war-vtt/
├── package.json
├── server.js
└── public/
    └── index.html
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
```bash
npm start
```

You should see a message showing the server is running on port 3000.

### 5. Find Your Laptop's IP Address

**Windows:**
1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" (usually looks like `192.168.1.xxx`)

**Mac:**
1. Open System Preferences → Network
2. Your IP is shown in the active connection
3. OR open Terminal and type: `ifconfig | grep "inet "`

**Linux:**
1. Open Terminal
2. Type: `ip addr show`
3. Look for `inet` under your active connection

### 6. Connect!

**GM (You):**
- Open your browser to: `http://localhost:3000`
- Check the "GM Mode" checkbox to see the full map without fog

**Players:**
- Give them your IP address (e.g., `192.168.1.100`)
- They open: `http://192.168.1.100:3000`
- They'll see the fog of war

## Using the VTT

### For GM:
1. Upload a map using the "Upload Map" button
2. Enable "GM Mode" to see everything without fog
3. Watch as players explore - you'll see their token move in real-time
4. Use "Reset" to clear all exploration and start fresh

### For Players:
1. Use **Arrow Keys** or **WASD** to move the party token
2. As you move, the map reveals around you
3. **Click and drag** to pan around the map
4. Use the zoom buttons to zoom in/out

### Features:
- ✅ Real-time synchronization across all devices
- ✅ GM can see full map while players see fog
- ✅ Adjustable reveal radius
- ✅ Persistent exploration (revealed areas stay revealed)
- ✅ Reset button to start fresh
- ✅ Connection status indicator
- ✅ Pan and zoom controls

## Troubleshooting

**Players can't connect:**
- Make sure all devices are on the same WiFi network
- Check your laptop's firewall settings (may need to allow port 3000)
- Windows: Allow Node.js through Windows Defender Firewall
- Mac: System Preferences → Security & Privacy → Firewall → Firewall Options → Allow Node

**Connection drops:**
- Make sure your laptop doesn't go to sleep
- Check WiFi signal strength

**Performance issues:**
- Reduce the reveal radius
- Use a smaller map image (recommend under 2MB)
- Close unnecessary browser tabs

## Tips

- Keep your laptop plugged in during sessions
- Test the connection before your game session
- Have players bookmark the URL for easy access
- The server remembers the last game state, so if someone disconnects and reconnects, they'll catch up

## Stopping the Server

Press `Ctrl+C` in the terminal window where the server is running.

---

Enjoy your game! 🎲