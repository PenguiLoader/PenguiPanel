# PenguiPanel
An advanced version of PenguiLoader without the GUI, complete with the old look and feel.

# How To Use

## Prerequisites:

- A 64-bit Linux/Windows Machine
- [Latest JDK](https://www.oracle.com/java/technologies/downloads/) (Depends on the Minecraft Server Version You Want to Run)

## Recommended Specifications:

- At least 1GB of Allocated RAM
- A CPU with good single-core performance

## Instructions

1. Download the latest executable file for your OS in the releases section.
2. Run the file and follow the installation wizard. **⚠ At this stage, you may be prompted that the file is unsafe by Windows Defender or by Your Browser. This is because PenguiPanel is not commonly downloaded or because we do not have a special signed executable as they cost some cash (On this note, donations would come in handy!)**
3. Start the Server, Add Commands or Configure PenguiPanel to your Likings in Settings!

## How To Join/Ngrok Configuration

Now, to join the server. Since the server is running locally on your machine, it is not accessible to the rest of the internet outside of your own Wi-Fi network. You can fix this by [Port Forwarding Manually](https://www.hostinger.com/tutorials/how-to-port-forward-a-minecraft-server) but this can be a pain. So, you can configure Ngrok instead. Here are the steps:

1. Go to https://ngrok.com and create an account.
2. In the side panel, Go to Getting Started > Your Authtoken and copy your Authtoken.
3. In PenguiPanel, Go to PenguiPanel Options > Set-Up Port Forwarding.
4. Right Click to paste in your Authtoken when prompted.
5. You're Done! Every time you turn on the server the public IP will be displayed in the statistics table.

⚠ Also, Ngrok provides **Dynamic IP Addresses**. This means that the IP address changes every single time you restart the server. EDIT: Since Ngrok has added the domains feature, which allows 1 free domain for non-paid users, we will be experimenting with static IPs soon!

# FAQ

## Why can I not join my Minecraft Server?

This is likely because it has not yet started. Especially if this is the first time you are starting a server, sometimes it can take a while to set everything up. You can check this by looking at your statistics table where the "Ready" parameter will be set to true if the server has done loading.

This could also be a port forwarding issue. Check your manual/ngrok configuration and be sure not to use old ngrok dynamic IPs!